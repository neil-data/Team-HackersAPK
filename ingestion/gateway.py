"""
ingestion/gateway.py — Ingestion Gateway (Layer 1 of the architecture).

Responsibilities, per the architecture diagram:
  1. Accept an uploaded sample
  2. Hash it on intake (SHA-256) — this becomes the sample_id used
     throughout the entire pipeline
  3. Dedup check — if this hash was already submitted, don't
     re-queue it, return the existing case reference instead
  4. Run India-scam pre-triage (fast heuristic, see
     india_scam_triage.py) to help order the isolation queue
  5. Push the job onto the isolation queue (Redis) for the
     Isolation Controller to pick up

This is intentionally a separate, small FastAPI app from
backend/app/main.py — matches the architecture diagram's "Ingestion
Gateway" being its own box, decoupled from the case-serving API.
In a real deployment these could be separate containers; for the
hackathon demo they can run on different ports on the same box.

Run with:
    uvicorn ingestion.gateway:app --port 8001
"""

import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel

from ingestion.india_scam_triage import triage_sample

try:
    import redis
except ImportError:
    redis = None


app = FastAPI(title="SentinelScan Ingestion Gateway")

QUEUE_KEY = "isolation_queue"
SEEN_HASHES_KEY = "seen_sample_hashes"

_redis_client = None


class _InMemoryQueueFallback:
    """Minimal Redis-like fallback (list + set operations only) for dev without Redis."""
    _singleton = None

    def __init__(self):
        self._queue: list[str] = []
        self._seen: set[str] = set()

    @classmethod
    def instance(cls):
        if cls._singleton is None:
            cls._singleton = cls()
        return cls._singleton

    def sismember(self, key, value):
        return value in self._seen

    def sadd(self, key, value):
        self._seen.add(value)

    def rpush(self, key, value):
        self._queue.append(value)

    def lpush(self, key, value):
        self._queue.insert(0, value)

    def llen(self, key):
        return len(self._queue)


def get_redis():
    """
    Lazy Redis connection. If REDIS_URL isn't set or redis isn't
    installed, falls back to an in-memory store so this is still
    runnable/demoable without Redis up — but a restart loses queue
    state in that fallback mode (fine for dev, not for the real
    isolation controller integration).
    """
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    redis_url = os.environ.get("REDIS_URL")
    if redis and redis_url:
        _redis_client = redis.from_url(redis_url, decode_responses=True)
        try:
            _redis_client.ping()
            return _redis_client
        except Exception:
            _redis_client = None  # fall through to in-memory fallback

    return _InMemoryQueueFallback.instance()


class IngestResponse(BaseModel):
    sample_id: str
    is_duplicate: bool
    triage_flagged: bool
    triage_category: Optional[str] = None
    triage_confidence: float = 0.0
    queue_priority: str = "normal"
    submitted_at: str


@app.post("/ingest", response_model=IngestResponse)
async def ingest_sample(
    file: UploadFile = File(...),
    package_name: Optional[str] = Form(None),
    app_label: Optional[str] = Form(None),
    permissions: Optional[str] = Form(None),  # comma-separated, cheap to pass at intake
):
    """
    Accepts a file upload plus optional cheap metadata (package name,
    app label, permissions) if the caller already has it — e.g. an
    APK's manifest can often be read without full unpacking. If not
    provided, triage is skipped (not every file type has this
    metadata available at intake time — Windows PE samples, for
    instance, won't).
    """
    content = await file.read()
    sha256 = hashlib.sha256(content).hexdigest()

    r = get_redis()

    is_duplicate = bool(r.sismember(SEEN_HASHES_KEY, sha256))

    triage_result = None
    if package_name:
        perm_list = [p.strip() for p in permissions.split(",")] if permissions else []
        triage_result = triage_sample(package_name=package_name, app_label=app_label, permissions=perm_list)

    if not is_duplicate:
        r.sadd(SEEN_HASHES_KEY, sha256)

        job = {
            "sample_id": sha256,
            "filename": file.filename,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "triage": {
                "flagged": triage_result.is_flagged if triage_result else False,
                "category": triage_result.category if triage_result else None,
                "confidence": triage_result.confidence if triage_result else 0.0,
            } if triage_result else None,
        }

        # High-priority (confirmed India-scam pattern) jobs jump the
        # queue instead of going to the back — this is the actual
        # payoff of doing triage at ingestion time.
        if triage_result and triage_result.priority == "high":
            r.lpush(QUEUE_KEY, json.dumps(job))
        else:
            r.rpush(QUEUE_KEY, json.dumps(job))

    return IngestResponse(
        sample_id=sha256,
        is_duplicate=is_duplicate,
        triage_flagged=triage_result.is_flagged if triage_result else False,
        triage_category=triage_result.category if triage_result else None,
        triage_confidence=triage_result.confidence if triage_result else 0.0,
        queue_priority=triage_result.priority if triage_result else "normal",
        submitted_at=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/queue/length")
def queue_length():
    """Debug endpoint — lets you check the isolation queue depth during dev."""
    r = get_redis()
    if isinstance(r, _InMemoryQueueFallback):
        return {"queue_length": len(r._queue), "backend": "in-memory-fallback"}
    return {"queue_length": r.llen(QUEUE_KEY), "backend": "redis"}

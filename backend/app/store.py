"""
backend/app/store.py — In-memory case store.

TODO (Week 3/4 — Member 4 owns storage layer): replace this with real
PostgreSQL persistence per the architecture plan. This exists so the
API is fully functional and demoable TODAY without waiting on the
Postgres schema/migrations to be built. Swapping this out later means
changing only the functions below — routers/cases.py doesn't need to
change since it only calls these functions, not the storage directly.

Data is lost on server restart — expected and fine for now.
"""

from typing import Optional
from threading import Lock

_store: dict[str, dict] = {}
_lock = Lock()


def save_case(sample_id: str, case_data: dict) -> None:
    with _lock:
        _store[sample_id] = case_data


def get_case(sample_id: str) -> Optional[dict]:
    with _lock:
        return _store.get(sample_id)


def list_cases() -> list[dict]:
    with _lock:
        return list(_store.values())


def case_exists(sample_id: str) -> bool:
    with _lock:
        return sample_id in _store
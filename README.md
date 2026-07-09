# PS-4: Unified Cross-Platform Malware Detection & Behavioral Analysis Suite

E-Rakshak 2026 Round 2 — Team HackersAPK

## Structure

- `ingestion/` — ingestion gateway + isolation controller
- `static-analysis/` — APK/PE static modules, YARA rules (incl. India-specific scam rules), ML classifier
- `dynamic-sandbox/` — CAPE config, Android-x86 VM, network capture
- `agents/` — LangGraph orchestrator, MITRE mapper, capability classifier, narrative agent
- `storage/` — Postgres + Elasticsearch schemas
- `backend/` — FastAPI app
- `frontend/` — React dashboard
- `docs/` — weekly documentation (updated every week, not just at the end)
- `infra/` — GCP VM setup scripts

## Setup

1. Copy `.env.example` to `.env` and fill in values
2. `docker-compose up -d`

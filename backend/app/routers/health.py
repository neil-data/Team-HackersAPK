"""
backend/app/routers/health.py — Health check endpoint.

Public (no auth) — this is what the dashboard's "SANDBOX ONLINE"
status pill polls, and what the GCP load balancer / uptime monitor
would hit too.
"""

from fastapi import APIRouter
from backend.app.models.api_models import HealthResponse

router = APIRouter(prefix="/api/health", tags=["health"])

APP_VERSION = "0.1.0-alpha"


@router.get("", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        sandbox_online=False,  # TODO: wire to real GCP sandbox status once Member 2's infra reports health
        version=APP_VERSION,
    )
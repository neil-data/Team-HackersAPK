"""
backend/app/models/api_models.py — Request/response schemas for the API.

These wrap the agent-layer's schema.py types into API-friendly
request/response models. Kept separate from agents/orchestrator/schema.py
because API contracts (what the frontend sees) and internal pipeline
contracts (what agents pass to each other) can evolve independently.
"""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field

from agents.orchestrator.schema import (
    StaticAnalysisOutput,
    DynamicAnalysisOutput,
    MitreTechnique,
    CapabilityTag,
)


class SubmitSampleRequest(BaseModel):
    """
    Body for POST /api/cases/submit.
    In Week 2/3, static/dynamic data is supplied directly (since
    Member 1/2's real services aren't wired to the DB yet). In
    Week 4+, this becomes just {"sample_id": "..."} once static and
    dynamic results are already persisted by their respective modules
    and this endpoint just triggers the agent pipeline against them.
    """
    static_analysis: StaticAnalysisOutput
    dynamic_analysis: Optional[DynamicAnalysisOutput] = None


class CaseSummary(BaseModel):
    """Lightweight summary for list views (case table on the dashboard)."""
    sample_id: str
    platform: str
    file_type: str
    risk_score: int
    status: str  # "malicious" | "suspicious" | "clean" — derived from risk_score
    submitted_at: str


class CaseDetail(BaseModel):
    """Full case detail — matches the agent-layer output contract exactly."""
    sample_id: str
    platform: str
    file_type: str
    risk_score: int
    status: str
    mitre_techniques: list[MitreTechnique]
    capability_tags: list[CapabilityTag]
    narrative_summary: str
    submitted_at: str


class HealthResponse(BaseModel):
    status: str
    sandbox_online: bool
    version: str


def risk_score_to_status(score: int) -> str:
    """Shared logic for turning a numeric score into a dashboard status badge."""
    if score >= 60:
        return "malicious"
    elif score >= 25:
        return "suspicious"
    return "clean"
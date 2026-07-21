"""
backend/app/routers/cases.py — Core API endpoints for submitting
samples and retrieving analysis results.

This is where the agent layer (agents/orchestrator) actually gets
called from a real HTTP request instead of just __main__ test runs.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends

from agents.orchestrator.orchestrator import build_graph
from backend.app.models.api_models import (
    SubmitSampleRequest,
    CaseSummary,
    CaseDetail,
    risk_score_to_status,
)
from backend.app.store import save_case, get_case, list_cases, case_exists
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/cases", tags=["cases"])

_graph = build_graph()  # compiled once at import time, reused across requests


@router.post("/submit", response_model=CaseDetail)
def submit_sample(request: SubmitSampleRequest, current_user: str = Depends(get_current_user)):
    """
    Runs the full agent pipeline (MITRE mapping, capability
    classification, risk scoring, narrative generation) against the
    submitted static/dynamic analysis data, and stores the result.

    WEEK 3 NOTE: once Member 1/2's real static/dynamic services are
    live, this endpoint's request body simplifies to just
    {"sample_id": "..."} and the graph's load_static_analysis /
    load_dynamic_analysis nodes fetch from their real services
    instead of requiring the caller to pass full analysis objects —
    no change needed here in cases.py when that swap happens.
    """
    initial_state = {
        "static_output": request.static_analysis,
        "dynamic_output": request.dynamic_analysis,
    }

    try:
        final_state = _graph.invoke(initial_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline failed: {e}")

    case_data = {
        "sample_id": final_state["sample_id"],
        "platform": request.static_analysis.platform,
        "file_type": request.static_analysis.file_type,
        "risk_score": final_state["risk_score"],
        "status": risk_score_to_status(final_state["risk_score"]),
        "mitre_techniques": [t.model_dump() for t in final_state["mitre_techniques"]],
        "capability_tags": [c.model_dump() for c in final_state["capability_tags"]],
        "narrative_summary": final_state["narrative_summary"],
        "submitted_at": request.static_analysis.submitted_at,
    }

    save_case(case_data["sample_id"], case_data)
    return CaseDetail(**case_data)


@router.get("", response_model=list[CaseSummary])
def get_all_cases(current_user: str = Depends(get_current_user)):
    """Case table data for the dashboard's main list view."""
    cases = list_cases()
    return [
        CaseSummary(
            sample_id=c["sample_id"], platform=c["platform"], file_type=c["file_type"],
            risk_score=c["risk_score"], status=c["status"], submitted_at=c["submitted_at"],
        )
        for c in cases
    ]


@router.get("/{sample_id}", response_model=CaseDetail)
def get_case_detail(sample_id: str, current_user: str = Depends(get_current_user)):
    """Full case detail for the dashboard's case detail panel."""
    if not case_exists(sample_id):
        raise HTTPException(status_code=404, detail=f"Case {sample_id} not found")
    case_data = get_case(sample_id)
    return CaseDetail(**case_data)
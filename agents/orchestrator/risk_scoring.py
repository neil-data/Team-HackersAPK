"""
risk_scoring.py — Weighted risk score calculation, extracted into its
own module so it's unit-testable in isolation from the graph.

Weighting is intentionally simple and documented here — tune weights
in ONE place if scores don't feel right during demo prep.
"""

from __future__ import annotations
from typing import Optional

from agents.orchestrator.schema import (
    StaticAnalysisOutput,
    DynamicAnalysisOutput,
    MitreTechnique,
    CapabilityTag,
)

# Weight constants — documented and centralized so they're easy to tune
YARA_MATCH_WEIGHT = 15
MITRE_TECHNIQUE_WEIGHT = 8
CAPABILITY_CONFIDENCE_MULTIPLIER = 15
ML_LIKELY_MALICIOUS_BONUS = 20
DYNAMIC_C2_CONFIRMED_BONUS = 20
DYNAMIC_DEVICE_ADMIN_BONUS = 10

MAX_SCORE = 100
MIN_SCORE = 0


def compute_risk_score(
    static: StaticAnalysisOutput,
    dynamic: Optional[DynamicAnalysisOutput],
    mitre: list[MitreTechnique],
    capabilities: list[CapabilityTag],
) -> int:
    score = 0

    score += len(static.yara_matches) * YARA_MATCH_WEIGHT
    score += len(mitre) * MITRE_TECHNIQUE_WEIGHT
    score += sum(int(c.confidence * CAPABILITY_CONFIDENCE_MULTIPLIER) for c in capabilities)

    if static.ml_classifier and static.ml_classifier.classification == "likely_malicious":
        score += ML_LIKELY_MALICIOUS_BONUS

    if dynamic:
        if any(conn.get("flagged_c2") for conn in dynamic.network_connections):
            score += DYNAMIC_C2_CONFIRMED_BONUS
        if any("DevicePolicyManager" in c for c in dynamic.api_calls):
            score += DYNAMIC_DEVICE_ADMIN_BONUS

    return max(MIN_SCORE, min(score, MAX_SCORE))
"""
orchestrator.py — LangGraph agent orchestrator skeleton (Week 2).

Week 2 goal: get the graph structure running end-to-end against MOCK
static-analysis data, so integration with Member 1's real output in
Week 3 is a drop-in swap, not a rebuild.

Graph flow (Week 2 — dynamic/MITRE/narrative nodes are stubs):

    load_static_analysis
            |
            v
    mitre_mapper (STUB — real logic in Week 4)
            |
            v
    capability_classifier (STUB — real logic in Week 4)
            |
            v
    compute_risk_score (basic version, real Week 4)
            |
            v
    narrative_agent (STUB — real logic in Week 4)
            |
            v
          END

Run this file directly to see the mock sample flow through the graph:
    python orchestrator.py
"""

import json
from pathlib import Path

from langgraph.graph import StateGraph, END

from schema import (
    OrchestratorState,
    StaticAnalysisOutput,
    MitreTechnique,
    CapabilityTag,
)


# ---------------------------------------------------------------------
# Node implementations
# ---------------------------------------------------------------------

def load_static_analysis(state: OrchestratorState) -> OrchestratorState:
    """
    Week 2: loads mock static analysis JSON from disk.
    Week 3+: this becomes a real fetch from Member 1's static-analysis
    service/DB, keyed by sample_id. Swap the mock load for a real
    call here — the rest of the graph doesn't need to change.
    """
    mock_path = Path(__file__).parent / "mock_data" / "static_analysis_sample.json"
    with open(mock_path) as f:
        raw = json.load(f)
    raw.pop("_comment", None)

    static_output = StaticAnalysisOutput.model_validate(raw)

    print(f"[load_static_analysis] Loaded sample {static_output.sample_id} "
          f"({static_output.platform})")

    return {
        **state,
        "sample_id": static_output.sample_id,
        "static_output": static_output,
    }


def mitre_mapper(state: OrchestratorState) -> OrchestratorState:
    """
    STUB for Week 2. Real logic (Week 4): map YARA rule hits + manifest
    permissions + extracted strings to MITRE ATT&CK technique IDs using
    a rules table or LLM-assisted mapping.

    For now: a tiny hardcoded lookup so the graph runs end-to-end and
    produces a plausible-looking output for demoing the pipeline shape.
    """
    static = state["static_output"]
    techniques: list[MitreTechnique] = []

    flags = static.static_risk_flags
    if "requests_sms_and_overlay_together" in flags:
        techniques.append(MitreTechnique(
            technique_id="T1517",
            technique_name="Access Notifications",
            confidence=0.8,
        ))
    if "hardcoded_c2_ip" in flags:
        techniques.append(MitreTechnique(
            technique_id="T1071",
            technique_name="Application Layer Protocol (C2)",
            confidence=0.75,
        ))

    print(f"[mitre_mapper] Mapped {len(techniques)} technique(s) (STUB LOGIC)")

    return {**state, "mitre_techniques": techniques}


def capability_classifier(state: OrchestratorState) -> OrchestratorState:
    """
    STUB for Week 2. Real logic (Week 4): classify capability
    (keylogging / OTP-theft / GPS tracking / screen-capture) from
    combined static + dynamic signals.
    """
    static = state["static_output"]
    tags: list[CapabilityTag] = []

    perms = static.android_manifest.permissions if static.android_manifest else []
    if "android.permission.READ_SMS" in perms:
        tags.append(CapabilityTag(
            capability="sms_otp_theft",
            confidence=0.85,
            evidence=["READ_SMS permission", "matches india_scam YARA rule"],
        ))
    if "android.permission.ACCESS_FINE_LOCATION" in perms:
        tags.append(CapabilityTag(
            capability="gps_tracking",
            confidence=0.6,
            evidence=["ACCESS_FINE_LOCATION permission"],
        ))

    print(f"[capability_classifier] Tagged {len(tags)} capability/ies (STUB LOGIC)")

    return {**state, "capability_tags": tags}


def compute_risk_score(state: OrchestratorState) -> OrchestratorState:
    """
    Basic weighted score for Week 2 — good enough to demo the Risk
    Score dashboard feature. Refine weighting in Week 4 once dynamic
    signals are available too.
    """
    score = 0
    static = state["static_output"]

    score += len(static.yara_matches) * 15
    score += len(state.get("mitre_techniques", [])) * 10
    score += len(state.get("capability_tags", [])) * 10

    if static.ml_classifier and static.ml_classifier.classification == "likely_malicious":
        score += 25

    score = min(score, 100)

    print(f"[compute_risk_score] Risk score: {score}/100")

    return {**state, "risk_score": score}


def narrative_agent(state: OrchestratorState) -> OrchestratorState:
    """
    STUB for Week 2. Real logic (Week 4): call Groq/Kimi via NVIDIA NIM
    to generate the plain-language officer summary from all correlated
    signals. For now, a template string so the graph output is
    demoable end-to-end.
    """
    static = state["static_output"]
    caps = [t.capability for t in state.get("capability_tags", [])]
    cap_text = " and ".join(caps) if caps else "no confirmed malicious capability"

    summary = (
        f"[STUB NARRATIVE] This sample ({static.platform}, "
        f"package: {static.android_manifest.package_name if static.android_manifest else 'n/a'}) "
        f"shows signs of {cap_text}. "
        f"Risk score: {state.get('risk_score', 'n/a')}/100. "
        f"Real LLM-generated narrative arrives in Week 4."
    )

    print(f"[narrative_agent] {summary}")

    return {**state, "narrative_summary": summary}


# ---------------------------------------------------------------------
# Graph assembly
# ---------------------------------------------------------------------

def build_graph():
    graph = StateGraph(OrchestratorState)

    graph.add_node("load_static_analysis", load_static_analysis)
    graph.add_node("mitre_mapper", mitre_mapper)
    graph.add_node("capability_classifier", capability_classifier)
    graph.add_node("compute_risk_score", compute_risk_score)
    graph.add_node("narrative_agent", narrative_agent)

    graph.set_entry_point("load_static_analysis")
    graph.add_edge("load_static_analysis", "mitre_mapper")
    graph.add_edge("mitre_mapper", "capability_classifier")
    graph.add_edge("capability_classifier", "compute_risk_score")
    graph.add_edge("compute_risk_score", "narrative_agent")
    graph.add_edge("narrative_agent", END)

    return graph.compile()


if __name__ == "__main__":
    app = build_graph()
    final_state = app.invoke({})

    print("\n--- FINAL STATE SUMMARY ---")
    print(f"Sample ID: {final_state['sample_id']}")
    print(f"Risk Score: {final_state['risk_score']}")
    print(f"MITRE Techniques: {[t.technique_id for t in final_state['mitre_techniques']]}")
    print(f"Capabilities: {[c.capability for c in final_state['capability_tags']]}")
    print(f"Narrative: {final_state['narrative_summary']}")

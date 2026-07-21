"""
orchestrator.py — LangGraph agent orchestrator (Week 2 — completed).

Graph flow:

    load_static_analysis
            |
            v
    load_dynamic_analysis   (mock for now — real Week 3 swap point)
            |
            v
    mitre_mapper             (real rule engine — mitre_rules.py)
            |
            v
    capability_classifier    (real rule engine — capability_rules.py)
            |
            v
    compute_risk_score       (weighted, uses static + dynamic signals)
            |
            v
    narrative_agent          (real Groq call, graceful fallback — narrative.py)
            |
            v
          END

SWAP POINTS FOR WEEK 3 (clearly marked below with "WEEK 3 SWAP"):
  1. load_static_analysis  -> replace mock file read with Member 1's real service/DB call
  2. load_dynamic_analysis -> replace mock file read with Member 2's real CAPE/sandbox output

Everything downstream of those two loaders (mapping, classification,
scoring, narrative) already runs on real logic and does NOT need to
change when the swap happens — that was the whole point of building
against a locked mock schema in Week 2.

Run directly:
    python orchestrator.py
"""

import json
from pathlib import Path

from langgraph.graph import StateGraph, END

from agents.orchestrator.schema import (
    OrchestratorState,
    StaticAnalysisOutput,
    DynamicAnalysisOutput,
)
from agents.mitre_mapper.mitre_rules import map_to_mitre
from agents.capability_classifier.capability_rules import classify_capabilities
from agents.narrative_agent.narrative import generate_narrative
from agents.orchestrator.risk_scoring import compute_risk_score as _compute_risk_score


MOCK_DATA_DIR = Path(__file__).parent / "mock_data"


# ---------------------------------------------------------------------
# Node implementations
# ---------------------------------------------------------------------

def load_static_analysis(state: OrchestratorState) -> OrchestratorState:
    """
    WEEK 3 SWAP: replace this mock file read with a real fetch from
    Member 1's static-analysis service/DB, keyed by sample_id. Nothing
    else in the graph needs to change as long as the returned shape
    still validates against schema.StaticAnalysisOutput.

    If static_output is already present in the incoming state (e.g.
    injected by the backend API from a real request), skip the mock
    file read entirely and use that instead — this is what lets
    backend/app/routers/cases.py drive the graph with real submitted
    data instead of only the hardcoded demo sample.
    """
    if state.get("static_output") is not None:
        static_output = state["static_output"]
        print(f"[load_static_analysis] Using injected static data for {static_output.sample_id} "
              f"({static_output.platform})")
        return {**state, "sample_id": static_output.sample_id}

    with open(MOCK_DATA_DIR / "static_analysis_sample.json") as f:
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


def load_dynamic_analysis(state: OrchestratorState) -> OrchestratorState:
    """
    WEEK 3 SWAP: replace this mock file read with a real fetch from
    Member 2's CAPE/sandbox output once the GCP detonation plane is
    live. Until then, the graph runs fully against this mock so every
    downstream node (MITRE mapping, capability classification, risk
    score, narrative) can be built and tested now.

    Same injection pattern as load_static_analysis above — if
    dynamic_output key already exists in state (even if None, meaning
    "explicitly no dynamic data yet"), that's respected instead of
    falling back to the mock file.
    """
    if "dynamic_output" in state:
        dynamic_output = state["dynamic_output"]
        if dynamic_output is not None:
            print(f"[load_dynamic_analysis] Using injected dynamic data for {dynamic_output.sample_id}")
        else:
            print("[load_dynamic_analysis] Explicitly no dynamic data provided — continuing static-only")
        return state

    dynamic_path = MOCK_DATA_DIR / "dynamic_analysis_sample.json"

    if not dynamic_path.exists():
        print("[load_dynamic_analysis] No dynamic data available — continuing static-only")
        return {**state, "dynamic_output": None}

    with open(dynamic_path) as f:
        raw = json.load(f)
    raw.pop("_comment", None)

    dynamic_output = DynamicAnalysisOutput.model_validate(raw)

    print(f"[load_dynamic_analysis] Loaded dynamic data for {dynamic_output.sample_id} "
          f"({len(dynamic_output.api_calls)} API calls, "
          f"{len(dynamic_output.network_connections)} network connection(s))")

    return {**state, "dynamic_output": dynamic_output}


def mitre_mapper(state: OrchestratorState) -> OrchestratorState:
    """Real rule-based MITRE ATT&CK mapping — see mitre_rules.py."""
    techniques = map_to_mitre(state["static_output"], state.get("dynamic_output"))
    print(f"[mitre_mapper] Mapped {len(techniques)} technique(s): "
          f"{[t.technique_id for t in techniques]}")
    return {**state, "mitre_techniques": techniques}


def capability_classifier(state: OrchestratorState) -> OrchestratorState:
    """Real rule-based capability classification — see capability_rules.py."""
    tags = classify_capabilities(state["static_output"], state.get("dynamic_output"))
    print(f"[capability_classifier] Tagged {len(tags)} capability/ies: "
          f"{[t.capability for t in tags]}")
    return {**state, "capability_tags": tags}


def compute_risk_score(state: OrchestratorState) -> OrchestratorState:
    """Delegates to risk_scoring.py — see that module for the weighting logic."""
    score = _compute_risk_score(
        static=state["static_output"],
        dynamic=state.get("dynamic_output"),
        mitre=state.get("mitre_techniques", []),
        capabilities=state.get("capability_tags", []),
    )
    print(f"[compute_risk_score] Risk score: {score}/100")
    return {**state, "risk_score": score}


def narrative_agent(state: OrchestratorState) -> OrchestratorState:
    """Real narrative generation via Groq, with graceful template fallback."""
    summary = generate_narrative(
        static=state["static_output"],
        dynamic=state.get("dynamic_output"),
        mitre=state.get("mitre_techniques", []),
        capabilities=state.get("capability_tags", []),
        risk_score=state.get("risk_score", 0),
    )
    print(f"[narrative_agent] {summary}")
    return {**state, "narrative_summary": summary}


# ---------------------------------------------------------------------
# Graph assembly
# ---------------------------------------------------------------------

def build_graph():
    graph = StateGraph(OrchestratorState)

    graph.add_node("load_static_analysis", load_static_analysis)
    graph.add_node("load_dynamic_analysis", load_dynamic_analysis)
    graph.add_node("mitre_mapper", mitre_mapper)
    graph.add_node("capability_classifier", capability_classifier)
    graph.add_node("compute_risk_score", compute_risk_score)
    graph.add_node("narrative_agent", narrative_agent)

    graph.set_entry_point("load_static_analysis")
    graph.add_edge("load_static_analysis", "load_dynamic_analysis")
    graph.add_edge("load_dynamic_analysis", "mitre_mapper")
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
    print(f"Narrative:\n{final_state['narrative_summary']}")
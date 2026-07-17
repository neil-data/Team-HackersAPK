"""
test_orchestrator_deep.py — Stress-test the agent pipeline against
scenarios beyond the one happy-path mock sample.

Run from repo root:
    python -m agents.orchestrator.test_orchestrator_deep

This does NOT modify any of your real files — it's a standalone
test script. Delete it once you're confident, or keep it in
agents/orchestrator/ as a regression check before Week 3 integration.
"""

import traceback

from agents.orchestrator.schema import (
    StaticAnalysisOutput,
    DynamicAnalysisOutput,
    AndroidManifestInfo,
    PEAnalysisInfo,
    ExtractedStrings,
    MLClassifierResult,
    YaraMatch,
)
from agents.mitre_mapper.mitre_rules import map_to_mitre
from agents.capability_classifier.capability_rules import classify_capabilities
from agents.narrative_agent.narrative import generate_narrative


def run_scenario(name: str, static: StaticAnalysisOutput, dynamic):
    print(f"\n{'='*70}\nSCENARIO: {name}\n{'='*70}")
    try:
        mitre = map_to_mitre(static, dynamic)
        capabilities = classify_capabilities(static, dynamic)

        score = 0
        score += len(static.yara_matches) * 15
        score += len(mitre) * 8
        score += sum(int(c.confidence * 15) for c in capabilities)
        if static.ml_classifier and static.ml_classifier.classification == "likely_malicious":
            score += 20
        if dynamic:
            if any(conn.get("flagged_c2") for conn in dynamic.network_connections):
                score += 20
            if any("DevicePolicyManager" in c for c in dynamic.api_calls):
                score += 10
        score = max(0, min(score, 100))

        narrative = generate_narrative(static, dynamic, mitre, capabilities, score)

        print(f"  MITRE techniques : {[t.technique_id for t in mitre]}")
        print(f"  Capabilities     : {[c.capability for c in capabilities]}")
        print(f"  Risk score       : {score}/100")
        print(f"  Narrative        : {narrative[:150]}...")
        print(f"  STATUS: PASS (no crash)")
    except Exception as e:
        print(f"  STATUS: *** FAIL ***")
        print(f"  Exception: {e}")
        traceback.print_exc()


# ---------------------------------------------------------------------
# Scenario 1: Completely benign sample — no permissions, no YARA hits,
# no dynamic behavior. Pipeline should report LOW risk, not crash or
# falsely flag anything.
# ---------------------------------------------------------------------
benign_static = StaticAnalysisOutput(
    sample_id="benign001",
    sha256="0" * 64,
    platform="android",
    file_type="apk",
    file_size_bytes=1200000,
    submitted_at="2026-07-17T10:00:00Z",
    yara_matches=[],
    android_manifest=AndroidManifestInfo(
        package_name="com.example.calculator",
        permissions=["android.permission.INTERNET"],
        requested_sdk=34,
        exported_components=[],
    ),
    pe_analysis=None,
    extracted_strings=ExtractedStrings(urls=[], ips=[], suspicious_keywords=[]),
    ml_classifier=MLClassifierResult(model="isolation_forest_v1", anomaly_score=0.05, classification="benign"),
    static_risk_flags=[],
)
run_scenario("Benign sample, no dynamic data", benign_static, None)


# ---------------------------------------------------------------------
# Scenario 2: Windows PE sample — android_manifest is None. This is
# the case most likely to crash if any rule assumes Android fields
# exist unconditionally.
# ---------------------------------------------------------------------
windows_static = StaticAnalysisOutput(
    sample_id="win_pe_001",
    sha256="1" * 64,
    platform="windows",
    file_type="exe",
    file_size_bytes=850000,
    submitted_at="2026-07-17T10:05:00Z",
    yara_matches=[
        YaraMatch(rule_name="generic_trojan_dropper", category="generic", severity="high",
                   description="Matches known dropper pattern"),
    ],
    android_manifest=None,
    pe_analysis=PEAnalysisInfo(
        imports=["WININET.dll", "ADVAPI32.dll"],
        sections=[".text", ".data", ".rsrc"],
        compile_timestamp="2026-06-01T00:00:00Z",
    ),
    extracted_strings=ExtractedStrings(
        urls=["http://malicious-c2.example/gate.php"],
        ips=["45.9.20.11"],
        suspicious_keywords=["keylog", "screenshot"],
    ),
    ml_classifier=MLClassifierResult(model="isolation_forest_v1", anomaly_score=0.91, classification="likely_malicious"),
    static_risk_flags=["hardcoded_c2_ip"],
)
windows_dynamic = DynamicAnalysisOutput(
    sample_id="win_pe_001",
    process_tree=[{"pid": 1, "name": "sample.exe", "children": []}],
    api_calls=["RegSetValueEx", "CreateRemoteThread", "GetKeyboardState"],
    network_connections=[
        {"dest_ip": "45.9.20.11", "dest_port": 8080, "protocol": "tcp",
         "bytes_sent": 5000, "interval_seconds": 30, "flagged_c2": True}
    ],
    files_written=["C:\\Users\\victim\\AppData\\Roaming\\svc.exe"],
    registry_changes=["HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\svc"],
    c2_endpoints_detected=["45.9.20.11:8080"],
)
run_scenario("Windows PE sample (no android_manifest)", windows_static, windows_dynamic)


# ---------------------------------------------------------------------
# Scenario 3: Static-only, no dynamic data yet (this IS the real
# Week 2/3 situation before the sandbox is live for a given sample —
# must not crash while dynamic_output is None).
# ---------------------------------------------------------------------
static_only = StaticAnalysisOutput(
    sample_id="static_only_001",
    sha256="2" * 64,
    platform="android",
    file_type="apk",
    file_size_bytes=3000000,
    submitted_at="2026-07-17T10:10:00Z",
    yara_matches=[
        YaraMatch(rule_name="india_scam_sms_permission_overlay", category="india_scam_rules",
                   severity="high", description="SMS+overlay pattern"),
    ],
    android_manifest=AndroidManifestInfo(
        package_name="com.fastcash.app",
        permissions=["android.permission.READ_SMS", "android.permission.SYSTEM_ALERT_WINDOW"],
        requested_sdk=31,
        exported_components=[],
    ),
    pe_analysis=None,
    extracted_strings=ExtractedStrings(urls=[], ips=[], suspicious_keywords=["otp_capture"]),
    ml_classifier=None,
    static_risk_flags=["requests_sms_and_overlay_together"],
)
run_scenario("Static-only, dynamic sandbox not yet run", static_only, None)


# ---------------------------------------------------------------------
# Scenario 4: Malformed / missing ml_classifier and empty extracted
# strings, to check nothing assumes these are always populated.
# ---------------------------------------------------------------------
sparse_static = StaticAnalysisOutput(
    sample_id="sparse001",
    sha256="3" * 64,
    platform="android",
    file_type="apk",
    file_size_bytes=500000,
    submitted_at="2026-07-17T10:15:00Z",
    yara_matches=[],
    android_manifest=AndroidManifestInfo(
        package_name="com.unknown.app",
        permissions=[],
        requested_sdk=None,
        exported_components=[],
    ),
    pe_analysis=None,
    extracted_strings=ExtractedStrings(),
    ml_classifier=None,
    static_risk_flags=[],
)
run_scenario("Sparse/minimal data (no ML classifier, no permissions)", sparse_static, None)

print(f"\n{'='*70}\nALL SCENARIOS COMPLETE\n{'='*70}")
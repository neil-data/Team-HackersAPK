"""
capability_rules.py — Real capability classification logic.

Same rule-engine pattern as mitre_rules.py: each rule inspects
combined static + dynamic signals and emits a CapabilityTag with
confidence + human-readable evidence (the evidence list feeds
directly into the narrative agent's prompt later).
"""

from __future__ import annotations
from typing import Optional

from agents.orchestrator.schema import StaticAnalysisOutput, DynamicAnalysisOutput, CapabilityTag


def _cap_sms_otp_theft(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[CapabilityTag]:
    perms = static.android_manifest.permissions if static.android_manifest else []
    evidence = []
    score = 0.0

    if any("READ_SMS" in p for p in perms):
        evidence.append("READ_SMS permission declared")
        score += 0.4
    if any(y.category == "india_scam_rules" for y in static.yara_matches):
        evidence.append("matches India-specific scam YARA rule")
        score += 0.3
    if dynamic and any("sms" in c.lower() for c in dynamic.api_calls):
        evidence.append("observed live SMS content access during detonation")
        score += 0.3

    if score >= 0.4:
        return CapabilityTag(capability="sms_otp_theft", confidence=min(score, 1.0), evidence=evidence)
    return None


def _cap_gps_tracking(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[CapabilityTag]:
    perms = static.android_manifest.permissions if static.android_manifest else []
    evidence = []
    score = 0.0

    if any("LOCATION" in p for p in perms):
        evidence.append("ACCESS_FINE_LOCATION permission declared")
        score += 0.4
    if dynamic and any("LocationManager" in c for c in dynamic.api_calls):
        evidence.append("observed live location API calls during detonation")
        score += 0.4

    if score >= 0.4:
        return CapabilityTag(capability="gps_tracking", confidence=min(score, 1.0), evidence=evidence)
    return None


def _cap_overlay_phishing(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[CapabilityTag]:
    perms = static.android_manifest.permissions if static.android_manifest else []
    if any("SYSTEM_ALERT_WINDOW" in p for p in perms):
        return CapabilityTag(
            capability="overlay_phishing",
            confidence=0.65,
            evidence=["SYSTEM_ALERT_WINDOW permission — can draw fake UI over legitimate apps"],
        )
    return None


def _cap_device_admin_persistence(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[CapabilityTag]:
    if dynamic and any("DevicePolicyManager" in c for c in dynamic.api_calls):
        return CapabilityTag(
            capability="uninstall_resistance",
            confidence=0.8,
            evidence=["requested device admin privileges during detonation — resists uninstall"],
        )
    return None


def _cap_data_exfiltration(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[CapabilityTag]:
    evidence = []
    score = 0.0

    if static.extracted_strings.urls or static.extracted_strings.ips:
        evidence.append("hardcoded network endpoint(s) found in static strings")
        score += 0.3
    if dynamic and any(conn.get("flagged_c2") for conn in dynamic.network_connections):
        evidence.append("confirmed live connection to flagged C2 endpoint")
        score += 0.5
    if dynamic:
        for conn in dynamic.network_connections:
            interval = conn.get("interval_seconds")
            if interval and interval < 120:
                evidence.append(f"periodic beaconing every {interval}s — consistent with automated exfiltration")
                score += 0.2
                break

    if score >= 0.3:
        return CapabilityTag(capability="data_exfiltration", confidence=min(score, 1.0), evidence=evidence)
    return None


def _cap_keylogging(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[CapabilityTag]:
    evidence = []
    score = 0.0

    keylog_apis = ("GetKeyboardState", "SetWindowsHookEx", "GetAsyncKeyState")
    if dynamic and any(api in c for c in dynamic.api_calls for api in keylog_apis):
        evidence.append("observed keyboard-hooking API calls during detonation")
        score += 0.6
    if "keylog" in static.extracted_strings.suspicious_keywords:
        evidence.append("'keylog' string found in static analysis")
        score += 0.3

    if score >= 0.3:
        return CapabilityTag(capability="keylogging", confidence=min(score, 1.0), evidence=evidence)
    return None


def _cap_persistence(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[CapabilityTag]:
    if dynamic and dynamic.registry_changes:
        run_key = any("Run" in rc or "Startup" in rc for rc in dynamic.registry_changes)
        if run_key:
            return CapabilityTag(
                capability="persistence_registry",
                confidence=0.85,
                evidence=["writes to registry Run key — survives reboot"],
            )
    return None


CAPABILITY_RULES = [
    _cap_sms_otp_theft,
    _cap_gps_tracking,
    _cap_overlay_phishing,
    _cap_device_admin_persistence,
    _cap_data_exfiltration,
    _cap_keylogging,
    _cap_persistence,
]


def classify_capabilities(
    static: StaticAnalysisOutput,
    dynamic: Optional[DynamicAnalysisOutput],
) -> list[CapabilityTag]:
    results: list[CapabilityTag] = []
    for rule in CAPABILITY_RULES:
        match = rule(static, dynamic)
        if match:
            results.append(match)
    return results
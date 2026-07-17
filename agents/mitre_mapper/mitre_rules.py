"""
mitre_rules.py — Real MITRE ATT&CK mapping logic.

Rule-based engine: each rule checks a condition against combined
static + dynamic signals and, if matched, emits a MitreTechnique.
This replaces the Week 2 hardcoded stub with something that actually
scales as more signal types come in (add a rule = add a dict entry,
no graph changes needed).

To extend: add a new entry to MITRE_RULES. Each rule is a function
that takes (static, dynamic) and returns a MitreTechnique or None.
"""

from __future__ import annotations
from typing import Optional

from agents.orchestrator.schema import StaticAnalysisOutput, DynamicAnalysisOutput, MitreTechnique


def _rule_sms_access(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[MitreTechnique]:
    perms = static.android_manifest.permissions if static.android_manifest else []
    sms_perm = any("SMS" in p for p in perms)
    sms_api = dynamic and any("SmsManager" in c or "sms" in c.lower() for c in dynamic.api_calls)
    if sms_perm or sms_api:
        confidence = 0.9 if (sms_perm and sms_api) else 0.7
        return MitreTechnique(technique_id="T1517", technique_name="Access Notifications", confidence=confidence)
    return None


def _rule_c2_comms(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[MitreTechnique]:
    static_c2 = "hardcoded_c2_ip" in static.static_risk_flags
    dynamic_c2 = dynamic and any(conn.get("flagged_c2") for conn in dynamic.network_connections)
    if static_c2 or dynamic_c2:
        confidence = 0.9 if (static_c2 and dynamic_c2) else 0.65
        return MitreTechnique(technique_id="T1071", technique_name="Application Layer Protocol (C2)", confidence=confidence)
    return None


def _rule_overlay_ui(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[MitreTechnique]:
    perms = static.android_manifest.permissions if static.android_manifest else []
    if any("SYSTEM_ALERT_WINDOW" in p for p in perms):
        return MitreTechnique(technique_id="T1417", technique_name="Input Capture (Overlay)", confidence=0.75)
    return None


def _rule_device_admin_abuse(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[MitreTechnique]:
    dynamic_admin = dynamic and any("DevicePolicyManager" in c for c in dynamic.api_calls)
    if dynamic_admin:
        return MitreTechnique(technique_id="T1626", technique_name="Abuse Elevation Control Mechanism (Device Admin)", confidence=0.8)
    return None


def _rule_location_tracking(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[MitreTechnique]:
    perms = static.android_manifest.permissions if static.android_manifest else []
    location_perm = any("LOCATION" in p for p in perms)
    location_api = dynamic and any("LocationManager" in c for c in dynamic.api_calls)
    if location_perm or location_api:
        confidence = 0.85 if (location_perm and location_api) else 0.6
        return MitreTechnique(technique_id="T1430", technique_name="Location Tracking", confidence=confidence)
    return None


def _rule_data_encoded_exfil(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[MitreTechnique]:
    persistent_write = dynamic and len(dynamic.files_written) > 0
    exfil_conn = dynamic and len(dynamic.network_connections) > 0
    if persistent_write and exfil_conn:
        return MitreTechnique(technique_id="T1005", technique_name="Data from Local System", confidence=0.55)
    return None


def _rule_registry_persistence(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[MitreTechnique]:
    if dynamic and dynamic.registry_changes:
        run_key_persistence = any("Run" in rc or "Startup" in rc for rc in dynamic.registry_changes)
        if run_key_persistence:
            return MitreTechnique(
                technique_id="T1547.001",
                technique_name="Boot or Logon Autostart Execution: Registry Run Keys",
                confidence=0.85,
            )
    return None


def _rule_keylogging(static: StaticAnalysisOutput, dynamic: Optional[DynamicAnalysisOutput]) -> Optional[MitreTechnique]:
    keylog_api = dynamic and any(
        api in c for c in dynamic.api_calls
        for api in ("GetKeyboardState", "SetWindowsHookEx", "GetAsyncKeyState")
    )
    keylog_string = "keylog" in static.extracted_strings.suspicious_keywords
    if keylog_api or keylog_string:
        confidence = 0.85 if keylog_api else 0.6
        return MitreTechnique(technique_id="T1056.001", technique_name="Input Capture: Keylogging", confidence=confidence)
    return None


MITRE_RULES = [
    _rule_sms_access,
    _rule_c2_comms,
    _rule_overlay_ui,
    _rule_device_admin_abuse,
    _rule_location_tracking,
    _rule_data_encoded_exfil,
    _rule_registry_persistence,
    _rule_keylogging,
]


def map_to_mitre(
    static: StaticAnalysisOutput,
    dynamic: Optional[DynamicAnalysisOutput],
) -> list[MitreTechnique]:
    """Run every rule against the combined signal set, return all matches."""
    results: list[MitreTechnique] = []
    for rule in MITRE_RULES:
        match = rule(static, dynamic)
        if match:
            results.append(match)
    return results
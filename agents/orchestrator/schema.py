"""
schema.py — Shared data contracts for the LangGraph orchestrator.

This defines the shape of data flowing between pipeline stages:
Static Analysis -> Dynamic Sandbox -> Agent Orchestrator -> MITRE Mapper
-> Capability Classifier -> Narrative Agent

Week 2 status: only StaticAnalysisOutput is "real" (proposed to Member 1
for confirmation). DynamicAnalysisOutput is a placeholder shape that will
be confirmed with Member 2 once the sandbox is live in Week 3.
"""

from __future__ import annotations
from typing import Optional, Literal, TypedDict
from pydantic import BaseModel, Field


class YaraMatch(BaseModel):
    rule_name: str
    category: str
    severity: Literal["low", "medium", "high", "critical"]
    description: str


class AndroidManifestInfo(BaseModel):
    package_name: str
    permissions: list[str] = Field(default_factory=list)
    requested_sdk: Optional[int] = None
    exported_components: list[str] = Field(default_factory=list)


class PEAnalysisInfo(BaseModel):
    imports: list[str] = Field(default_factory=list)
    sections: list[str] = Field(default_factory=list)
    compile_timestamp: Optional[str] = None


class ExtractedStrings(BaseModel):
    urls: list[str] = Field(default_factory=list)
    ips: list[str] = Field(default_factory=list)
    suspicious_keywords: list[str] = Field(default_factory=list)


class MLClassifierResult(BaseModel):
    model: str
    anomaly_score: float
    classification: Literal["benign", "suspicious", "likely_malicious"]


class StaticAnalysisOutput(BaseModel):
    """Proposed contract for Member 1's static-analysis module output."""
    sample_id: str
    sha256: str
    platform: Literal["android", "windows"]
    file_type: str
    file_size_bytes: int
    submitted_at: str

    yara_matches: list[YaraMatch] = Field(default_factory=list)
    android_manifest: Optional[AndroidManifestInfo] = None
    pe_analysis: Optional[PEAnalysisInfo] = None
    extracted_strings: ExtractedStrings
    ml_classifier: Optional[MLClassifierResult] = None
    static_risk_flags: list[str] = Field(default_factory=list)


class DynamicAnalysisOutput(BaseModel):
    """
    PLACEHOLDER — confirm real shape with Member 2 in Week 3 once the
    sandbox is live. Fields below are best-guess based on the
    architecture plan (CAPE report structure + network capture layer).
    """
    sample_id: str
    process_tree: list[dict] = Field(default_factory=list)
    api_calls: list[str] = Field(default_factory=list)
    network_connections: list[dict] = Field(default_factory=list)
    files_written: list[str] = Field(default_factory=list)
    registry_changes: list[str] = Field(default_factory=list)
    c2_endpoints_detected: list[str] = Field(default_factory=list)


class MitreTechnique(BaseModel):
    technique_id: str        # e.g. "T1517"
    technique_name: str
    confidence: float


class CapabilityTag(BaseModel):
    capability: str          # e.g. "sms_otp_theft", "keylogging", "gps_tracking"
    confidence: float
    evidence: list[str] = Field(default_factory=list)


class OrchestratorState(TypedDict, total=False):
    """
    The LangGraph shared state object. Each node reads/writes into this
    dict as the graph executes.
    """
    sample_id: str
    static_output: Optional[StaticAnalysisOutput]
    dynamic_output: Optional[DynamicAnalysisOutput]
    mitre_techniques: list[MitreTechnique]
    capability_tags: list[CapabilityTag]
    risk_score: Optional[int]
    narrative_summary: Optional[str]
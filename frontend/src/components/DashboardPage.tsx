import * as React from "react";
import { 
  Shield, 
  UploadCloud, 
  Cpu, 
  Terminal, 
  Workflow, 
  Layers, 
  FileText, 
  Briefcase, 
  Settings, 
  LogOut, 
  Search, 
  Filter, 
  FileCode, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Database,
  Info,
  Clock,
  Sliders,
  ChevronDown,
  Lock,
  ExternalLink,
  ChevronRight,
  FileCheck
} from "lucide-react";

import { ThreatCase } from "./dashboard/types";
import { OverviewTab } from "./dashboard/OverviewTab";
import { StaticAnalysisTab } from "./dashboard/StaticAnalysisTab";
import { DynamicSandboxTab } from "./dashboard/DynamicSandboxTab";
import { MitreMappingTab } from "./dashboard/MitreMappingTab";
import { AiReportsTab } from "./dashboard/AiReportsTab";

interface DashboardPageProps {
  onLogout: () => void;
}

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "upload" | "static" | "dynamic" | "behavior" | "mitre" | "reports" | "cases" | "settings"
  >("overview");

  // Cases registry database
  const [cases, setCases] = React.useState<ThreatCase[]>([
    {
      id: "ER-0291",
      name: "sbi_secure_token.apk",
      type: "APK",
      size: "8.4 MB",
      hash: "8f2a5b9c1d0e4f3a7c6b8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
      riskScore: 92,
      status: "QUARANTINED",
      date: "2026-07-18 09:12:00",
      agency: "Cyber Cell Mumbai Node 4",
      mitreCount: 8,
      yaraMatches: ["BANKING_TROJAN_HOOK", "SMS_STEALER_DEX"]
    },
    {
      id: "ER-0290",
      name: "wannacry_payload_v3.exe",
      type: "PE",
      size: "3.2 MB",
      hash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      riskScore: 98,
      status: "QUARANTINED",
      date: "2026-07-17 14:35:12",
      agency: "Federal Intelligence Unit",
      mitreCount: 12,
      yaraMatches: ["RANSOMWARE_ENCRYPT_MUTEX", "SHADOW_COPY_DELETE"]
    },
    {
      id: "ER-0289",
      name: "camera_filter_pro.apk",
      type: "APK",
      size: "24.1 MB",
      hash: "c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
      riskScore: 45,
      status: "CLEARED",
      date: "2026-07-16 11:05:44",
      agency: "UP Police Cyber Wing",
      mitreCount: 2,
      yaraMatches: ["ADWARE_TELEMETRY"]
    },
    {
      id: "ER-0288",
      name: "kernel_driver_bypass.sys",
      type: "PE",
      size: "420 KB",
      hash: "f1e2d3c4b5a697887766554433221100abcdef1234567890abcdef1234567890",
      riskScore: 89,
      status: "ACTIVE_TRACE",
      date: "2026-07-15 18:22:01",
      agency: "DRDO Sandbox Cluster B",
      mitreCount: 7,
      yaraMatches: ["DKOM_PROCESS_HIDE", "KERNEL_HOOK_SYS"]
    }
  ]);

  const [selectedCaseId, setSelectedCaseId] = React.useState<string>("ER-0291");
  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Upload state
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStep, setUploadStep] = React.useState("");
  const [currentTime, setCurrentTime] = React.useState("");
  const [expandedBehaviorIdx, setExpandedBehaviorIdx] = React.useState<number | null>(0);
  const [casesSearchQuery, setCasesSearchQuery] = React.useState("");

  // Live real-time UTC digital clock inside Top bar
  React.useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      const ss = String(d.getUTCSeconds()).padStart(2, '0');
      setCurrentTime(`${hh}:${mm}:${ss} UTC`);
    };
    updateClock();
    const t = setInterval(updateClock, 1000);
    return () => clearInterval(t);
  }, []);

  // Multi-phase file ingestion pipeline
  const triggerMockUpload = (fileName: string, type: "APK" | "PE") => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStep("Ingesting Payload file...");

    const steps = [
      { p: 15, s: "Hashing file payload (SHA-256)..." },
      { p: 35, s: "Executing Static Decompilation & IAT resolver..." },
      { p: 55, s: "Matching indicators against YARA intelligence database..." },
      { p: 75, s: "Spinning up dynamic sandboxed virtualization bubble..." },
      { p: 90, s: "Performing AI behavioral trace & MITRE ATT&CK correlation..." },
      { p: 100, s: "Synthesizing final evidence dossier..." }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setUploadProgress(step.p);
        setUploadStep(step.s);
        if (step.p === 100) {
          setTimeout(() => {
            setIsUploading(false);
            
            const newCase: ThreatCase = {
              id: `ER-0${Math.floor(100 + Math.random() * 900)}`,
              name: fileName || (type === "APK" ? "custom_payload.apk" : "malicious_process.exe"),
              type: type,
              size: type === "APK" ? "12.8 MB" : "4.4 MB",
              hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
              riskScore: type === "APK" ? 82 : 95,
              status: "ACTIVE_TRACE",
              date: new Date().toISOString().replace("T", " ").substring(0, 19),
              agency: "Cyber Crime Cell Mumbai (Consol Node)",
              mitreCount: type === "APK" ? 6 : 10,
              yaraMatches: type === "APK" ? ["SMS_STEALER_DEX", "REVERSE_TCP_SOCKET"] : ["RANSOMWARE_MUTEX", "PROCESS_INJECTION_DLL"]
            };

            setCases(prev => [newCase, ...prev]);
            setSelectedCaseId(newCase.id);
            setActiveTab("overview");
            alert(`Analysis complete! New Threat Case generated: ${newCase.name} (Risk Score: ${newCase.riskScore}/100)`);
          }, 600);
        }
      }, (index + 1) * 700);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const isApk = file.name.endsWith(".apk");
      triggerMockUpload(file.name, isApk ? "APK" : "PE");
    }
  };

  // Behavioral chronological log based on selected target
  const behaviorLog = [
    {
      time: "09:12:01",
      event: "Process Launch (NtCreateUserProcess)",
      severity: "LOW",
      desc: `Guest target initialized file process. Executable: C:\\Users\\Admin\\AppData\\Local\\Temp\\${activeCase.name}.`,
      details: "Thread #4892 invoked dynamically. Allocated stack pointers mapped."
    },
    {
      time: "09:12:03",
      event: "API Virtual hollowing (NtAllocateVirtualMemory)",
      severity: "CRITICAL",
      desc: "Allocated memory area with read-write-execute PAGE_EXECUTE_READWRITE permissions, typical of unpacking payloads.",
      details: "Base Address: 0x00A1F000, Allocation Size: 8192 bytes. Confidence rate: 98%."
    },
    {
      time: "09:12:05",
      event: "Outbound Network connection (connect syscall)",
      severity: "HIGH",
      desc: "Attempted to establish raw socket connection to suspect Command & Control IP: 185.220.101.5 on port 4444.",
      details: "Honeypot fake DNS simulator hijacked loopback. Dynamic payload stream intercepted."
    },
    {
      time: "09:12:08",
      event: "Registry autostart write (RegSetValueExA)",
      severity: "HIGH",
      desc: "Added registry run key under HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run to force autostart on boot.",
      details: "Key name: SecureBootBypass, Pointer target: dropper.dll"
    }
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-foreground flex font-sans overflow-hidden select-none">
      
      {/* Loading analysis overlay during ingestion */}
      {isUploading && (
        <div className="fixed inset-0 bg-[#090909]/95 z-[150] flex flex-col items-center justify-center border-t border-[#16ff4d]/20">
          <div className="text-center space-y-6 max-w-md w-full px-6">
            <div className="w-16 h-16 rounded-full border-4 border-[#16ff4d]/10 border-t-[#16ff4d] animate-spin mx-auto" />
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] font-mono text-[#16ff4d] font-bold block animate-pulse">
                INGESTING EVIDENCE PAYLOAD
              </span>
              <p className="text-[#A0A0A0] text-xs font-mono">{uploadStep}</p>
            </div>
            
            {/* Elegant high-precision progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-[#111111] border border-[#222222] h-2 rounded overflow-hidden">
                <div 
                  className="bg-[#16ff4d] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#6F6F6F]">
                <span>ENCLAVE LOCK PROTOCOL</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#111111] border-r border-[#222222] shrink-0 flex flex-col justify-between relative z-10">
        <div>
          {/* Logo */}
          <div className="px-6 py-5 border-b border-[#222222] flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#16ff4d]/10 border border-[#16ff4d]/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#16ff4d]" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              E-RAKSHAK <span className="text-[#16ff4d] font-mono text-[10px]">SOC</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-[#6F6F6F] px-3 font-mono block mb-2 font-bold">
              CORE FORENSICS MODULES
            </span>
            {[
              { id: "overview", label: "Overview Summary", icon: Cpu },
              { id: "upload", label: "Ingest Artifact", icon: UploadCloud },
              { id: "static", label: "Static Code Analyst", icon: FileCode },
              { id: "dynamic", label: "Detonation Sandbox", icon: Terminal },
              { id: "behavior", label: "Behavior Timeline", icon: Workflow },
              { id: "mitre", label: "MITRE Mapping Matrix", icon: Layers },
              { id: "reports", label: "AI Report Dossier", icon: FileText },
              { id: "cases", label: "Database Registry", icon: Briefcase },
              { id: "settings", label: "Settings Desk", icon: Settings },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-all font-semibold uppercase tracking-wider text-left border focus:outline-none ${
                    isCurrent
                      ? "bg-[#16ff4d]/10 border-[#16ff4d]/20 text-[#16ff4d] shadow-sm"
                      : "text-[#A0A0A0] border-transparent hover:bg-[#171717] hover:text-white"
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Refined enterprise operator profile widget */}
        <div className="p-4 border-t border-[#222222] space-y-3.5">
          <div className="bg-[#171717] p-3 rounded-lg border border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#16ff4d]/10 border border-[#16ff4d]/30 flex items-center justify-center text-[#16ff4d] font-mono text-xs font-bold">
                IV
              </div>
              <div className="text-left font-sans">
                <span className="text-[10px] font-bold text-white block uppercase tracking-wide">SOC Operator</span>
                <span className="text-[8px] text-[#A0A0A0] block">OFFICER #482</span>
              </div>
            </div>
            
            {/* Pulse online indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16ff4d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16ff4d]"></span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[8px] font-mono text-[#6F6F6F] uppercase border-t border-[#222222]/40 pt-2 text-center">
            <div className="bg-[#090909] py-1 rounded">ALPHA SHIFT</div>
            <div className="bg-[#090909] py-1 rounded text-white">SEC LEVEL 5</div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 rounded transition-all font-mono"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 bg-[#090909] flex flex-col overflow-hidden relative z-0">
        
        {/* High-density informative Top bar */}
        <header className="h-16 border-b border-[#222222] px-6 flex items-center justify-between bg-[#111111]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#A0A0A0]">
              <Database className="w-3.5 h-3.5" /> ACTIVE TARGET:
            </div>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-[#171717] border border-[#222222] rounded text-xs font-mono py-1.5 px-3 text-[#16ff4d] focus:outline-none focus:border-[#16ff4d] max-w-xs uppercase font-bold"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} // {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Info cluster block */}
          <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-[#A0A0A0]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16ff4d]" />
              <span>AIR-GAPPED ENCLAVE ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentTime || "00:00:00 UTC"}</span>
            </div>
          </div>
        </header>

        {/* Scrollable interior canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* ================= TAB 1: OVERVIEW SUMMARY ================= */}
          {activeTab === "overview" && (
            <OverviewTab activeCase={activeCase} onNavigate={(tab) => setActiveTab(tab as any)} />
          )}

          {/* ================= TAB 2: INGEST ARTIFACT ================= */}
          {activeTab === "upload" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-b border-[#222222]/80 pb-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                  Forensic Ingestion Gateway
                </h3>
                <p className="text-[11px] text-[#A0A0A0] font-light">
                  Ingest binary suspects securely inside localized air-gapped Sandboxes. Accepted formats: APK package, PE PE32/PE32+ executable, and kernel .sys drivers.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#222222] hover:border-[#16ff4d]/40 rounded-lg p-12 text-center bg-[#111111] hover:bg-[#171717] transition-all duration-200 cursor-pointer group"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 rounded bg-[#171717] border border-[#222222] flex items-center justify-center text-[#A0A0A0] group-hover:text-[#16ff4d] transition-colors">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Drag & drop suspect binary here</p>
                    <p className="text-[10px] text-[#6F6F6F]">or click directory finder to upload</p>
                  </div>
                </div>
              </div>

              {/* Sample detonators row */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-mono text-[#6F6F6F] uppercase tracking-widest block font-bold">
                  FAST detonator shortcuts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => triggerMockUpload("sbi_trojan_stealer.apk", "APK")}
                    className="flex items-center justify-between p-4 bg-[#111111] border border-[#222222] rounded-lg text-left hover:border-[#ff4040]/30 transition-all font-mono"
                  >
                    <div>
                      <span className="text-xs text-white font-bold block">SBI_T_STEALER.APK</span>
                      <span className="text-[9px] text-[#ff4040] font-bold">MALWARE CLASS: TROJAN</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
                  </button>

                  <button 
                    onClick={() => triggerMockUpload("wannacry_encryptor.exe", "PE")}
                    className="flex items-center justify-between p-4 bg-[#111111] border border-[#222222] rounded-lg text-left hover:border-[#ff4040]/30 transition-all font-mono"
                  >
                    <div>
                      <span className="text-xs text-white font-bold block">WANNACRY_ENCRYPTOR.EXE</span>
                      <span className="text-[9px] text-[#ff4040] font-bold">MALWARE CLASS: RANSOMWARE</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 3: STATIC CODE ANALYST ================= */}
          {activeTab === "static" && (
            <StaticAnalysisTab activeCase={activeCase} />
          )}

          {/* ================= TAB 4: DETONATION SANDBOX ================= */}
          {activeTab === "dynamic" && (
            <DynamicSandboxTab activeCase={activeCase} />
          )}

          {/* ================= TAB 5: BEHAVIOR TIMELINE ================= */}
          {activeTab === "behavior" && (
            <div className="space-y-6 max-w-4xl">
              
              <div className="border-b border-[#222222]/80 pb-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                  Sequential Behavioral Chronological Log
                </h3>
                <p className="text-[11px] text-[#A0A0A0] font-light">
                  Process hollowing, system hooks, registry writes, and socket allocations chronologically stacked on detonate timeline. Click events to view forensic evidence details.
                </p>
              </div>

              {/* Timeline list */}
              <div className="relative border-l-2 border-[#222222] ml-4 pl-8 space-y-6">
                {behaviorLog.map((log, idx) => {
                  const isExpanded = expandedBehaviorIdx === idx;
                  const isCritical = log.severity === "CRITICAL" || log.severity === "HIGH";
                  return (
                    <div key={idx} className="relative group">
                      
                      {/* Connection node */}
                      <span className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-4 border-[#090909] flex items-center justify-center ${
                        log.severity === "CRITICAL" ? "bg-[#ff4040]" :
                        log.severity === "HIGH" ? "bg-[#f4b400]" :
                        "bg-[#16ff4d]"
                      }`} />

                      {/* Event container card */}
                      <div 
                        onClick={() => setExpandedBehaviorIdx(isExpanded ? null : idx)}
                        className={`bg-[#111111] border border-[#222222] hover:border-[#16ff4d]/20 p-5 rounded-lg transition-all cursor-pointer shadow-md ${
                          isExpanded ? "ring-1 ring-[#16ff4d]/20" : ""
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#16ff4d] font-bold">{log.time}</span>
                            <h4 className="text-xs font-bold text-white font-sans">{log.event}</h4>
                          </div>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${
                            log.severity === "CRITICAL" ? "bg-red-950/40 text-[#ff4040] border-red-500/20" :
                            log.severity === "HIGH" ? "bg-yellow-950/40 text-[#f4b400] border-yellow-500/20" :
                            "bg-green-950/40 text-[#16ff4d] border-green-500/20"
                          }`}>
                            {log.severity}
                          </span>
                        </div>

                        <p className="text-[#A0A0A0] text-xs font-sans font-light mt-2 max-w-2xl">
                          {log.desc}
                        </p>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-3 border-t border-[#222222]/60 font-mono text-[10px] text-[#ff4040] space-y-1 bg-[#090909] p-3 rounded">
                            <span className="text-[#6F6F6F] block font-bold uppercase tracking-wider">FORENSIC SIGNAL TRACE DETAILS:</span>
                            <p>{log.details}</p>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ================= TAB 6: MITRE MAPPING ================= */}
          {activeTab === "mitre" && (
            <MitreMappingTab activeCase={activeCase} />
          )}

          {/* ================= TAB 7: AI REPORT DOSSIER ================= */}
          {activeTab === "reports" && (
            <AiReportsTab activeCase={activeCase} />
          )}

          {/* ================= TAB 8: DATABASE REGISTRY ================= */}
          {activeTab === "cases" && (
            <div className="space-y-6">
              
              <div className="border-b border-[#222222]/80 pb-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                  Active Forensic Case registry Database
                </h3>
                <p className="text-[11px] text-[#A0A0A0] font-light">
                  Search, filter, and review completed and quarantined forensic cases compiled inside local laboratories.
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#111111] border border-[#222222] p-4 rounded-lg">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="w-4 h-4 text-[#6F6F6F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={casesSearchQuery}
                    onChange={(e) => setCasesSearchQuery(e.target.value)}
                    placeholder="Search suspect artifact, SHA-256 summary..."
                    className="w-full bg-[#090909] border border-[#222222] rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#16ff4d] placeholder:text-[#6F6F6F] font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 text-[#A0A0A0] text-xs font-mono">
                  <span>TOTAL CASES: {cases.length}</span>
                </div>
              </div>

              {/* Case table registry list */}
              <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden shadow-md">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="bg-[#171717] text-[#6F6F6F] border-b border-[#222222] text-[9px] uppercase tracking-wider">
                      <th className="p-4">CASE FILE ID</th>
                      <th className="p-4">SUSPECT ARTIFACT</th>
                      <th className="p-4">MALWARE TYPE</th>
                      <th className="p-4">SHA-256 SUMMARY</th>
                      <th className="p-4">RISK SEVERITY</th>
                      <th className="p-4">INTELLIGENCE STATUS</th>
                      <th className="p-4">DISPATCH DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222]/60 text-[#A0A0A0]">
                    {cases
                      .filter(c => c.name.toLowerCase().includes(casesSearchQuery.toLowerCase()) || c.hash.includes(casesSearchQuery))
                      .map((c) => (
                        <tr 
                          key={c.id} 
                          onClick={() => setSelectedCaseId(c.id)}
                          className={`hover:bg-[#171717] cursor-pointer transition-colors ${
                            selectedCaseId === c.id ? "bg-[#16ff4d]/5" : ""
                          }`}
                        >
                          <td className="p-4 text-[#16ff4d] font-bold">{c.id}</td>
                          <td className="p-4 text-white font-sans font-bold">{c.name}</td>
                          <td className="p-4">
                            <span className="bg-[#171717] border border-[#222222] px-2 py-0.5 rounded text-[10px] text-white">
                              {c.type}
                            </span>
                          </td>
                          <td className="p-4">{c.hash.substring(0, 12)}...</td>
                          <td className="p-4">
                            <span className={`font-bold ${c.riskScore > 75 ? "text-[#ff4040]" : c.riskScore > 40 ? "text-[#f4b400]" : "text-[#16ff4d]"}`}>
                              {c.riskScore}%
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                              c.status === "QUARANTINED" ? "bg-red-950/40 text-[#ff4040] border-red-500/20" :
                              c.status === "ACTIVE_TRACE" ? "bg-yellow-950/40 text-[#f4b400] border-yellow-500/20" :
                              "bg-green-950/40 text-[#16ff4d] border-green-500/20"
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4 text-[#6F6F6F]">{c.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ================= TAB 9: SETTINGS DESK ================= */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              
              <div className="border-b border-[#222222]/80 pb-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                  Cyber Enclave Settings & Policy Desk
                </h3>
                <p className="text-[11px] text-[#A0A0A0] font-light font-sans">
                  Configure default Guest VM target execution loops, air-gap policy triggers, and dynamic honeypot loopbacks.
                </p>
              </div>

              <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-6">
                
                <div className="space-y-4 font-mono">
                  <span className="text-xs font-bold uppercase text-white font-mono block">
                    Hypervisor Guest configuration
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] block">
                        DEFAULT VM GUEST OS
                      </label>
                      <select className="w-full bg-[#171717] border border-[#222222] rounded p-2.5 text-xs text-white focus:outline-none">
                        <option>Windows 10 Pro Enterprise (Isolated)</option>
                        <option>Android Emulator Core API 34</option>
                        <option>Linux Ubuntu Forensics VM Guest</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] block">
                        DETONATION TIME WINDOW LIMIT
                      </label>
                      <select className="w-full bg-[#171717] border border-[#222222] rounded p-2.5 text-xs text-white focus:outline-none">
                        <option>60 Seconds (Standard Check)</option>
                        <option>180 Seconds (Deep Triage)</option>
                        <option>300 Seconds (Extensive Trace)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-[#222222]/60 pt-6 font-sans">
                  <span className="text-xs font-bold uppercase text-white font-mono block">
                    Security & Air-Gapping Policy
                  </span>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="rounded border-[#222222] text-[#16ff4d] focus:ring-[#16ff4d] bg-[#171717] mt-0.5 accent-[#16ff4d]" 
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Strict Air-Gapped Sandboxing</span>
                        <span className="text-[10px] text-[#A0A0A0] font-light leading-relaxed">Force-block real outgoing socket communication. Virtualized endpoints will communicate exclusively with the fake honeypot loopback mock adapter.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer select-none border-t border-[#222222]/40 pt-4">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="rounded border-[#222222] text-[#16ff4d] focus:ring-[#16ff4d] bg-[#171717] mt-0.5 accent-[#16ff4d]" 
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Automated MITRE Matrix Submission</span>
                        <span className="text-[10px] text-[#A0A0A0] font-light leading-relaxed">Auto-align intercepted logs against tactics definitions, flagging suspect modules instantly.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222222]/60 flex justify-end">
                  <button 
                    onClick={() => alert("E-Rakshak system configurations locked successfully.")}
                    className="bg-[#16ff4d] hover:bg-[#16ff4d]/95 text-[#090909] text-xs uppercase tracking-widest font-bold px-6 py-3 rounded shadow-md focus:outline-none"
                  >
                    Lock Sandbox Settings
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  );
}

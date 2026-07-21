import * as React from "react";
import { FileText, Download, Check, Shield, FileCheck, Award, Eye, ExternalLink } from "lucide-react";
import { ThreatCase } from "./types";

interface AiReportsTabProps {
  activeCase: ThreatCase;
}

export function AiReportsTab({ activeCase }: AiReportsTabProps) {
  const [activeBookmark, setActiveBookmark] = React.useState("exec_summary");
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportDone, setExportDone] = React.useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setExportDone(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
      alert(`Cryptographic Forensic Evidence dossier printed: \nFILE: ${activeCase.name}_Evidence_Report.pdf\nHASH CERTIFICATE: ${activeCase.hash.substring(0, 16)}...`);
    }, 1500);
  };

  const bookmarks = [
    { id: "exec_summary", label: "I. Executive Summary" },
    { id: "cryptographic", label: "II. Cryptographic Authenticator" },
    { id: "mitre", label: "III. MITRE ATT&CK Matrix Appendix" },
    { id: "evidence", label: "IV. Incident Response & Clearance" }
  ];

  const thumbnails = [
    { num: 1, label: "Page 1 - Overview" },
    { num: 2, label: "Page 2 - Hashes" },
    { num: 3, label: "Page 3 - MITRE" },
    { num: 4, label: "Page 4 - Clearance" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab controls */}
      <div className="flex justify-between items-center border-b border-[#222222]/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
            Court-Ready Cyber Forensic Dossier
          </h3>
          <p className="text-[11px] text-[#A0A0A0] font-light font-sans">
            Automated intelligence packaging. Approved as legal digital evidence under Indian IT Act Sec 65B.
          </p>
        </div>

        {/* Sticky Print Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded border transition-all flex items-center gap-2 select-none shrink-0 ${
            isExporting
              ? "bg-[#111111] border-[#222222] text-[#A0A0A0] cursor-not-allowed animate-pulse"
              : exportDone
              ? "bg-[#16ff4d]/10 border-[#16ff4d]/40 text-[#16ff4d]"
              : "bg-[#16ff4d] hover:bg-[#16ff4d]/95 border-[#16ff4d] text-[#090909]"
          }`}
        >
          {isExporting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-[#A0A0A0] border-t-transparent rounded-full animate-spin" />
              Compiling PDF...
            </>
          ) : exportDone ? (
            <>
              <Check className="w-4 h-4 text-[#16ff4d]" />
              Dossier Downloaded
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Print Forensic Dossier
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Document Navigation and Miniature Thumbnails */}
        <div className="lg:col-span-3 space-y-4">
          <span className="text-[10px] font-mono text-[#6F6F6F] uppercase tracking-widest block font-bold">
            DOCUMENT BOOKMARKS
          </span>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-2.5 space-y-1">
            {bookmarks.map((bm) => (
              <button
                key={bm.id}
                onClick={() => setActiveBookmark(bm.id)}
                className={`w-full text-left font-sans text-xs px-3 py-2 rounded transition-colors block ${
                  activeBookmark === bm.id
                    ? "bg-[#16ff4d]/10 text-[#16ff4d] font-bold border border-[#16ff4d]/20"
                    : "text-[#A0A0A0] hover:bg-[#171717] hover:text-white"
                }`}
              >
                {bm.label}
              </button>
            ))}
          </div>

          <span className="text-[10px] font-mono text-[#6F6F6F] uppercase tracking-widest block font-bold pt-2">
            PAGE ARCHIVE THUMBNAILS
          </span>
          <div className="grid grid-cols-2 gap-2">
            {thumbnails.map((thumb) => {
              const isActive = 
                (activeBookmark === "exec_summary" && thumb.num === 1) ||
                (activeBookmark === "cryptographic" && thumb.num === 2) ||
                (activeBookmark === "mitre" && thumb.num === 3) ||
                (activeBookmark === "evidence" && thumb.num === 4);
              return (
                <button
                  key={thumb.num}
                  onClick={() => {
                    if (thumb.num === 1) setActiveBookmark("exec_summary");
                    if (thumb.num === 2) setActiveBookmark("cryptographic");
                    if (thumb.num === 3) setActiveBookmark("mitre");
                    if (thumb.num === 4) setActiveBookmark("evidence");
                  }}
                  className={`border p-2.5 rounded flex flex-col items-center justify-between h-20 text-center transition-all ${
                    isActive
                      ? "bg-[#111111] border-[#16ff4d] text-[#16ff4d]"
                      : "bg-[#111111]/40 border-[#222222] hover:bg-[#171717] text-[#6F6F6F] hover:text-white"
                  }`}
                >
                  <FileText className="w-5 h-5 opacity-80" />
                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase">PAGE {thumb.num}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Document Viewer Canvas */}
        <div className="lg:col-span-9 bg-[#111111] border border-[#222222] rounded-lg shadow-2xl p-8 max-w-3xl mx-auto space-y-6 relative overflow-hidden text-[#A0A0A0] select-text">
          
          {/* Document visual top stamp */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff4040]/5 rotate-45 border-b border-[#ff4040]/10 flex items-end justify-center pointer-events-none">
            <span className="text-[7px] font-mono text-[#ff4040] font-bold uppercase tracking-widest pb-1">RESTRICTED</span>
          </div>

          {/* Letterhead */}
          <div className="flex justify-between items-start border-b border-[#222222] pb-6 font-mono text-[10px]">
            <div className="space-y-1.5">
              <span className="text-sm font-bold text-white font-sans tracking-wide">SEC-OPS INCIDENT RESPONSE SYSTEM</span>
              <p className="text-[#6F6F6F]">GOVT REGULATED AIR-GAPPED FORENSICS LABORATORY</p>
              <p className="text-[#6F6F6F]">CASE REPO ID: <span className="text-white font-bold">{activeCase.id}</span></p>
            </div>
            <div className="text-right space-y-1">
              <span className="bg-red-950/40 border border-red-500/20 text-[#ff4040] px-2 py-0.5 rounded font-bold uppercase text-[8px] tracking-wider">
                EVIDENCE GRADE LEVEL IV
              </span>
              <p className="text-[#6F6F6F]">{activeCase.date} UTC</p>
            </div>
          </div>

          {/* Section content resolver */}
          {activeBookmark === "exec_summary" && (
            <div className="space-y-4">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider border-l-2 border-[#16ff4d] pl-2 font-mono">
                I. EXECUTIVE SUMMARY & ARTEFACT SCOPE
              </h4>
              <p className="text-xs leading-relaxed font-sans font-light">
                This document acts as an automated incident response and forensics report for suspect cyber weapon payload <span className="text-white font-bold font-mono">"{activeCase.name}"</span>. Detonation sandbox metrics were gathered inside KVM Virt-v4 virtual instances under air-gapped constraints, logging complete syscall, file creation, registry modifications, and outbound sockets.
              </p>
              <div className="bg-[#090909] p-4 rounded border border-[#222222] space-y-2 font-mono text-[11px]">
                <span className="text-[10px] text-[#6F6F6F] uppercase font-bold tracking-widest block">
                  PRIMARY INTELLIGENCE SUMMARY
                </span>
                <p><span className="text-white font-bold">Suspect Artifact Name:</span> {activeCase.name}</p>
                <p><span className="text-white font-bold">Malware Family:</span> {activeCase.type} Process Injector</p>
                <p><span className="text-white font-bold">Consensus Threat Risk Rating:</span> <span className="text-[#ff4040] font-bold">{activeCase.riskScore}% CRITICAL SIGNAL</span></p>
                <p><span className="text-white font-bold">MITRE Attack Coverage:</span> Aligned with {activeCase.mitreCount} tactical behaviors</p>
              </div>
            </div>
          )}

          {activeBookmark === "cryptographic" && (
            <div className="space-y-4">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider border-l-2 border-[#16ff4d] pl-2 font-mono">
                II. CRYPTOGRAPHIC DATA INTEGRITY AUTHENTICATOR
              </h4>
              <p className="text-xs leading-relaxed font-sans font-light">
                Uncompromising evidence preservation necessitates a strict mathematical ledger of file state, verifying no manual mutation or tamper patterns occurred post-acquisition.
              </p>
              
              <div className="p-4 bg-[#090909] border border-[#222222] rounded-lg font-mono text-[10px] space-y-2 leading-relaxed">
                <span className="text-[10px] text-[#6F6F6F] uppercase font-bold tracking-widest block">
                  CRYPTOGRAPHIC BLOCK MATRIX
                </span>
                <p><span className="text-white font-bold font-mono">MD5 BLOCKHASH:</span> {activeCase.hash.substring(0, 32)}</p>
                <p><span className="text-white font-bold font-mono">SHA-256 SIGNATURE:</span> {activeCase.hash}</p>
                <p><span className="text-white font-bold font-mono">SHA-1 CHECKSUM:</span> {activeCase.hash.substring(10, 50)}</p>
                <p><span className="text-white font-bold font-mono">INTEGRITY LOCK:</span> SEC-OPS FORENSIC ENVELOPE APPROVED</p>
              </div>
            </div>
          )}

          {activeBookmark === "mitre" && (
            <div className="space-y-4">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider border-l-2 border-[#16ff4d] pl-2 font-mono">
                III. MITRE ATT&CK BEHAVIORAL APPENDIX
              </h4>
              <p className="text-xs leading-relaxed font-sans font-light">
                Forensic trace mapping aligns the payload's direct runtime behaviors with standard enterprise attacker mechanics as detailed in the official MITRE catalog.
              </p>

              <div className="space-y-2 font-mono text-[10px]">
                <div className="bg-[#090909] p-3 rounded border border-[#222222] flex justify-between items-center">
                  <span className="text-white font-bold">TA0005 - DEFENSE EVASION (T1027 Obfuscation)</span>
                  <span className="text-[#ff4040] font-bold">CONFIRMED RATING: 94%</span>
                </div>
                <div className="bg-[#090909] p-3 rounded border border-[#222222] flex justify-between items-center">
                  <span className="text-white font-bold">TA0003 - PERSISTENCE (T1547.001 Startup Autostart Run Keys)</span>
                  <span className="text-[#f4b400] font-bold">CONFIRMED RATING: 96%</span>
                </div>
                <div className="bg-[#090909] p-3 rounded border border-[#222222] flex justify-between items-center">
                  <span className="text-white font-bold">TA0002 - EXECUTION (T1106 Native API Call Interception)</span>
                  <span className="text-[#16ff4d] font-bold">CONFIRMED RATING: 98%</span>
                </div>
              </div>
            </div>
          )}

          {activeBookmark === "evidence" && (
            <div className="space-y-4">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider border-l-2 border-[#16ff4d] pl-2 font-mono">
                IV. INCIDENT RESPONSE CLEARANCE & AUDIT SEAL
              </h4>
              <p className="text-xs leading-relaxed font-sans font-light">
                We certify that the data, variables, disassemblies, and memory hollowing trends logged in this report represent the absolute cryptographic authenticity of detonated artifact {activeCase.name}.
              </p>

              {/* Digital signature seals layout */}
              <div className="pt-6 border-t border-[#222222] grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SEAL 1 */}
                <div className="p-4 bg-[#090909]/40 border border-[#222222] rounded flex items-center gap-3 font-mono text-[9px] relative">
                  <div className="w-10 h-10 rounded-full border border-[#16ff4d]/40 flex items-center justify-center text-[#16ff4d] bg-[#16ff4d]/5 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-white font-bold uppercase block text-[10px]">CYBER CELL CERTIFICATION</span>
                    <p className="text-[#6F6F6F]">SECURE CLOUD CRYPTOGRAPHIC TOKEN</p>
                    <p className="text-[#16ff4d] font-bold tracking-wide">STATE: SEALED & ENCRYPTED</p>
                  </div>
                </div>

                {/* SEAL 2 */}
                <div className="p-4 bg-[#090909]/40 border border-[#222222] rounded flex items-center gap-3 font-mono text-[9px] relative">
                  <div className="w-10 h-10 rounded-full border border-[#00c2ff]/40 flex items-center justify-center text-[#00c2ff] bg-[#00c2ff]/5 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-white font-bold uppercase block text-[10px]">CHIEF FORENSIC INSPECTOR SEAL</span>
                    <p className="text-[#6F6F6F]">DIGITAL SIGNATURE VERIFIED</p>
                    <p className="text-[#00c2ff] font-bold tracking-wide">SEC LEVEL 5 COMPLIANT // APPROVED</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Report Footer */}
          <div className="pt-8 border-t border-[#222222] text-center font-mono text-[9px] text-[#6F6F6F] uppercase tracking-wider">
            END OF EVIDENCE DOSSIER // SEC-OPS-8110 LAB REGISTERED // STRICT CONFIDENTIALITY ENFORCED
          </div>

        </div>

      </div>

    </div>
  );
}

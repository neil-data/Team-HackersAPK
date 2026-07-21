import * as React from "react";
import { Shield, ChevronDown, ChevronUp, Layers, ExternalLink, AlertTriangle } from "lucide-react";
import { ThreatCase } from "./types";

interface MitreMappingTabProps {
  activeCase: ThreatCase;
}

export function MitreMappingTab({ activeCase }: MitreMappingTabProps) {
  const [expandedTactic, setExpandedTactic] = React.useState<string | null>("evasion");

  // Custom MITRE matrix data aligned with APK/PE targets
  const mitreMatrix = [
    {
      id: "initial",
      title: "Initial Access (TA0001)",
      count: 1,
      color: "#00c2ff",
      techniques: [
        {
          id: "T1444",
          name: "Masquerading APK Signature",
          score: "6.4",
          confidence: "91%",
          risk: "HIGH",
          link: "https://attack.mitre.org/techniques/T1444/",
          desc: "Actor packages malicious dex files inside a cloned APK matching official financial applications (like SBI Token Secure) to deceive unsuspecting operators.",
          events: ["[FILE_LOG] APK written to user emulator storage.", "[SYSTEM] Signature verification bypassed."]
        }
      ]
    },
    {
      id: "execution",
      title: "Execution (TA0002)",
      count: 2,
      color: "#16ff4d",
      techniques: [
        {
          id: "T1059",
          name: "Command and Scripting Interpreter",
          score: "7.8",
          confidence: "95%",
          risk: "HIGH",
          link: "https://attack.mitre.org/techniques/T1059/",
          desc: "Execution of malicious Java payloads or assembly instructions to forge raw sockets, bypass permissions systems, and initiate outbound payload streams.",
          events: ["[SYS_LOG] BroadcastReceiver interceptor executed in background.", "[SYSTEM] Process thread fork triggered."]
        },
        {
          id: "T1106",
          name: "Native API Execution (PE Process)",
          score: "8.5",
          confidence: "98%",
          risk: "CRITICAL",
          link: "https://attack.mitre.org/techniques/T1106/",
          desc: "Invokes low-level native API instructions (like VirtualAlloc, WriteProcessMemory, and CreateRemoteThread) to inject code directly into trusted host processes.",
          events: ["[SYS_LOG] Call resolved to VirtualAlloc in kernel32.dll."]
        }
      ]
    },
    {
      id: "persistence",
      title: "Persistence (TA0003)",
      count: 2,
      color: "#f4b400",
      techniques: [
        {
          id: "T1547.001",
          name: "Boot or Logon Autostart Registry Keys",
          score: "8.1",
          confidence: "96%",
          risk: "HIGH",
          link: "https://attack.mitre.org/techniques/T1547/001/",
          desc: "Creates or modifies Windows Registry keys in HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run to trigger automatic execution upon guest system boot.",
          events: ["[REG_LOG] Modified Run key with value targeting local payload binary."]
        }
      ]
    },
    {
      id: "evasion",
      title: "Defense Evasion (TA0005)",
      count: 3,
      color: "#ff4040",
      techniques: [
        {
          id: "T1027",
          name: "Obfuscated Files or Information (Packed)",
          score: "8.9",
          confidence: "94%",
          risk: "CRITICAL",
          link: "https://attack.mitre.org/techniques/T1027/",
          desc: "Actor compresses or packs the binary data payload (resulting in a section entropy rating above 7.8 H) to prevent automated disassembly scanning engines.",
          events: ["[SYSTEM] Section .rsrc entropy calculated at 7.95 H (PACKED)."]
        },
        {
          id: "T1140",
          name: "Deobfuscate/Decode Files or Information",
          score: "7.5",
          confidence: "90%",
          risk: "ELEVATED",
          link: "https://attack.mitre.org/techniques/T1140/",
          desc: "Dynamic decryption of bytecode or machine instructions immediately before virtual memory mapping execution, evading standard air-gap file filters.",
          events: ["[SYS_LOG] Heap memory decryption loop initialized."]
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#222222]/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
            MITRE ATT&CK Enterprise Matrix Alignment
          </h3>
          <p className="text-[11px] text-[#A0A0A0] font-light font-sans">
            Aligning intercepted forensic signals, registry writes, and memory hollowing patterns against official threat tactics definitions.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#ff4040]/10 border border-[#ff4040]/20 text-[#ff4040] font-mono text-[10px] px-3 py-1 rounded">
          <Shield className="w-3.5 h-3.5" /> SECURITY MAP LEVEL 3
        </div>
      </div>

      {/* Accordion Layout */}
      <div className="space-y-4">
        {mitreMatrix.map((tactic) => {
          const isExpanded = expandedTactic === tactic.id;
          return (
            <div 
              key={tactic.id} 
              className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden transition-all duration-200"
            >
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedTactic(isExpanded ? null : tactic.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#171717] transition-all text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tactic.color }} />
                  <span className="text-sm font-bold text-white font-sans uppercase tracking-wide">
                    {tactic.title}
                  </span>
                  <span className="bg-[#171717] border border-[#222222] text-[10px] font-mono font-bold text-[#A0A0A0] px-2 py-0.5 rounded">
                    {tactic.count} {tactic.count === 1 ? "Technique" : "Techniques"} detected
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-[#A0A0A0]" /> : <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />}
              </button>

              {/* Accordion Content with Technique Cards */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-[#222222]/60 bg-[#090909]/60 divide-y divide-[#222222]/40">
                  {tactic.techniques.map((tech) => (
                    <div key={tech.id} className="py-5 first:pt-2 last:pb-2 space-y-4">
                      
                      {/* Top Info row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 font-mono">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-[#16ff4d]">{tech.id}</span>
                          <h4 className="text-xs font-bold text-white font-sans">{tech.name}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-[#6F6F6F]">ATT&CK SCORE: <span className="text-white font-bold">{tech.score}</span></span>
                          <span className="text-[#6F6F6F]">CONFIDENCE: <span className="text-[#16ff4d] font-bold">{tech.confidence}</span></span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                            tech.risk === "CRITICAL" ? "bg-red-950/40 text-[#ff4040] border-red-500/20" : "bg-yellow-950/40 text-[#f4b400] border-yellow-500/20"
                          }`}>
                            {tech.risk}
                          </span>
                          <a 
                            href={tech.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[#00c2ff] hover:underline flex items-center gap-1 shrink-0"
                          >
                            MITRE DOCS <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Description & Evidence */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 font-mono text-[11px]">
                        <div className="md:col-span-7 space-y-2">
                          <span className="text-[10px] text-[#6F6F6F] uppercase tracking-widest block font-bold">
                            TECHNIQUE DESCRIPTION
                          </span>
                          <p className="text-[#A0A0A0] font-sans leading-relaxed text-xs">
                            {tech.desc}
                          </p>
                        </div>

                        <div className="md:col-span-5 bg-[#111111]/80 border border-[#222222] p-4 rounded-lg space-y-2">
                          <span className="text-[10px] text-[#6F6F6F] uppercase tracking-widest block font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#ff4040]" />
                            LINKED FORENSIC LOG SIGNALS
                          </span>
                          <div className="space-y-1.5 font-mono text-[10px]">
                            {tech.events.map((evt, idx) => (
                              <p key={idx} className="text-[#ff4040] truncate pl-1 border-l border-red-500/30">
                                {evt}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

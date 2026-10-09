import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  FileText, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ATTACK_VECTORS_DATA, MITRE_TACTICS } from '../../data/mockData';
import { MitreTechnique } from '../../types/soc';

export const AnalyticsReports: React.FC = () => {
  const [selectedVector, setSelectedVector] = useState<string | null>(null);
  const [selectedTactic, setSelectedTactic] = useState<MitreTechnique | null>(null);
  const [reportCopied, setReportCopied] = useState(false);

  // Confidence distribution brackets
  const confidenceBrackets = [
    { range: '90% - 100%', count: 684, pct: 49, desc: 'High-Fidelity Signature & Behavioral Match', color: '#ef4444' },
    { range: '75% - 89%', count: 420, pct: 30, desc: 'Heuristic ML Anomaly & IOC Correlation', color: '#f59e0b' },
    { range: '50% - 74%', count: 218, pct: 15, desc: 'Threshold Alert / Baseline Deviation', color: '#06b6d4' },
    { range: '< 50%', count: 80, pct: 6, desc: 'Low Confidence / Shadow Probe', color: '#64748b' },
  ];

  const handleDownloadReport = () => {
    const reportText = `# CYBER OPERATIONS CENTER - INCIDENTIAL EXECUTIVE BRIEFING
Generated: ${new Date().toISOString()}
Classification: CONFIDENTIAL // SOC LEVEL 4
DEFCON State: DEFCON 2 (SEVERE THREAT)

## EXECUTIVE SUMMARY
Over the last 72 hours, the SIEM has identified a coordinated attack originating from multiple distributed IP addresses. The primary vectors are Brute Force (28%) and DDoS (32%) directed at edge routers. Additionally, lateral movement was detected at 08:22Z targeting internal segment 10.0.0.x, attempting data exfiltration. Automated defense mechanisms successfully dropped 94% of malicious packets. Manual review is required for incident evt_901 (Ransomware signature match).

## KEY THREAT METRICS
- Total Blocked Intrusions (24h): 1,402
- Active Uncontained Incidents: 2
- Mean Time to Detect (MTTD): 14 minutes (-3m improvement)
- Total High-Risk CVEs in Scope: 235

## ATTACK VECTORS BREAKDOWN
- DDoS (SYN / Volumetric): 32% (448 incidents)
- Brute Force Credential Spray: 28% (392 incidents)
- Ransomware Staging & Malware: 14% (196 incidents)
- Data Exfiltration / C2: 12% (168 incidents)
- SQL Injection / Web Exploits: 9% (126 incidents)
- Zero-Day / Exploit Chaining: 5% (72 incidents)

## CONTAINMENT ACTIONS UNDERTAKEN
[X] Perimeter BGP Flowspec rate-limiting engaged on edge firewalls
[X] Target server 10.0.0.19 network interfaces partitioned into isolation VLAN
[X] 1,402 Malicious IP addresses pushed to perimeter null-routes
[X] Automated session revoking and credential rotation executed for Admin Bastion

Audited by: SOC-ADMIN-GATEWAY`;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOC_Incident_Report_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            Incident Analytics & Reports
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-normal">
              EXECUTIVE INTELLIGENCE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated threat vectors, confidence distribution, MITRE ATT&CK kill-chain mapping, and automated incident briefs.
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT EXECUTIVE BRIEFING (.MD)</span>
        </button>
      </div>

      {/* Grid 2 from HTML: Attack Vectors Distribution & Confidence Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Attack Vectors Distribution */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wide flex items-center gap-2">
                <PieIcon className="w-4 h-4" />
                Attack Vectors Distribution
              </h3>
              <span className="text-[11px] font-mono text-slate-400">1,402 TOTAL EVENTS</span>
            </div>

            {/* Visual Donut / Stacked Progress representation */}
            <div className="w-full bg-[#090e1a] h-5 rounded-full overflow-hidden flex mb-5 border border-slate-800">
              {ATTACK_VECTORS_DATA.map((vec, i) => (
                <div
                  key={i}
                  style={{ width: `${vec.pct}%`, backgroundColor: vec.color }}
                  className="h-full cursor-pointer hover:opacity-80 transition-opacity"
                  title={`${vec.name}: ${vec.pct}% (${vec.count} events)`}
                  onClick={() => setSelectedVector(vec.name)}
                />
              ))}
            </div>

            {/* List breakdown */}
            <div className="space-y-2.5">
              {ATTACK_VECTORS_DATA.map((vec, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedVector(selectedVector === vec.name ? null : vec.name)}
                  className={`p-2.5 rounded cursor-pointer transition-all border ${
                    selectedVector === vec.name
                      ? 'bg-cyan-950/20 border-cyan-500/50'
                      : 'bg-[#0b101d] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: vec.color }}></span>
                      <span className="text-slate-200 font-sans font-medium">{vec.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{vec.count} hits</span>
                      <span className="font-bold text-cyan-400">{vec.pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Primary Vector: <strong className="text-red-400">DDoS (32%)</strong></span>
            <span>Secondary: <strong className="text-amber-400">Brute Force (28%)</strong></span>
          </div>
        </div>

        {/* Card 2: Confidence Scores by Threat */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wide flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Confidence Scores by Threat
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">MODEL PRECISION: 98.4%</span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Statistical confidence breakdown of automated signature and behavioral detections across the fleet.
            </p>

            <div className="space-y-4">
              {confidenceBrackets.map((item, idx) => (
                <div key={idx} className="bg-[#0b101d] p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="font-bold text-slate-200">{item.range}</span>
                    <span className="text-cyan-400 font-semibold">{item.count} detections ({item.pct}%)</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#090e1a] h-2 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans block">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>False Positive Rate: <strong className="text-emerald-400">0.02%</strong></span>
            <span>Verification: <strong className="text-slate-300">Dual-Engine Consensus</strong></span>
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Matrix Heatmap */}
      <div className="bg-[#101726] border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4" />
              MITRE ATT&CK Enterprise Kill-Chain Matrix
            </h3>
            <span className="text-xs text-slate-400">
              Interactive technique coverage based on active SIEM telemetry and IOC rules
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">10 TACTICS MONITORED</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
          {MITRE_TACTICS.map((tactic) => (
            <div
              key={tactic.id}
              onClick={() => setSelectedTactic(selectedTactic?.id === tactic.id ? null : tactic)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedTactic?.id === tactic.id
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-md'
                  : 'bg-[#0b101d] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-500 uppercase">{tactic.tactic}</div>
              <div className="text-xs font-bold font-mono text-cyan-400 mt-0.5">{tactic.id}</div>
              <div className="text-xs text-slate-200 mt-1 line-clamp-1">{tactic.name}</div>
              <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-1.5 border-t border-slate-800">
                <span className="text-slate-500">Hits:</span>
                <span className="font-bold text-amber-400">{tactic.detections}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedTactic && (
          <div className="mt-4 p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/40 text-xs font-mono space-y-1">
            <div className="flex justify-between items-center">
              <strong className="text-cyan-400">{selectedTactic.id}: {selectedTactic.name}</strong>
              <span className="text-slate-400">Tactic: {selectedTactic.tactic}</span>
            </div>
            <p className="text-slate-300 font-sans">{selectedTactic.description}</p>
          </div>
        )}
      </div>

      {/* Automated Incident Report Summary Card (Matching HTML verbatim + elevating) */}
      <div className="bg-[#101726] border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Automated Incident Report Summary
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            AUTO-GENERATED (72H CYCLE)
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#0a0e17] border border-slate-800/80 font-sans text-slate-300 text-xs leading-relaxed space-y-3">
          <p>
            Over the last 72 hours, the SIEM has identified a coordinated attack originating from multiple distributed IP addresses. The primary vectors are <strong className="text-amber-400">Brute Force</strong> and <strong className="text-red-400">DDoS</strong> directed at edge routers. Additionally, lateral movement was detected at 08:22Z targeting internal segment 10.0.0.x, attempting data exfiltration. Automated defense mechanisms successfully dropped <strong className="text-emerald-400">94%</strong> of malicious packets. Manual review is required for incident <strong>evt_901 (Ransomware signature match)</strong>.
          </p>

          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> BGP Flowspec Mitigation Active
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Host 10.0.0.19 Quarantined
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-4 h-4" /> 1 Incident Pending Senior Analyst Sign-off
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  ToggleLeft, 
  ToggleRight,
  RotateCw,
  Terminal,
  Zap
} from 'lucide-react';
import { DefenseNode } from '../../types/soc';
import { DEFENSE_NODES } from '../../data/mockData';
import { playCyberBeep } from '../../utils/audio';

interface SystemHealthProps {
  soundEnabled: boolean;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ soundEnabled }) => {
  const [nodes, setNodes] = useState<DefenseNode[]>(DEFENSE_NODES);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeResults, setProbeResults] = useState<Record<string, { latency: number; ok: boolean }> | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Engine toggles
  const [synFloodFilter, setSynFloodFilter] = useState<boolean>(true);
  const [zeroTrustStrict, setZeroTrustStrict] = useState<boolean>(true);
  const [decoyTraps, setDecoyTraps] = useState<boolean>(true);
  const [promiscuousSniff, setPromiscuousSniff] = useState<boolean>(false);

  const handleRunDiagnostic = () => {
    setIsProbing(true);
    setActionMessage('Dispatching ICMP & TLS diagnostic probes to all 6 defense nodes...');

    setTimeout(() => {
      const results: Record<string, { latency: number; ok: boolean }> = {};
      nodes.forEach(node => {
        results[node.id] = {
          latency: Math.floor(Math.random() * 8) + 1,
          ok: true
        };
      });
      setProbeResults(results);
      setIsProbing(false);
      setActionMessage('Diagnostic complete: All defense nodes responded within SLA (<10ms).');
      if (soundEnabled) playCyberBeep('mitigate');
    }, 1200);
  };

  const handleRestartNode = (nodeId: string, nodeName: string) => {
    if (soundEnabled) playCyberBeep('click');
    setActionMessage(`Cycling daemon on ${nodeName}... flushing memory buffers.`);
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'Healthy', cpuUsage: 25, lastUpdate: 'Just now' } : n));
    setTimeout(() => {
      setActionMessage(`${nodeName} daemon rebooted successfully. Service online.`);
    }, 1500);
  };

  const statusBadges: Record<string, { bg: string; text: string; border: string }> = {
    Healthy: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    'Under Load': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    Degraded: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
    Offline: { bg: 'bg-slate-700/20', text: 'text-slate-400', border: 'border-slate-700' },
  };

  return (
    <div className="space-y-6">
      {/* Title & Diagnostic Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            System Node Health & Config
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-normal">
              HARDWARE & SENSOR CLUSTER
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry from edge firewalls, IDS/IPS sensors, WAF proxies, and honeypot traps.
          </p>
        </div>

        <button
          onClick={handleRunDiagnostic}
          disabled={isProbing}
          className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
          <span>{isProbing ? 'PROBING NODES...' : 'RUN CLUSTER DIAGNOSTIC'}</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-cyan-950/20 border border-cyan-500/40 rounded-lg text-xs font-mono text-cyan-300 flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            {actionMessage}
          </span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Grid 4 KPI Cards (Matching Prompt HTML) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core CPU Load */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs text-slate-400 uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Core CPU Load</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-400 mt-2">
            42%
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>64 Cores (AMD EPYC 9654)</span>
            <span className="text-emerald-400 font-mono">Normal Load</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs text-slate-400 uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Memory Usage</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400 mt-2">
            78%
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>399 GB / 512 GB ECC RAM</span>
            <span className="text-amber-400 font-mono">Buffer Cache</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Network Bandwidth */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs text-slate-400 uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Network Bandwidth</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-2">
            2.4 Gbps
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Ingress: 2.4G · Egress: 410M</span>
            <span className="text-emerald-400 font-mono">100Gb Uplink</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: '24%' }}></div>
          </div>
        </div>

        {/* Firewall Status */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs text-slate-400 uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Firewall Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-2">
            ONLINE
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>BGP Flowspec & DPI active</span>
            <span className="text-emerald-400 font-mono">0 Drops/min</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Active Defense Nodes Management Table (Completing truncated HTML) */}
      <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wide flex items-center gap-2">
              <Server className="w-4 h-4" />
              Active Defense Nodes
            </h3>
            <span className="text-xs text-slate-400">
              Fleet sensors running stateful deep-packet inspection, Snort signatures, and decoy traps
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            6/6 ENROLLED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-cyan-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Node Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">IP Range</th>
                <th className="py-2.5 px-3">CPU / Mem</th>
                <th className="py-2.5 px-3">Throughput</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Probe</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {nodes.map((node) => {
                const badge = statusBadges[node.status] || statusBadges.Healthy;
                const probe = probeResults ? probeResults[node.id] : null;

                return (
                  <tr key={node.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-200">
                      {node.name}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                        {node.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-cyan-400">
                      {node.ipRange}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={node.cpuUsage > 80 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {node.cpuUsage}% CPU
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{node.memoryUsage}% RAM</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {node.networkThroughput}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badge.bg} ${badge.text} ${badge.border}`}>
                        {node.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {probe ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> {probe.latency}ms
                        </span>
                      ) : (
                        node.lastUpdate
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleRestartNode(node.id, node.name)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors border border-slate-700"
                        title="Reboot daemon"
                      >
                        Restart
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Engine Config & Heuristic Switches */}
      <div className="bg-[#101726] border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wide mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Autonomous Defense Engine Policies
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-[#0b101d] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">SYN Flood BGP Rate-Limiting</div>
              <p className="text-[11px] text-slate-400">Automatically trigger SYN cookies when ingress exceeds 10k pps.</p>
            </div>
            <button
              onClick={() => setSynFloodFilter(!synFloodFilter)}
              className="text-cyan-400"
            >
              {synFloodFilter ? <ToggleRight className="w-7 h-7 text-cyan-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0b101d] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Zero-Trust Strict Mutual TLS</div>
              <p className="text-[11px] text-slate-400">Enforce cryptographic device attestation on all admin endpoints.</p>
            </div>
            <button
              onClick={() => setZeroTrustStrict(!zeroTrustStrict)}
              className="text-cyan-400"
            >
              {zeroTrustStrict ? <ToggleRight className="w-7 h-7 text-cyan-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0b101d] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Decoy Honeypot Trap Routing</div>
              <p className="text-[11px] text-slate-400">Redirect unauthenticated SMB/SSH scanner probes into isolated sandbox.</p>
            </div>
            <button
              onClick={() => setDecoyTraps(!decoyTraps)}
              className="text-cyan-400"
            >
              {decoyTraps ? <ToggleRight className="w-7 h-7 text-cyan-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0b101d] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Promiscuous Sniffing on Core Switch</div>
              <p className="text-[11px] text-slate-400">Capture 100% of internal transit packets for forensic pcap analysis.</p>
            </div>
            <button
              onClick={() => setPromiscuousSniff(!promiscuousSniff)}
              className="text-cyan-400"
            >
              {promiscuousSniff ? <ToggleRight className="w-7 h-7 text-cyan-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

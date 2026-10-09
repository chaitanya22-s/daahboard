import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Search, 
  Download, 
  RefreshCw, 
  Filter, 
  Ban, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Trash2, 
  Radio, 
  Pause, 
  Play,
  CornerDownLeft,
  Shield,
  FileCode
} from 'lucide-react';
import { SiemLog, AlertSeverity } from '../../types/soc';
import { playCyberBeep } from '../../utils/audio';

interface RawLogsProps {
  logs: SiemLog[];
  onAddLog: (log: SiemLog) => void;
  onBlockIp: (ip: string) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  soundEnabled: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const RawLogs: React.FC<RawLogsProps> = ({
  logs,
  onAddLog,
  onBlockIp,
  isStreaming,
  setIsStreaming,
  soundEnabled,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedProto, setSelectedProto] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    '[SYSTEM] Initializing SIEM ingest kernel v4.19-rt...',
    '[SYSTEM] Listening on syslog UDP/514 and TLS/6514...',
    '[SURICATA] Rule database loaded: 38,421 active threat signatures.',
    '[KERNEL] eBPF XDP high-performance packet filter attached to eth0.',
    '[THREAT-INTEL] Syncing AlienVault OTX & AbuseIPDB blacklists: OK.',
    '[SIEM] Log ingestion queue online (buffer depth: 50,000 events).',
    '[ALERT] ALT-001 LockBit 3.0 ransomware staging IOC identified.',
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [autoScrollTerminal, setAutoScrollTerminal] = useState<boolean>(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-generate streaming logs when streaming is enabled
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const sampleIps = [
        { ip: '185.220.101.' + Math.floor(Math.random() * 250), cc: 'TOR', type: 'Tor Exit Proxy' },
        { ip: '103.145.73.' + Math.floor(Math.random() * 250), cc: 'AP', type: 'SYN Flood Blast' },
        { ip: '45.154.255.' + Math.floor(Math.random() * 250), cc: 'EU', type: 'SSH Brute Force' },
        { ip: '194.26.29.' + Math.floor(Math.random() * 250), cc: 'RU', type: 'DNS Tunnel Exfil' },
        { ip: '91.240.118.' + Math.floor(Math.random() * 250), cc: 'BR', type: 'Blind SQLi Probe' },
        { ip: '198.51.100.' + Math.floor(Math.random() * 250), cc: 'US', type: 'Zero-Day Deserialization' },
      ];
      const targetIps = ['10.0.0.19', '192.168.1.105', '192.168.1.200', '10.0.0.84', '10.0.2.40'];
      const protocols: ('TCP' | 'UDP' | 'ICMP' | 'HTTP/2' | 'DNS')[] = ['TCP', 'UDP', 'ICMP', 'HTTP/2', 'DNS'];
      const statuses: ('Blocked' | 'Dropped' | 'Quarantined' | 'Flagged')[] = ['Blocked', 'Dropped', 'Quarantined', 'Flagged'];

      const chosen = sampleIps[Math.floor(Math.random() * sampleIps.length)];
      const proto = protocols[Math.floor(Math.random() * protocols.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const confidence = Math.floor(Math.random() * 20) + 80;

      const newLog: SiemLog = {
        id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timeStr,
        sourceIp: chosen.ip,
        destIp: targetIps[Math.floor(Math.random() * targetIps.length)],
        protocol: proto,
        port: proto === 'DNS' ? 53 : proto === 'HTTP/2' ? 443 : Math.floor(Math.random() * 8000) + 80,
        size: `${(Math.random() * 15 + 0.5).toFixed(1)} KB`,
        attackType: chosen.type,
        confidence,
        status,
        severity: confidence > 90 ? 'critical' : 'high',
        countryCode: chosen.cc,
        rawPayload: `HEX_DUMP 0x${Math.random().toString(16).substring(2, 10)} ${chosen.type.toUpperCase()}_SIGNATURE_MATCH`
      };

      onAddLog(newLog);

      // Append terminal output
      setTerminalHistory(prev => [
        ...prev.slice(-120),
        `[${newLog.status.toUpperCase()}] ${newLog.timestamp} | ${newLog.sourceIp} -> ${newLog.destIp}:${newLog.port} (${newLog.protocol}) | ${newLog.attackType} (Conf: ${newLog.confidence}%)`
      ]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming, onAddLog]);

  // Scroll terminal to bottom
  useEffect(() => {
    if (autoScrollTerminal && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, autoScrollTerminal]);

  // Terminal command executor
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    const parts = cmd.split(' ');
    const action = parts[0].toLowerCase();
    const arg = parts[1];

    let response = '';

    switch (action) {
      case 'help':
        response = `AVAILABLE COMMANDS:
  status        - Print SOC cluster health & DEFCON status
  threats       - List recent active threat IDs
  block <ip>    - Blacklist origin IP across all border firewalls
  unblock <ip>  - Lift IP block rule
  ping <ip>     - Send ICMP echo diagnostic packet
  clear         - Clear terminal buffer
  whoami        - Print operator auth credentials`;
        break;

      case 'status':
        response = `[SOC STATUS] CLUSTER=ONLINE | IDS=ACTIVE | DROPS=99.2% | INGEST_RATE=48.2k eps`;
        break;

      case 'threats':
        response = `ACTIVE PRIORITY INCIDENTS:
  ALT-001 | Ransomware | DB-Server-1 (10.0.0.19)
  ALT-002 | DDoS SYN   | Web-Gateway (192.168.1.105)
  ALT-003 | SSH Brute  | Admin-Portal (192.168.1.200)`;
        break;

      case 'block':
        if (arg) {
          onBlockIp(arg);
          if (soundEnabled) playCyberBeep('block');
          response = `[FIREWALL] IP ${arg} successfully added to iptables & BGP Flowspec drop list.`;
        } else {
          response = `Usage: block <ip-address>`;
        }
        break;

      case 'unblock':
        response = `[FIREWALL] Rule removed for ${arg || 'null'}. Traffic normalized.`;
        break;

      case 'ping':
        response = `PING ${arg || '127.0.0.1'} (56 data bytes): 64 bytes from ${arg || '127.0.0.1'}: icmp_seq=1 ttl=64 time=0.428 ms`;
        break;

      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;

      case 'whoami':
        response = `operator: sec-admin-root (Role: Security Engineer Level 4, Clearance: Top Secret / SOC-ALPHA)`;
        break;

      default:
        response = `Command not recognized: '${cmd}'. Type 'help' for available commands.`;
        break;
    }

    setTerminalHistory(prev => [
      ...prev,
      `soc-admin@node-gateway:~$ ${cmd}`,
      response
    ]);
    setTerminalInput('');
  };

  // Export handlers
  const exportAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `siem_threat_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsCsv = () => {
    const headers = ['ID', 'Timestamp', 'Source IP', 'Dest IP', 'Protocol', 'Port', 'Size', 'Attack Type', 'Confidence', 'Status'];
    const rows = logs.map(l => [
      l.id, l.timestamp, l.sourceIp, l.destIp, l.protocol, l.port, l.size, `"${l.attackType}"`, `${l.confidence}%`, l.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `siem_threat_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCopyLog = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sourceIp.includes(searchQuery) ||
      log.destIp.includes(searchQuery) ||
      log.attackType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProto = selectedProto === 'ALL' || log.protocol === selectedProto;
    const matchesStatus = selectedStatus === 'ALL' || log.status === selectedStatus;

    return matchesSearch && matchesProto && matchesStatus;
  });

  const statusBadges: Record<string, { bg: string; text: string; border: string }> = {
    Blocked: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    Dropped: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    Quarantined: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
    Flagged: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    Allowed: { bg: 'bg-slate-700/20', text: 'text-slate-300', border: 'border-slate-700' },
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            Raw Threat Intelligence Logs
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-normal">
              SIEM INGEST TELEMETRY
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tabular output of raw SIEM ingest data with live terminal feed and packet disassembly.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors border flex items-center gap-1.5 ${
              isStreaming
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isStreaming ? <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'STREAMING ACTIVE' : 'STREAM PAUSED'}</span>
          </button>

          <button
            onClick={exportAsCsv}
            className="px-3 py-1.5 rounded bg-[#111927] hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={exportAsJson}
            className="px-3 py-1.5 rounded bg-[#111927] hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPORT JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#101726] border border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by IP, Attack Type, or Event ID..."
            className="w-full bg-[#090e1a] border border-slate-700 rounded py-1.5 pl-9 pr-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
          />
        </div>

        {/* Protocol Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px]">PROTO:</span>
          {['ALL', 'TCP', 'UDP', 'ICMP', 'DNS', 'HTTP/2'].map(proto => (
            <button
              key={proto}
              onClick={() => setSelectedProto(proto)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                selectedProto === proto
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px]">STATUS:</span>
          {['ALL', 'Blocked', 'Dropped', 'Quarantined', 'Flagged'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                selectedStatus === status
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tabular Card (Matching HTML spec) */}
      <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-cyan-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Dest IP</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Attack Type</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No SIEM ingest records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 15).map((log) => {
                  const badge = statusBadges[log.status] || statusBadges.Blocked;
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-cyan-950/20' : ''
                        }`}
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-200">
                          {log.id}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-red-400">
                          {log.sourceIp}
                          {log.countryCode && (
                            <span className="ml-1 text-[10px] text-slate-500 font-normal">
                              [{log.countryCode}]
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {log.destIp}:{log.port}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                            {log.protocol}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {log.size}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 font-sans">
                          {log.attackType}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className={log.confidence > 90 ? 'text-red-400 font-bold' : 'text-amber-400'}>
                              {log.confidence}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badge.bg} ${badge.text} ${badge.border}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedLogId(isExpanded ? null : log.id);
                            }}
                            className="p-1 text-slate-400 hover:text-cyan-400"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Row Expansion - Disassembled Packet Details */}
                      {isExpanded && (
                        <tr className="bg-[#0b101d] border-b border-slate-800">
                          <td colSpan={10} className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                              <span className="font-bold text-cyan-400 flex items-center gap-2">
                                <TerminalIcon className="w-3.5 h-3.5" />
                                INGEST ARTIFACT // DEEP PACKET INSPECTION
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopyLog(JSON.stringify(log, null, 2), log.id)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1"
                                >
                                  {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  {copiedId === log.id ? 'Copied' : 'Copy JSON'}
                                </button>
                                <button
                                  onClick={() => onBlockIp(log.sourceIp)}
                                  className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-[11px] flex items-center gap-1"
                                >
                                  <Ban className="w-3 h-3" />
                                  Blacklist {log.sourceIp}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
                                  Captured Payload Segment
                                </span>
                                <pre className="p-2.5 rounded bg-black/80 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap border border-slate-800">
                                  {log.rawPayload || 'Payload stripped by zero-trust ingress filter.'}
                                </pre>
                              </div>
                              <div className="space-y-1.5 text-slate-300">
                                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
                                  SIEM Ingest Metadata
                                </span>
                                <div className="flex justify-between border-b border-slate-800/80 py-0.5">
                                  <span className="text-slate-500">Ingress Sensor:</span>
                                  <span className="text-slate-300">FW-Edge-01 (192.168.0.1)</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800/80 py-0.5">
                                  <span className="text-slate-500">MITRE Technique:</span>
                                  <span className="text-amber-400 font-bold">T1190 / Initial Access</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800/80 py-0.5">
                                  <span className="text-slate-500">Action Enforced:</span>
                                  <span className="text-cyan-400">Layer-4 Drop via iptables</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono text-slate-500 flex justify-between items-center">
          <span>Displaying {Math.min(15, filteredLogs.length)} of {filteredLogs.length} buffered events</span>
          <span>Buffer depth: 100% capacity</span>
        </div>
      </div>

      {/* Live Terminal Feed (Matching HTML code-block from prompt) */}
      <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wide">
              Live Terminal Feed (Interactive SIEM Console)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setAutoScrollTerminal(!autoScrollTerminal)}
              className={`px-2 py-0.5 rounded border text-[11px] ${
                autoScrollTerminal
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Auto-Scroll: {autoScrollTerminal ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setTerminalHistory([])}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-[11px] flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>

        {/* Monospace Output */}
        <div className="bg-black text-[#10b981] p-4 rounded-md font-mono text-xs h-72 overflow-y-auto border border-slate-900 shadow-inner select-text space-y-1">
          {terminalHistory.map((line, idx) => {
            const isAlert = line.includes('[ALERT]') || line.includes('[QUARANTINED]');
            const isDrop = line.includes('[DROPPED]') || line.includes('[BLOCKED]');
            return (
              <div
                key={idx}
                className={`leading-relaxed ${
                  isAlert
                    ? 'text-red-400 font-bold'
                    : isDrop
                    ? 'text-cyan-300'
                    : line.startsWith('soc-admin')
                    ? 'text-amber-400'
                    : 'text-emerald-400/90'
                }`}
              >
                {line}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>

        {/* Interactive Command Input Form */}
        <form onSubmit={handleTerminalSubmit} className="mt-2 flex items-center gap-2 font-mono text-xs">
          <div className="text-cyan-400 shrink-0 font-bold">soc-admin@node-gateway:~$</div>
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            placeholder="Type 'help', 'status', 'threats', 'block <ip>', or 'ping <node>'..."
            className="flex-1 bg-black text-white px-3 py-1.5 rounded border border-slate-800 focus:outline-none focus:border-cyan-500 text-xs font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs flex items-center gap-1"
          >
            <CornerDownLeft className="w-3.5 h-3.5" /> Run
          </button>
        </form>
      </div>
    </div>
  );
};

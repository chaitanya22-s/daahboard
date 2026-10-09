import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  ExternalLink, 
  Ban, 
  Server, 
  KeyRound, 
  Clock, 
  Globe, 
  Activity, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { ThreatAlert } from '../types/soc';

interface IncidentModalProps {
  alert: ThreatAlert | null;
  onClose: () => void;
  onMitigate: (alertId: string) => void;
  onBlockIp: (ip: string) => void;
  onIsolateHost: (targetIp: string) => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  alert,
  onClose,
  onMitigate,
  onBlockIp,
  onIsolateHost,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'playbook'>('details');
  const [isIsolated, setIsIsolated] = useState(false);
  const [isIpBlocked, setIsIpBlocked] = useState(false);
  const [credentialsRevoked, setCredentialsRevoked] = useState(false);

  if (!alert) return null;

  const severityBadgeColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    low: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  };

  const handleIsolateClick = () => {
    setIsIsolated(true);
    onIsolateHost(alert.targetIp);
  };

  const handleBlockIpClick = () => {
    setIsIpBlocked(true);
    onBlockIp(alert.sourceIp);
  };

  const handleRevokeCredentials = () => {
    setCredentialsRevoked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0e1626] border border-slate-700/80 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#121c30] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border uppercase ${severityBadgeColors[alert.severity]}`}>
              {alert.severity}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100 font-mono">
                  {alert.id}: {alert.attackType}
                </h3>
                <span className="text-xs text-slate-400">({alert.status})</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5 font-mono">
                <span>Target: <strong className="text-slate-200">{alert.target}</strong> ({alert.targetIp})</span>
                <span>•</span>
                <span>Origin: <strong className="text-red-400">{alert.sourceIp}</strong> ({alert.sourceCountry})</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0b1220] px-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Incident Telemetry
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Attack Kill-Chain Timeline
          </button>
          <button
            onClick={() => setActiveTab('playbook')}
            className={`py-2.5 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'playbook'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Containment Playbook (SOAR)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Summary Description */}
              <div className="p-3.5 rounded-lg bg-[#111928] border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-semibold block mb-1 font-mono uppercase tracking-wider text-[11px]">
                  SIEM Narrative / Threat Description
                </span>
                {alert.description}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#111928] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Confidence Score</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{alert.confidence}%</div>
                  <span className="text-[10px] text-slate-500">Heuristic ML + Signature match</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111928] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">CVSS Impact Score</span>
                  <div className="text-xl font-bold font-mono text-red-400 mt-1">{alert.impactScore} / 10</div>
                  <span className="text-[10px] text-slate-500">Severity: Critical Vector</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111928] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">MITRE ATT&CK</span>
                  <div className="text-sm font-bold font-mono text-amber-400 mt-1">{alert.mitreId}</div>
                  <span className="text-[10px] text-slate-400">{alert.mitreTactic}</span>
                </div>
              </div>

              {/* IOC Payload Inspection */}
              {alert.payloadSample && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-cyan-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Captured Packet Payload / Artifact
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">PCAP INGEST #4812</span>
                  </div>
                  <pre className="p-3 rounded bg-black/90 text-emerald-400 border border-slate-800 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap select-all">
                    {alert.payloadSample}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-cyan-900/50"></span>
                  <div className="text-xs font-mono text-slate-400">T-08m 14s</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">Initial Port Reconnaissance Detected</div>
                  <p className="text-xs text-slate-400 mt-0.5">Automated scanner originated from {alert.sourceIp} probing target port 443 / 445.</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-900/50"></span>
                  <div className="text-xs font-mono text-slate-400">T-05m 22s</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">Exploit Payload Inbound Transit</div>
                  <p className="text-xs text-slate-400 mt-0.5">Signature pattern matched {alert.attackType}. Traffic flagged by Snort/Suricata engine.</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-900/50"></span>
                  <div className="text-xs font-mono text-slate-400">T-02m 00s</div>
                  <div className="text-xs font-semibold text-red-400 mt-0.5">High Severity Alert Triggered</div>
                  <p className="text-xs text-slate-400 mt-0.5">Automated SIEM rule escalated incident to Level 1 on-call security response.</p>
                </div>

                <div className="relative">
                  <span className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${alert.status === 'Mitigated' ? 'bg-emerald-400 ring-4 ring-emerald-900/50' : 'bg-slate-500'}`}></span>
                  <div className="text-xs font-mono text-slate-400">Current State</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">Operator Remediation Phase</div>
                  <p className="text-xs text-slate-400 mt-0.5">Status: <span className="text-cyan-400 font-mono">{alert.status}</span></p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'playbook' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Execute automated containment playbooks via the SOAR orchestrator. Actions take effect immediately across all edge firewalls and endpoint agents.
              </p>

              {/* Action 1: Isolate Target Host */}
              <div className="p-3.5 rounded-lg bg-[#111928] border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-200">Isolate Target Host ({alert.target})</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Sever network interfaces on {alert.targetIp} to stop lateral movement.</p>
                </div>
                <button
                  onClick={handleIsolateClick}
                  disabled={isIsolated}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                    isIsolated
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                  }`}
                >
                  {isIsolated ? '✓ HOST ISOLATED' : 'SEVER NETWORK'}
                </button>
              </div>

              {/* Action 2: Block Origin IP */}
              <div className="p-3.5 rounded-lg bg-[#111928] border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">Blacklist Source IP ({alert.sourceIp})</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Push BGP drop rule to all border routers and Cloud WAF endpoints.</p>
                </div>
                <button
                  onClick={handleBlockIpClick}
                  disabled={isIpBlocked}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                    isIpBlocked
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {isIpBlocked ? '✓ IP BLACKLISTED' : 'BLOCK IP'}
                </button>
              </div>

              {/* Action 3: Revoke Credentials */}
              <div className="p-3.5 rounded-lg bg-[#111928] border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-200">Revoke Stolen Credentials & Auth Tokens</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Force expire Active Directory sessions and rotate service keys.</p>
                </div>
                <button
                  onClick={handleRevokeCredentials}
                  disabled={credentialsRevoked}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                    credentialsRevoked
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40'
                  }`}
                >
                  {credentialsRevoked ? '✓ TOKENS FLUSHED' : 'REVOKE ALL'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#121c30] border-t border-slate-700/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Audit Trail: <span className="text-slate-300">Logged to SIEM WORM storage</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onMitigate(alert.id);
                onClose();
              }}
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono tracking-wide transition-all shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              RESOLVE & MITIGATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

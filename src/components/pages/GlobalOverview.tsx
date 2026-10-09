import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ExternalLink, 
  CheckCircle2, 
  Ban, 
  ArrowUpRight,
  Filter,
  BarChart2
} from 'lucide-react';
import { ThreatAlert } from '../../types/soc';
import { HOURLY_THREAT_VOLUME } from '../../data/mockData';

interface GlobalOverviewProps {
  alerts: ThreatAlert[];
  onSelectAlert: (alert: ThreatAlert) => void;
  onMitigateAlert: (id: string) => void;
  onBlockIp: (ip: string) => void;
  onNavigateToPage: (page: any) => void;
  blockedCount: number;
}

export const GlobalOverview: React.FC<GlobalOverviewProps> = ({
  alerts,
  onSelectAlert,
  onMitigateAlert,
  onBlockIp,
  onNavigateToPage,
  blockedCount,
}) => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [activeSeries, setActiveSeries] = useState<'all' | 'ddos' | 'bruteForce' | 'malware' | 'exfil'>('all');
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Active (non-mitigated) incidents count
  const activeIncidents = alerts.filter(a => a.status !== 'Mitigated').length;

  // Chart data calculation
  const chartData = HOURLY_THREAT_VOLUME;
  const maxVal = Math.max(...chartData.map(d => d.total)) * 1.15;
  const chartHeight = 180;
  const chartWidth = 580;

  const getPoints = (key: 'total' | 'ddos' | 'bruteForce' | 'malware' | 'exfil') => {
    return chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * (chartWidth - 40) + 20;
      const val = d[key];
      const y = chartHeight - (val / maxVal) * (chartHeight - 30) - 15;
      return `${x},${y}`;
    }).join(' ');
  };

  const getAreaPoints = (key: 'total') => {
    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * (chartWidth - 40) + 20;
      const val = d[key];
      const y = chartHeight - (val / maxVal) * (chartHeight - 30) - 15;
      return `${x},${y}`;
    });
    const firstX = 20;
    const lastX = chartWidth - 20;
    return `${firstX},${chartHeight} ${points.join(' ')} ${lastX},${chartHeight}`;
  };

  const statusBadges: Record<string, { bg: string; text: string; border: string }> = {
    Critical: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
    Mitigating: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    Blocked: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    Investigating: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
    Mitigated: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            Global Threat Overview
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-normal">
              REAL-TIME SIEM CORRELATION
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise boundary posture, real-time intrusion events, and automated incident triage.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToPage('threat-map')}
            className="px-3 py-1.5 rounded bg-[#111927] hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400 flex items-center gap-1.5 transition-colors"
          >
            <span>Live Threat Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateToPage('raw-logs')}
            className="px-3 py-1.5 rounded bg-[#111927] hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <span>Raw Ingest Stream</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid 4 KPI Cards (Matching and elevating Prompt HTML) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono tracking-wider">
            <span>Active Incidents</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-red-400 mt-2 flex items-baseline gap-2">
            <span>{activeIncidents}</span>
            <span className="text-xs font-medium text-red-400 flex items-center font-sans">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +2
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Critical triage queue</span>
            <span className="text-red-400/90 font-mono">2 Escalated</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono tracking-wider">
            <span>Mean Time to Detect (MTTD)</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-2 flex items-baseline gap-2">
            <span>14m</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center font-sans">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -3m
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Vs 30-day baseline (17m)</span>
            <span className="text-emerald-400/90 font-mono">18% Faster</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono tracking-wider">
            <span>High-Risk Vulnerabilities</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400 mt-2 flex items-baseline gap-2">
            <span>235</span>
            <span className="text-xs font-medium text-amber-400 flex items-center font-sans">
              <Minus className="w-3.5 h-3.5 mr-0.5" /> Stable
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>CVE-2026-X881 patched</span>
            <span className="text-amber-400/90 font-mono">42 Critical CVEs</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono tracking-wider">
            <span>Blocked Intrusions (24h)</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-400 mt-2 flex items-baseline gap-2">
            <span>{blockedCount.toLocaleString()}</span>
            <span className="text-xs font-medium text-cyan-400 flex items-center font-sans">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +15%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Border WAF & BGP drops</span>
            <span className="text-cyan-400/90 font-mono">99.4% Mitigated</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>
      </div>

      {/* Grid 2 Main Panels: Inbound Threat Volume Chart & Latest High-Severity Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inbound Threat Volume Chart (7 Cols) */}
        <div className="lg:col-span-6 bg-[#101726] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wide flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Inbound Threat Volume
                </h3>
                <span className="text-[11px] text-slate-400">
                  Telemetry distribution over 24h rolling SIEM buffer
                </span>
              </div>

              {/* Time window toggle */}
              <div className="flex items-center gap-1 bg-[#090e1a] p-1 rounded border border-slate-800 text-[11px] font-mono">
                {(['1h', '6h', '24h', '7d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      timeRange === r
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Series Toggles */}
            <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-mono">
              <button
                onClick={() => setActiveSeries('all')}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  activeSeries === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ● Total Ingress
              </button>
              <button
                onClick={() => setActiveSeries('ddos')}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  activeSeries === 'ddos'
                    ? 'bg-red-500/20 text-red-300 border-red-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ● DDoS (SYN)
              </button>
              <button
                onClick={() => setActiveSeries('bruteForce')}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  activeSeries === 'bruteForce'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ● Brute Force
              </button>
              <button
                onClick={() => setActiveSeries('malware')}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  activeSeries === 'malware'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ● Ransomware
              </button>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="relative w-full h-56 bg-[#090e1a] rounded border border-slate-800/80 p-2 overflow-hidden">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="redArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = chartHeight - pct * (chartHeight - 30) - 15;
                  return (
                    <g key={i}>
                      <line
                        x1="20"
                        y1={y}
                        x2={chartWidth - 20}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}

                {/* Area under curve for total */}
                {(activeSeries === 'all' || activeSeries === 'ddos') && (
                  <polygon
                    points={getAreaPoints('total')}
                    fill={activeSeries === 'ddos' ? 'url(#redArea)' : 'url(#cyanArea)'}
                  />
                )}

                {/* Total Line */}
                {(activeSeries === 'all') && (
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    points={getPoints('total')}
                  />
                )}

                {/* DDoS Line */}
                {(activeSeries === 'all' || activeSeries === 'ddos') && (
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={activeSeries === 'ddos' ? '3' : '1.5'}
                    strokeDasharray={activeSeries === 'all' ? '4 2' : undefined}
                    points={getPoints('ddos')}
                  />
                )}

                {/* Brute Force Line */}
                {(activeSeries === 'all' || activeSeries === 'bruteForce') && (
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={activeSeries === 'bruteForce' ? '3' : '1.5'}
                    points={getPoints('bruteForce')}
                  />
                )}

                {/* Malware Line */}
                {(activeSeries === 'all' || activeSeries === 'malware') && (
                  <polyline
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth={activeSeries === 'malware' ? '3' : '1.5'}
                    points={getPoints('malware')}
                  />
                )}

                {/* Data Points */}
                {chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * (chartWidth - 40) + 20;
                  const key = activeSeries === 'all' ? 'total' : activeSeries;
                  const val = d[key];
                  const y = chartHeight - (val / maxVal) * (chartHeight - 30) - 15;
                  const isHovered = hoveredDataIndex === i;

                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 5 : 3}
                        className="cursor-pointer transition-all fill-[#090e1a] stroke-cyan-400 stroke-2"
                        onMouseEnter={() => setHoveredDataIndex(i)}
                        onMouseLeave={() => setHoveredDataIndex(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip */}
              {hoveredDataIndex !== null && (
                <div
                  className="absolute z-10 bg-[#0e1626] border border-cyan-500/40 rounded p-2 text-xs font-mono shadow-xl pointer-events-none"
                  style={{
                    left: `${(hoveredDataIndex / (chartData.length - 1)) * 80 + 10}%`,
                    top: '20px',
                  }}
                >
                  <div className="text-cyan-400 font-bold">{chartData[hoveredDataIndex].time} UTC</div>
                  <div className="text-slate-300">Total: {chartData[hoveredDataIndex].total} events</div>
                  <div className="text-red-400">DDoS: {chartData[hoveredDataIndex].ddos}</div>
                  <div className="text-amber-400">Brute: {chartData[hoveredDataIndex].bruteForce}</div>
                </div>
              )}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-1 text-[10px] font-mono text-slate-500 px-2">
              {chartData.filter((_, i) => i % 2 === 0).map((d, i) => (
                <span key={i}>{d.time}</span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Peak Velocity: <strong className="text-cyan-400">310 events/min</strong></span>
            <span>Dropped Packets: <strong className="text-emerald-400">99.1%</strong></span>
          </div>
        </div>

        {/* Latest High-Severity Alerts Table (6 Cols) */}
        <div className="lg:col-span-6 bg-[#101726] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wide flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Latest High-Severity Alerts
                </h3>
                <span className="text-[11px] text-slate-400">
                  Priority incidents awaiting operator action or active mitigation
                </span>
              </div>
              <span className="text-[11px] font-mono text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                {alerts.filter(a => a.severity === 'critical').length} CRITICAL
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Attack Type</th>
                    <th className="pb-2">Target</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {alerts.slice(0, 5).map((alert) => {
                    const badge = statusBadges[alert.status] || statusBadges.Critical;
                    return (
                      <tr
                        key={alert.id}
                        className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                        onClick={() => onSelectAlert(alert)}
                      >
                        <td className="py-2.5 font-bold text-cyan-400">
                          {alert.id}
                        </td>
                        <td className="py-2.5 text-slate-200">
                          <div className="font-sans font-medium">{alert.attackType}</div>
                          <div className="text-[10px] text-slate-500">{alert.timestamp} · {alert.sourceCountry.split(' ')[0]}</div>
                        </td>
                        <td className="py-2.5 text-slate-300">
                          <div>{alert.target}</div>
                          <div className="text-[10px] text-slate-500">{alert.targetIp}</div>
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badge.bg} ${badge.text} ${badge.border}`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectAlert(alert)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                            title="Inspect details and kill chain"
                          >
                            Investigate
                          </button>
                          {alert.status !== 'Mitigated' && (
                            <button
                              onClick={() => onMitigateAlert(alert.id)}
                              className="px-2 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 text-[10px] transition-colors"
                              title="Resolve and mitigate"
                            >
                              Mitigate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Showing top 5 priority alerts</span>
            <button
              onClick={() => onNavigateToPage('raw-logs')}
              className="text-cyan-400 hover:underline font-mono text-[11px] flex items-center gap-1"
            >
              View Full Incident Ledger →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

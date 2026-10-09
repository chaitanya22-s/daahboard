import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe2, 
  Radar, 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Radio, 
  Pause, 
  Play, 
  Crosshair, 
  Maximize2,
  Lock,
  Layers,
  Activity
} from 'lucide-react';
import { TOP_SOURCE_COUNTRIES, TARGETED_INTERNAL_NODES } from '../../data/mockData';
import { playCyberBeep } from '../../utils/audio';

interface NodeLocation {
  id: string;
  name: string;
  ip: string;
  x: number; // SVG percentage 0 - 100
  y: number; // SVG percentage 0 - 100
  type: 'target' | 'attacker';
  country?: string;
}

const ATTACK_ORIGINS: NodeLocation[] = [
  { id: 'att-1', name: 'Tor Node Cluster', ip: '185.220.101.44', x: 49, y: 32, type: 'attacker', country: 'Tor / Netherlands' },
  { id: 'att-2', name: 'AP-East Threat Actor', ip: '103.145.73.12', x: 82, y: 38, type: 'attacker', country: 'East Asia' },
  { id: 'att-3', name: 'EU-Central Botnet', ip: '45.154.255.89', x: 52, y: 28, type: 'attacker', country: 'Central Europe' },
  { id: 'att-4', name: 'Eastern Europe C2', ip: '194.26.29.112', x: 62, y: 25, type: 'attacker', country: 'East Europe' },
  { id: 'att-5', name: 'LATAM Proxy Relay', ip: '91.240.118.23', x: 33, y: 72, type: 'attacker', country: 'South America' },
  { id: 'att-6', name: 'US-West Zombie Fleet', ip: '198.51.100.77', x: 18, y: 36, type: 'attacker', country: 'North America' },
  { id: 'att-7', name: 'ME-Gulf Scanner', ip: '185.191.171.18', x: 65, y: 45, type: 'attacker', country: 'Middle East' },
  { id: 'att-8', name: 'SE-Asia Ingress', ip: '114.119.130.4', x: 78, y: 55, type: 'attacker', country: 'SE Asia' },
];

const DEFENSE_TARGETS: NodeLocation[] = [
  { id: 'tgt-1', name: 'Primary DB Server', ip: '10.0.0.19', x: 26, y: 38, type: 'target' }, // US-East DC
  { id: 'tgt-2', name: 'Web App Gateway', ip: '192.168.1.105', x: 50, y: 33, type: 'target' }, // Frankfurt Gateway
  { id: 'tgt-3', name: 'Admin Bastion Portal', ip: '192.168.1.200', x: 27, y: 40, type: 'target' }, // US-East Bastion
];

interface LiveArc {
  id: string;
  source: NodeLocation;
  target: NodeLocation;
  attackType: string;
  progress: number; // 0 to 1
  blocked: boolean;
}

interface ThreatMapProps {
  soundEnabled: boolean;
  onBlockIp: (ip: string) => void;
  onQuarantineTarget: (ip: string) => void;
}

export const ThreatMap: React.FC<ThreatMapProps> = ({
  soundEnabled,
  onBlockIp,
  onQuarantineTarget
}) => {
  const [activeArcs, setActiveArcs] = useState<LiveArc[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeLocation | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [radarSpeed, setRadarSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [showRadar, setShowRadar] = useState(true);
  const [attackSpeedMultiplier, setAttackSpeedMultiplier] = useState<number>(1);
  const [filterCountry, setFilterCountry] = useState<string | null>(null);
  const [recentHits, setRecentHits] = useState<Array<{ id: string; time: string; text: string; blocked: boolean }>>([
    { id: 'h-1', time: '23:29:41', text: '185.220.101.44 (TOR) → 10.0.0.19:445 [Ransomware Probe] BLOCKED', blocked: true },
    { id: 'h-2', time: '23:29:38', text: '103.145.73.12 (AP) → 192.168.1.105:443 [SYN Flood 18Gbps] DROPPED', blocked: true },
    { id: 'h-3', time: '23:29:34', text: '45.154.255.89 (EU) → 192.168.1.200:22 [SSH Dictionary] RATE-LIMITED', blocked: true },
  ]);

  // Simulation loop for shooting cyber attack arcs across the globe
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Pick random attacker & target
      const validAttackers = filterCountry 
        ? ATTACK_ORIGINS.filter(a => a.country?.includes(filterCountry))
        : ATTACK_ORIGINS;
      
      const attacker = validAttackers[Math.floor(Math.random() * validAttackers.length)] || ATTACK_ORIGINS[0];
      const target = DEFENSE_TARGETS[Math.floor(Math.random() * DEFENSE_TARGETS.length)];
      const attackTypes = ['SYN Flood', 'Ransomware SMB', 'SSH Brute Force', 'DNS Tunnel', 'SQL Injection', 'RCE Exploit'];
      const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      const blocked = Math.random() > 0.05; // 95% blocked by SOC

      const newArc: LiveArc = {
        id: `arc-${Date.now()}-${Math.random()}`,
        source: attacker,
        target,
        attackType,
        progress: 0,
        blocked
      };

      setActiveArcs(prev => [...prev.slice(-12), newArc]);

      // Add to recent hits ticker
      const nowStr = new Date().toTimeString().split(' ')[0];
      setRecentHits(prev => [
        {
          id: `hit-${Date.now()}`,
          time: nowStr,
          text: `${attacker.ip} (${attacker.country?.split(' ')[0]}) → ${target.ip} [${attackType}] ${blocked ? 'BLOCKED' : 'ALERT'}`,
          blocked
        },
        ...prev.slice(0, 5)
      ]);

      if (soundEnabled && !blocked) {
        playCyberBeep('alert');
      }
    }, 1400 / attackSpeedMultiplier);

    return () => clearInterval(interval);
  }, [isSimulating, attackSpeedMultiplier, filterCountry, soundEnabled]);

  // Animate arc progress
  useEffect(() => {
    let animId: number;
    const updateArcs = () => {
      setActiveArcs(prev =>
        prev
          .map(arc => ({ ...arc, progress: arc.progress + 0.02 * attackSpeedMultiplier }))
          .filter(arc => arc.progress < 1.1)
      );
      animId = requestAnimationFrame(updateArcs);
    };
    animId = requestAnimationFrame(updateArcs);
    return () => cancelAnimationFrame(animId);
  }, [attackSpeedMultiplier]);

  const triggerCoordinatedWave = () => {
    const waveArcs: LiveArc[] = ATTACK_ORIGINS.map((att, idx) => ({
      id: `wave-${Date.now()}-${idx}`,
      source: att,
      target: DEFENSE_TARGETS[idx % DEFENSE_TARGETS.length],
      attackType: 'Coordinated Surge Exploit',
      progress: 0,
      blocked: true
    }));
    setActiveArcs(prev => [...prev, ...waveArcs]);
    if (soundEnabled) {
      playCyberBeep('alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            Geographic Threat Map
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-normal">
              GLOBAL ORIGIN TELEMETRY
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing live origin IP addresses mapping to internal infrastructure with ballistic arc tracking.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors border flex items-center gap-1.5 ${
              isSimulating
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'PAUSE ARCS' : 'RESUME ARCS'}</span>
          </button>

          <button
            onClick={triggerCoordinatedWave}
            className="px-3 py-1.5 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span>TRIGGER SURGE WAVE</span>
          </button>

          <div className="flex items-center bg-[#111927] border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-300 gap-1">
            <span className="text-[10px] text-slate-400">SPEED:</span>
            {[1, 2, 3].map(speed => (
              <button
                key={speed}
                onClick={() => setAttackSpeedMultiplier(speed)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  attackSpeedMultiplier === speed
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Card */}
      <div className="bg-[#101726] border border-slate-800 rounded-lg p-4 shadow-xl relative overflow-hidden">
        {/* Holographic HUD Top Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
              <Radar className="w-4 h-4 animate-spin text-cyan-400" />
              📡 UPLINK ACTIVE // RADAR TRACKING
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-medium">Tracking 42 active IP origins worldwide</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Threat Origins
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Internal Data Centers
            </span>
            <button
              onClick={() => setShowRadar(!showRadar)}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
            >
              {showRadar ? 'Radar Sweep: ON' : 'Radar Sweep: OFF'}
            </button>
          </div>
        </div>

        {/* Tactical Map Container */}
        <div className="relative w-full h-[460px] bg-[#070b14] rounded-lg mt-3 overflow-hidden border border-slate-800 flex items-center justify-center select-none">
          {/* Radar Sweep Effect */}
          {showRadar && (
            <div 
              className="absolute inset-0 pointer-events-none rounded-full origin-center"
              style={{
                width: '600px',
                height: '600px',
                left: 'calc(50% - 300px)',
                top: 'calc(50% - 300px)',
                background: 'conic-gradient(from 0deg, transparent 65%, rgba(6, 182, 212, 0.03) 85%, rgba(6, 182, 212, 0.28) 100%)',
                animation: 'radarSweep 5s linear infinite',
              }}
            />
          )}

          {/* Grid Rings Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
            <div className="w-[300px] h-[300px] rounded-full border border-cyan-400/50"></div>
            <div className="w-[480px] h-[480px] rounded-full border border-cyan-400/40 absolute"></div>
            <div className="w-full h-[1px] bg-cyan-400/30 absolute"></div>
            <div className="h-full w-[1px] bg-cyan-400/30 absolute"></div>
          </div>

          {/* SVG World Map & Vector Continents */}
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Glow filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Latitude/Longitude Grid Lines */}
            {[100, 200, 300, 400].map(y => (
              <line key={`lat-${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="#132035" strokeDasharray="3 4" strokeWidth="0.8" />
            ))}
            {[150, 300, 450, 600, 750, 900].map(x => (
              <line key={`lng-${x}`} x1={x} y1="0" x2={x} y2="500" stroke="#132035" strokeDasharray="3 4" strokeWidth="0.8" />
            ))}

            {/* Stylized World Continents Vector Polygons */}
            {/* North America */}
            <path
              d="M 120,60 L 250,55 L 290,100 L 260,170 L 210,210 L 190,260 L 160,240 L 110,180 L 80,120 Z"
              fill="#101c30"
              stroke="#1e3252"
              strokeWidth="1.2"
              className="hover:fill-[#15243d] transition-colors"
            />
            {/* South America */}
            <path
              d="M 240,270 L 330,280 L 350,340 L 310,430 L 270,450 L 250,370 L 230,300 Z"
              fill="#101c30"
              stroke="#1e3252"
              strokeWidth="1.2"
              className="hover:fill-[#15243d] transition-colors"
            />
            {/* Europe */}
            <path
              d="M 450,80 L 580,75 L 590,130 L 530,170 L 480,175 L 440,140 L 430,100 Z"
              fill="#101c30"
              stroke="#1e3252"
              strokeWidth="1.2"
              className="hover:fill-[#15243d] transition-colors"
            />
            {/* Africa */}
            <path
              d="M 450,185 L 560,180 L 600,240 L 570,360 L 510,410 L 470,330 L 430,240 Z"
              fill="#101c30"
              stroke="#1e3252"
              strokeWidth="1.2"
              className="hover:fill-[#15243d] transition-colors"
            />
            {/* Asia */}
            <path
              d="M 590,70 L 880,75 L 910,140 L 860,240 L 780,260 L 710,220 L 640,210 L 600,140 Z"
              fill="#101c30"
              stroke="#1e3252"
              strokeWidth="1.2"
              className="hover:fill-[#15243d] transition-colors"
            />
            {/* Australia / Oceania */}
            <path
              d="M 780,310 L 890,320 L 900,390 L 840,420 L 770,390 Z"
              fill="#101c30"
              stroke="#1e3252"
              strokeWidth="1.2"
              className="hover:fill-[#15243d] transition-colors"
            />

            {/* Ballistic Attack Arcs */}
            {activeArcs.map((arc) => {
              const x1 = arc.source.x * 10;
              const y1 = arc.source.y * 5;
              const x2 = arc.target.x * 10;
              const y2 = arc.target.y * 5;

              // Quadratic Bezier Control Point (curves upwards or downwards)
              const midX = (x1 + x2) / 2;
              const midY = Math.min(y1, y2) - 60; // arch overhead
              const pathD = `M ${x1},${y1} Q ${midX},${midY} ${x2},${y2}`;

              // Approximate position of moving laser photon along curve
              const t = Math.min(arc.progress, 1);
              const curX = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
              const curY = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;

              return (
                <g key={arc.id}>
                  {/* Subtle trajectory trail */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={arc.blocked ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.6)'}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  {/* Moving laser beam photon */}
                  <circle
                    cx={curX}
                    cy={curY}
                    r={arc.blocked ? 3 : 4}
                    fill={arc.blocked ? '#ef4444' : '#ff0055'}
                    filter="url(#glow)"
                  />
                  {/* Target shield impact flash when hit arrives */}
                  {arc.progress >= 0.95 && (
                    <circle
                      cx={x2}
                      cy={y2}
                      r="12"
                      fill="none"
                      stroke={arc.blocked ? '#06b6d4' : '#ef4444'}
                      strokeWidth="2"
                      className="animate-ping"
                      opacity="0.8"
                    />
                  )}
                </g>
              );
            })}

            {/* Attack Origins (Red Beacons) */}
            {ATTACK_ORIGINS.map((node) => {
              const cx = node.x * 10;
              const cy = node.y * 5;
              const isSelected = selectedNode?.id === node.id;
              return (
                <g
                  key={node.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode(node)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="rgba(239, 68, 68, 0.2)"
                    className="animate-ping"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? "5" : "3.5"}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  {/* Tooltip on hover */}
                  <text
                    x={cx}
                    y={cy - 10}
                    fill="#fca5a5"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    {node.ip}
                  </text>
                </g>
              );
            })}

            {/* Target Data Centers (Cyan Shields) */}
            {DEFENSE_TARGETS.map((node) => {
              const cx = node.x * 10;
              const cy = node.y * 5;
              const isSelected = selectedNode?.id === node.id;
              return (
                <g
                  key={node.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode(node)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="rgba(6, 182, 212, 0.15)"
                    stroke="#06b6d4"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? "6" : "4.5"}
                    fill="#06b6d4"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={cx}
                    y={cy + 16}
                    fill="#67e8f9"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {node.ip}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Selected Node Details Card Overlay */}
          {selectedNode && (
            <div className="absolute top-4 left-4 z-20 bg-[#0e1626]/95 border border-cyan-500/50 rounded-lg p-3 text-xs font-mono shadow-2xl backdrop-blur-md max-w-xs animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
                <span className={`font-bold ${selectedNode.type === 'attacker' ? 'text-red-400' : 'text-cyan-400'}`}>
                  {selectedNode.type === 'attacker' ? 'HOSTILE ORIGIN' : 'PROTECTED ASSET'}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1 text-slate-300">
                <div>Node: <strong className="text-white">{selectedNode.name}</strong></div>
                <div>IP Address: <strong className="text-cyan-300">{selectedNode.ip}</strong></div>
                {selectedNode.country && <div>Location: {selectedNode.country}</div>}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex gap-2">
                {selectedNode.type === 'attacker' ? (
                  <button
                    onClick={() => {
                      onBlockIp(selectedNode.ip);
                      setSelectedNode(null);
                    }}
                    className="w-full px-2 py-1 rounded bg-red-600/30 hover:bg-red-600/40 text-red-300 border border-red-500/40 text-[10px] font-bold"
                  >
                    BLACKLIST IP RANGE
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onQuarantineTarget(selectedNode.ip);
                      setSelectedNode(null);
                    }}
                    className="w-full px-2 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold"
                  >
                    QUARANTINE SUBNET
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Live In-flight Stats Overlay */}
          <div className="absolute bottom-3 right-3 bg-[#0a0e17]/90 border border-slate-800 rounded px-3 py-1.5 text-[10px] font-mono text-slate-400 backdrop-blur-sm pointer-events-none">
            <span className="text-cyan-400">IN-FLIGHT ARCS: {activeArcs.length}</span> · <span className="text-emerald-400">DEFENSE MITIGATION: 99.4%</span>
          </div>
        </div>

        {/* Live Attack Ticker Bar */}
        <div className="mt-3 p-2 bg-[#090e1a] border border-slate-800/80 rounded font-mono text-xs flex items-center gap-3 overflow-hidden">
          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold shrink-0">
            RADAR TICKER
          </span>
          <div className="flex-1 overflow-x-auto whitespace-nowrap text-slate-300 text-[11px] space-x-6">
            {recentHits.map(hit => (
              <span key={hit.id} className="inline-block">
                <span className="text-slate-500">[{hit.time}]</span>{' '}
                <span className={hit.blocked ? 'text-slate-300' : 'text-red-400 font-bold'}>{hit.text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Grid 2 from HTML: Top Source Countries & Targeted Internal Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-slate-800/80">
          {/* Panel 1: Top Source Countries */}
          <div className="bg-[#0b101d] p-4 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                Top Source Countries (24h)
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">1,402 TOTAL INGRESS</span>
            </div>

            <div className="space-y-3">
              {TOP_SOURCE_COUNTRIES.map((country, idx) => (
                <div 
                  key={idx}
                  onClick={() => setFilterCountry(filterCountry === country.name ? null : country.name)}
                  className={`p-2 rounded cursor-pointer transition-all ${
                    filterCountry === country.name 
                      ? 'bg-cyan-500/10 border border-cyan-500/40' 
                      : 'hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="text-red-400">🔴</span> {country.name}
                    </span>
                    <span className="text-cyan-400 font-bold">
                      {country.pct}% ({country.attacks})
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${country.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {filterCountry && (
              <button
                onClick={() => setFilterCountry(null)}
                className="mt-2 text-[10px] text-cyan-400 hover:underline font-mono"
              >
                Clear country filter (Showing all)
              </button>
            )}
          </div>

          {/* Panel 2: Targeted Internal Nodes */}
          <div className="bg-[#0b101d] p-4 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                Targeted Internal Nodes
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">5 ACTIVE ENDPOINTS</span>
            </div>

            <div className="space-y-3">
              {TARGETED_INTERNAL_NODES.map((node, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#090e1a] border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">🎯 {node.ip}</span>
                      <span className="text-xs text-slate-300">({node.role})</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {node.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                    <span>Assault Volume: <strong className="text-red-400">{node.attacks} hits</strong></span>
                    <div className="flex items-center gap-2">
                      <span>Health:</span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${node.health > 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${node.health}%` }}
                        />
                      </div>
                      <span className="text-slate-300">{node.health}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

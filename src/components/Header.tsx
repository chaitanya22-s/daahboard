import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Radio, 
  Search, 
  Lock, 
  Play, 
  Pause,
  Clock,
  Sparkles
} from 'lucide-react';
import { DefconLevel } from '../types/soc';

interface HeaderProps {
  defcon: DefconLevel;
  setDefcon: (level: DefconLevel) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenLockdown: () => void;
  activeIncidentsCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  defcon,
  setDefcon,
  isStreaming,
  setIsStreaming,
  soundEnabled,
  setSoundEnabled,
  onOpenLockdown,
  activeIncidentsCount,
  searchQuery,
  setSearchQuery,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const defconColors = {
    1: 'bg-red-500/10 text-red-400 border-red-500/40',
    2: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
    3: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40',
    4: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
  };

  const defconLabels = {
    1: 'DEFCON 1 · MAXIMUM READINESS',
    2: 'DEFCON 2 · SEVERE THREAT',
    3: 'DEFCON 3 · ELEVATED VIGILANCE',
    4: 'DEFCON 4 · NORMAL MONITORING',
  };

  return (
    <header className="h-16 bg-[#0c1220] border-b border-slate-800 px-5 flex items-center justify-between z-20 shrink-0">
      {/* Brand & Defcon */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
              Cyber Operations Center
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SEC-CLUSTER // US-EAST-01
            </div>
          </div>
        </div>

        {/* DEFCON Selector */}
        <div className="hidden lg:flex items-center">
          <div className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold border flex items-center gap-2 ${defconColors[defcon]}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping opacity-75"></span>
            <span>{defconLabels[defcon]}</span>
            <select
              value={defcon}
              onChange={(e) => setDefcon(Number(e.target.value) as DefconLevel)}
              className="bg-transparent text-slate-300 border-none outline-none cursor-pointer text-[10px] ml-1 font-mono hover:text-white"
              title="Change DEFCON operational readiness"
            >
              <option value={1} className="bg-slate-900 text-red-400">DEFCON 1 (Critical)</option>
              <option value={2} className="bg-slate-900 text-amber-400">DEFCON 2 (Severe)</option>
              <option value={3} className="bg-slate-900 text-cyan-400">DEFCON 3 (Guarded)</option>
              <option value={4} className="bg-slate-900 text-emerald-400">DEFCON 4 (Normal)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IPs, CVEs, attack vectors, or asset IDs..."
            className="w-full bg-[#111927] border border-slate-700/80 rounded-md py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 font-mono transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* UTC Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr || 'SYNCING UTC...'}</span>
        </div>

        {/* Live Ingest Stream Toggle */}
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
            isStreaming
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title={isStreaming ? 'Pause live threat ingestion' : 'Resume live threat ingestion'}
        >
          {isStreaming ? (
            <>
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span className="hidden sm:inline">LIVE INGEST</span>
              <Pause className="w-3 h-3 ml-0.5 opacity-70" />
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">PAUSED</span>
            </>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 rounded border transition-colors ${
            soundEnabled
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/25'
              : 'bg-slate-800/80 border-slate-700 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Audio alerts active (click to mute)' : 'Audio alerts muted (click to enable)'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Emergency Lockdown */}
        <button
          onClick={onOpenLockdown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-semibold font-mono tracking-wide transition-all shadow-sm"
          title="Engage emergency boundary isolation"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden md:inline">EMERGENCY LOCKDOWN</span>
          <span className="md:hidden">LOCK</span>
        </button>
      </div>
    </header>
  );
};

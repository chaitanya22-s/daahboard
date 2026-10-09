import React from 'react';
import { 
  LayoutDashboard, 
  Globe2, 
  Terminal, 
  BarChart3, 
  Server,
  Shield,
  Activity,
  Cpu
} from 'lucide-react';
import { PageId } from '../types/soc';

interface SidebarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  activeIncidentsCount: number;
  totalLogsCount: number;
  systemHealthScore: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  activeIncidentsCount,
  totalLogsCount,
  systemHealthScore
}) => {
  const navItems: { id: PageId; number: string; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'overview',
      number: '1.',
      label: 'Global Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: activeIncidentsCount,
      badgeColor: activeIncidentsCount > 5 ? 'text-red-400 bg-red-500/15 border-red-500/30' : 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    },
    {
      id: 'threat-map',
      number: '2.',
      label: 'Live Threat Map',
      icon: <Globe2 className="w-4 h-4" />,
      badge: 'LIVE',
      badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30 animate-pulse'
    },
    {
      id: 'raw-logs',
      number: '3.',
      label: 'Raw Logs & Data',
      icon: <Terminal className="w-4 h-4" />,
      badge: `${totalLogsCount}`,
      badgeColor: 'text-slate-400 bg-slate-800 border-slate-700'
    },
    {
      id: 'analytics',
      number: '4.',
      label: 'Analytics & Reports',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'system-health',
      number: '5.',
      label: 'System Health',
      icon: <Server className="w-4 h-4" />,
      badge: `${systemHealthScore}%`,
      badgeColor: systemHealthScore > 80 ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' : 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    }
  ];

  return (
    <aside className="w-64 bg-[#0c1220] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Sidebar Title */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <span className="font-bold text-sm tracking-wide text-cyan-400 uppercase font-mono">
              SOC Dashboard
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            v3.4.1
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-400 shadow-[inset_0_1px_0_0_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">{item.number}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor || 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator Session Info / Hardware Health */}
      <div className="p-3 m-3 rounded-lg bg-[#080d17] border border-slate-800 text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            OPERATOR STATS
          </span>
          <span className="text-emerald-400 font-mono text-[10px]">AUTH LEVEL 4</span>
        </div>
        <div className="space-y-1 font-mono text-slate-400 text-[10px]">
          <div className="flex justify-between">
            <span>SOC Node:</span>
            <span className="text-slate-300">alpha-soc-gateway</span>
          </div>
          <div className="flex justify-between">
            <span>Ingest Queue:</span>
            <span className="text-cyan-400">48,200 msg/s</span>
          </div>
          <div className="flex justify-between">
            <span>Threat Ratio:</span>
            <span className="text-amber-400">1.84% Malicious</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>Encrypted Session</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            ACTIVE
          </span>
        </div>
      </div>
    </aside>
  );
};

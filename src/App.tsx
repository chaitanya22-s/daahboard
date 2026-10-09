/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GlobalOverview } from './components/pages/GlobalOverview';
import { ThreatMap } from './components/pages/ThreatMap';
import { RawLogs } from './components/pages/RawLogs';
import { AnalyticsReports } from './components/pages/AnalyticsReports';
import { SystemHealth } from './components/pages/SystemHealth';
import { IncidentModal } from './components/IncidentModal';
import { EmergencyLockdownModal } from './components/EmergencyLockdownModal';
import { INITIAL_ALERTS, INITIAL_LOGS } from './data/mockData';
import { PageId, ThreatAlert, SiemLog, DefconLevel } from './types/soc';
import { playCyberBeep } from './utils/audio';
import { ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [alerts, setAlerts] = useState<ThreatAlert[]>(INITIAL_ALERTS);
  const [logs, setLogs] = useState<SiemLog[]>(INITIAL_LOGS);
  const [defcon, setDefcon] = useState<DefconLevel>(2);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [blockedCount, setBlockedCount] = useState<number>(1402);
  const [blockedIps, setBlockedIps] = useState<string[]>(['185.220.101.44', '103.145.73.12']);

  // Modal states
  const [selectedAlert, setSelectedAlert] = useState<ThreatAlert | null>(null);
  const [isLockdownOpen, setIsLockdownOpen] = useState<boolean>(false);
  const [isLockedDown, setIsLockedDown] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  const handleMitigateAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Mitigated' } : a));
    if (soundEnabled) playCyberBeep('mitigate');
    showToast(`Incident ${alertId} resolved & mitigated. Telemetry archived.`);
  };

  const handleBlockIp = (ip: string) => {
    if (!blockedIps.includes(ip)) {
      setBlockedIps(prev => [...prev, ip]);
      setBlockedCount(prev => prev + 1);
      if (soundEnabled) playCyberBeep('block');
      showToast(`Blacklist Rule: Origin ${ip} null-routed across all perimeter firewalls.`);
    } else {
      showToast(`Origin ${ip} is already in the perimeter blacklist.`);
    }
  };

  const handleIsolateHost = (targetIp: string) => {
    if (soundEnabled) playCyberBeep('alert');
    showToast(`Perimeter VLAN Isolation: Host ${targetIp} partitioned from active subnet.`);
  };

  const handleConfirmLockdown = () => {
    setIsLockedDown(true);
    setDefcon(1);
    if (soundEnabled) playCyberBeep('alert');
    showToast('EMERGENCY LOCKDOWN ENGAGED: Inbound BGP links severed. DEFCON 1.');
  };

  const handleLiftLockdown = () => {
    setIsLockedDown(false);
    setDefcon(2);
    if (soundEnabled) playCyberBeep('mitigate');
    showToast('LOCKDOWN LIFTED: Perimeter links restored. Returning to DEFCON 2.');
  };

  const handleAddLog = (newLog: SiemLog) => {
    setLogs(prev => [newLog, ...prev.slice(0, 199)]);
    setBlockedCount(prev => prev + 1);
  };

  const activeIncidentsCount = alerts.filter(a => a.status !== 'Mitigated').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070b14] text-[#e2e8f0]">
      {/* Lockdown Status Banner (If Engaged) */}
      {isLockedDown && (
        <div className="bg-red-600 text-white px-4 py-1.5 text-xs font-mono font-bold tracking-widest flex items-center justify-between shrink-0 shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" />
            <span>CRITICAL: EMERGENCY BOUNDARY LOCKDOWN IN EFFECT · ALL EXTERNAL PORTS SHUT</span>
          </div>
          <button
            onClick={() => setIsLockdownOpen(true)}
            className="px-2 py-0.5 rounded bg-black/40 hover:bg-black/60 text-white text-[10px] underline"
          >
            MANAGE LOCKDOWN
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        defcon={defcon}
        setDefcon={setDefcon}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        soundEnabled={soundEnabled}
        setSoundEnabled={(enabled) => {
          setSoundEnabled(enabled);
          if (enabled) playCyberBeep('click');
        }}
        onOpenLockdown={() => setIsLockdownOpen(true)}
        activeIncidentsCount={activeIncidentsCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Body: Sidebar + Main Content Viewport */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          activeIncidentsCount={activeIncidentsCount}
          totalLogsCount={logs.length}
          systemHealthScore={isLockedDown ? 52 : 94}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 bg-[#070b14]">
          {currentPage === 'overview' && (
            <GlobalOverview
              alerts={alerts}
              onSelectAlert={(a) => setSelectedAlert(a)}
              onMitigateAlert={handleMitigateAlert}
              onBlockIp={handleBlockIp}
              onNavigateToPage={setCurrentPage}
              blockedCount={blockedCount}
            />
          )}

          {currentPage === 'threat-map' && (
            <ThreatMap
              soundEnabled={soundEnabled}
              onBlockIp={handleBlockIp}
              onQuarantineTarget={handleIsolateHost}
            />
          )}

          {currentPage === 'raw-logs' && (
            <RawLogs
              logs={logs}
              onAddLog={handleAddLog}
              onBlockIp={handleBlockIp}
              isStreaming={isStreaming}
              setIsStreaming={setIsStreaming}
              soundEnabled={soundEnabled}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsReports />
          )}

          {currentPage === 'system-health' && (
            <SystemHealth soundEnabled={soundEnabled} />
          )}
        </main>
      </div>

      {/* Incident Investigation Modal */}
      {selectedAlert && (
        <IncidentModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onMitigate={handleMitigateAlert}
          onBlockIp={handleBlockIp}
          onIsolateHost={handleIsolateHost}
        />
      )}

      {/* Emergency Lockdown Confirmation Modal */}
      <EmergencyLockdownModal
        isOpen={isLockdownOpen}
        onClose={() => setIsLockdownOpen(false)}
        onConfirmLockdown={handleConfirmLockdown}
        isLockedDown={isLockedDown}
        onLiftLockdown={handleLiftLockdown}
      />

      {/* Floating Tactical Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0e1626] border border-cyan-500/60 rounded-lg px-4 py-2.5 shadow-2xl text-xs font-mono text-cyan-300 flex items-center gap-2.5 backdrop-blur-md animate-fadeIn">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-500 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

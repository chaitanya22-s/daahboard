import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, Check, Lock, Unlock } from 'lucide-react';

interface EmergencyLockdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLockdown: () => void;
  isLockedDown: boolean;
  onLiftLockdown: () => void;
}

export const EmergencyLockdownModal: React.FC<EmergencyLockdownModalProps> = ({
  isOpen,
  onClose,
  onConfirmLockdown,
  isLockedDown,
  onLiftLockdown
}) => {
  const [confirmInput, setConfirmInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121624] border border-red-500/50 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden p-6 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-red-400 uppercase">
            {isLockedDown ? 'EMERGENCY LOCKDOWN IN EFFECT' : 'INITIATE EMERGENCY LOCKDOWN'}
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {isLockedDown
              ? 'All perimeter BGP routes are currently severed. Inbound internet traffic is blocked. Only secure out-of-band management planes remain accessible.'
              : 'This action will instantly sever all external BGP peering links, drop non-whitelisted perimeter ingress/egress, set DEFCON 1, and quarantine critical database clusters.'}
          </p>
        </div>

        {!isLockedDown ? (
          <div className="space-y-3 pt-2 text-left bg-black/40 p-3.5 rounded-lg border border-red-900/40 font-mono text-xs">
            <label className="block text-slate-400 text-[11px]">
              Type <strong className="text-red-400 font-bold">LOCKDOWN</strong> to confirm authorization:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
              placeholder="LOCKDOWN"
              className="w-full bg-[#0a0e17] border border-red-500/40 rounded px-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
            />
          </div>
        ) : (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300 font-mono">
            LOCKDOWN PROTOCOL ACTIVE // 0 PACKETS PERMITTED FROM UNTRUSTED RANGES
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          {!isLockedDown ? (
            <button
              onClick={() => {
                if (confirmInput === 'LOCKDOWN') {
                  onConfirmLockdown();
                  setConfirmInput('');
                  onClose();
                }
              }}
              disabled={confirmInput !== 'LOCKDOWN'}
              className={`px-5 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 ${
                confirmInput === 'LOCKDOWN'
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg cursor-pointer'
                  : 'bg-red-950/40 text-red-500/40 border border-red-900/30 cursor-not-allowed'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              CONFIRM LOCKDOWN
            </button>
          ) : (
            <button
              onClick={() => {
                onLiftLockdown();
                onClose();
              }}
              className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shadow-lg"
            >
              <Unlock className="w-3.5 h-3.5" />
              LIFT LOCKDOWN & RESTORE BGP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

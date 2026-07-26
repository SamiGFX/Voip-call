import React, { useState } from 'react';
import { PhoneCall, ShieldCheck, Zap, DollarSign, UserCheck, Building2, Shield, Plus, Globe, SignalHigh } from 'lucide-react';
import { AccountType, NetworkTelemetry } from '../types';

interface HeaderProps {
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
  telemetry: NetworkTelemetry;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  activeCallCount: number;
  onOpenDialer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  accountType,
  setAccountType,
  telemetry,
  balance,
  setBalance,
  activeCallCount,
  onOpenDialer,
}) => {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('20');
  const [autoRecharge, setAutoRecharge] = useState(true);

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(topUpAmount);
    if (!isNaN(val) && val > 0) {
      setBalance((prev) => prev + val);
      setShowTopUpModal(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & App Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
                GlobeCall
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full">
                VoIP HD
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Worldwide Carrier-Grade Telephony & AI
            </p>
          </div>
        </div>

        {/* Network & Codec Telemetry Badge */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <SignalHigh className="w-4 h-4 animate-pulse" />
            <span className="font-medium">{telemetry.codec}</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-slate-300">
            MOS: <span className="font-semibold text-white">{telemetry.mosScore}</span>/5.0
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-slate-300">
            Ping: <span className="font-semibold text-emerald-400">{telemetry.pingMs}ms</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-slate-400 text-[11px] flex items-center gap-1">
            <Globe className="w-3 h-3 text-blue-400" />
            {telemetry.regionServer}
          </div>
        </div>

        {/* Account Mode Switcher, Balance, and Actions */}
        <div className="flex items-center gap-3">
          {/* Account Mode Selector */}
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setAccountType('consumer')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                accountType === 'consumer'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Personal</span>
            </button>

            <button
              onClick={() => setAccountType('smb')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                accountType === 'smb'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>SMB Team</span>
            </button>

            <button
              onClick={() => setAccountType('enterprise')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                accountType === 'enterprise'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Enterprise</span>
            </button>
          </div>

          {/* Credit Balance Badge & Top Up */}
          <button
            onClick={() => setShowTopUpModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all group"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>${balance.toFixed(2)}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">
              Credits
            </span>
          </button>

          {/* Quick Call Button */}
          <button
            onClick={onOpenDialer}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Call</span>
          </button>
        </div>
      </div>

      {/* Top Up Credits Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Add Call Credits</h3>
                  <p className="text-xs text-slate-400">Instant PSTN International Balance</p>
                </div>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTopUp} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Select Amount (USD)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['10', '20', '50', '100'].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-2 text-sm font-semibold rounded-lg border transition-all ${
                        topUpAmount === amt
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="Custom amount"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Auto-Recharge when low</p>
                    <p className="text-[11px] text-slate-400">Adds $10 when balance falls below $2</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoRecharge}
                  onChange={(e) => setAutoRecharge(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Confirm & Add ${topUpAmount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

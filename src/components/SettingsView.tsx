import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Mic,
  Video,
  Volume2,
  Lock,
  Globe,
  Bell,
  Smartphone,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [spamShieldLevel, setSpamShieldLevel] = useState<'aggressive' | 'standard' | 'off'>('standard');
  const [gdprAutoAnnounce, setGdprAutoAnnounce] = useState(true);
  const [callerIdMasking, setCallerIdMasking] = useState(true);
  const [audioQualityMode, setAudioQualityMode] = useState<'opus' | 'balanced' | 'saver'>('opus');
  const [testMicActive, setTestMicActive] = useState(false);
  const [testMicVolume, setTestMicVolume] = useState(65);

  const toggleMicTest = () => {
    setTestMicActive(!testMicActive);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          Settings, Hardware & Compliance Policies
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure security, spam shielding, audio codecs, and global recording consent disclaimers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware & Audio Codec Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Mic className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-sm text-white">Audio & Camera Hardware Diagnostic</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Microphone Input Device</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                <option>Default High-Definition Microphone Array</option>
                <option>Bluetooth Headset (A2DP / Handsfree)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Audio Bandwidth & Codec Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'opus', name: 'Opus HD', desc: 'Ultra 48kHz' },
                  { id: 'balanced', name: 'Balanced', desc: 'Auto Adaptive' },
                  { id: 'saver', name: 'Data Saver', desc: 'Low Latency' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setAudioQualityMode(mode.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      audioQualityMode === mode.id
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{mode.name}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Mic Meter */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Live Microphone Level Test</span>
                <button
                  onClick={toggleMicTest}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    testMicActive ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {testMicActive ? 'Stop Test' : 'Start Mic Test'}
                </button>
              </div>

              {testMicActive && (
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 h-full transition-all duration-300"
                      style={{ width: `${testMicVolume}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-emerald-400">{testMicVolume}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spam Protection & Legal Consent Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">Spam Shield & Compliance Policies</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Robocall & Spam Call Shielding Sensitivity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'aggressive', label: 'Aggressive', note: 'Block suspicious' },
                  { id: 'standard', label: 'Standard AI', note: 'Recommended' },
                  { id: 'off', label: 'Disabled', note: 'Allow all calls' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpamShieldLevel(s.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      spamShieldLevel === s.id
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{s.label}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{s.note}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* GDPR Recording Disclosure Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="pr-4">
                <p className="text-xs font-bold text-slate-200">Enforce Automated Dual-Consent Prompt</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Announces recording status before call bridge to ensure compliance with GDPR (EU) and FCC (US) regulations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={gdprAutoAnnounce}
                onChange={(e) => setGdprAutoAnnounce(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500 shrink-0"
              />
            </div>

            {/* Caller ID Privacy Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="pr-4">
                <p className="text-xs font-bold text-slate-200">Default Caller ID Privacy Masking</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mask personal mobile phone numbers during outbound PSTN calls using GlobeCall Virtual Direct Numbers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={callerIdMasking}
                onChange={(e) => setCallerIdMasking(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500 shrink-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

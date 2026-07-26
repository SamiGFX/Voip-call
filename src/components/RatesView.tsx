import React, { useState } from 'react';
import {
  Globe,
  Search,
  Calculator,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Zap,
  Star,
} from 'lucide-react';
import { RateItem } from '../types';
import { GLOBAL_RATES } from '../data/rates';

interface RatesViewProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

export const RatesView: React.FC<RatesViewProps> = ({ balance, setBalance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [calcCountry, setCalcCountry] = useState<RateItem>(GLOBAL_RATES[0]);
  const [calcMinutes, setCalcMinutes] = useState('15');
  const [calcType, setCalcType] = useState<'mobile' | 'landline'>('mobile');

  const filteredRates = GLOBAL_RATES.filter(
    (r) =>
      r.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.includes(searchTerm) ||
      r.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculatedCost = (
    parseFloat(calcMinutes || '0') *
    (calcType === 'mobile' ? calcCountry.mobileRate : calcCountry.landlineRate)
  ).toFixed(3);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-400" />
          Global VoIP Rates & Cost Estimator
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Transparent wholesale PSTN rate tables across 200+ countries with Tier-1 direct carrier routes
        </p>
      </div>

      {/* Interactive Call Cost Calculator & Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Estimator */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-sm text-white">Call Cost Estimator</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Destination Country</label>
                <select
                  value={calcCountry.iso}
                  onChange={(e) => {
                    const match = GLOBAL_RATES.find((r) => r.iso === e.target.value);
                    if (match) setCalcCountry(match);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {GLOBAL_RATES.map((r) => (
                    <option key={r.iso} value={r.iso}>
                      {r.flag} {r.country} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={calcMinutes}
                    onChange={(e) => setCalcMinutes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Line Type</label>
                  <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setCalcType('mobile')}
                      className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                        calcType === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcType('landline')}
                      className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                        calcType === 'landline' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Landline
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 text-center">
                <p className="text-xs text-slate-400">Estimated Total Cost</p>
                <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">${calculatedCost} USD</p>
                <p className="text-[10px] text-slate-500 mt-1">Rate: ${calcType === 'mobile' ? calcCountry.mobileRate : calcCountry.landlineRate}/min • {calcCountry.carrier}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Plan 1: Personal Unlimited */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Personal</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-bold">Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-white">$9.99 <span className="text-xs text-slate-400 font-normal">/ month</span></h3>
              <p className="text-xs text-slate-400 mt-1">Ideal for individuals calling family and friends worldwide</p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited app-to-app HD Voice & Video</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 500 PSTN mins to US, UK, Canada & EU</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Caller ID Privacy Masking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Cross-device handoff (Web/Mobile/Desktop)</li>
              </ul>
            </div>

            <button
              onClick={() => alert('Personal Plan activated!')}
              className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20"
            >
              Subscribe for $9.99/mo
            </button>
          </div>

          {/* Plan 2: Business Team */}
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
              Enterprise
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Business Pro</span>
              <h3 className="text-2xl font-bold text-white mt-1">$19.00 <span className="text-xs text-slate-400 font-normal">/ seat / month</span></h3>
              <p className="text-xs text-slate-400 mt-1">Full team VoIP governance, IVR, recording & AI summaries</p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> All Personal features + Unlimited seats</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Interactive IVR Auto-Attendant</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Gemini AI Call Transcripts & Summaries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> GDPR Call Recording & Compliance Audit</li>
              </ul>
            </div>

            <button
              onClick={() => alert('Business Seat Plan activated!')}
              className="mt-6 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20"
            >
              Activate Business Plan
            </button>
          </div>
        </div>
      </div>

      {/* Global Rates Search Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-base text-white">Full International Direct Dialing Table</h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search country or country code..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Country</th>
                <th className="p-3">Dial Code</th>
                <th className="p-3">Landline / min</th>
                <th className="p-3">Mobile / min</th>
                <th className="p-3">Carrier Direct Route</th>
                <th className="p-3">Quality Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRates.map((r) => (
                <tr key={r.iso} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 flex items-center gap-2 font-bold text-white">
                    <span className="text-base">{r.flag}</span>
                    <span>{r.country}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{r.code}</td>
                  <td className="p-3 font-mono text-emerald-400">${r.landlineRate.toFixed(3)}</td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">${r.mobileRate.toFixed(3)}</td>
                  <td className="p-3 text-slate-400">{r.carrier}</td>
                  <td className="p-3">
                    <span className="text-emerald-400 font-bold font-mono">{r.qualityScore}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Phone,
  Video,
  Users,
  Delete,
  Shield,
  Globe,
  DollarSign,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Contact, CallType, RateItem } from '../types';
import { GLOBAL_RATES } from '../data/rates';
import { audioSynthesizer } from '../utils/audioSynthesizer';

interface DialerProps {
  onStartCall: (targetNumber: string, targetName: string, callType: CallType, ratePerMin: number) => void;
  contacts: Contact[];
}

export const Dialer: React.FC<DialerProps> = ({ onStartCall, contacts }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<RateItem>(GLOBAL_RATES[0]);
  const [maskCallerId, setMaskCallerId] = useState(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const keys = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
    { num: '*', sub: '' },
    { num: '0', sub: '+' },
    { num: '#', sub: '' },
  ];

  const handleKeyPress = (num: string) => {
    audioSynthesizer.playDtmf(num);
    setPhoneNumber((prev) => prev + num);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const filteredRates = GLOBAL_RATES.filter(
    (r) =>
      r.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
      r.code.includes(countrySearch)
  );

  const matchedContact = contacts.find(
    (c) => c.number.replace(/\D/g, '') === phoneNumber.replace(/\D/g, '') && phoneNumber.length > 3
  );

  const handleInitiateCall = (type: CallType) => {
    const numToCall = phoneNumber || selectedCountry.code + ' 555-0199';
    const nameToCall = matchedContact ? matchedContact.name : `Dest (${selectedCountry.country})`;
    onStartCall(numToCall, nameToCall, type, selectedCountry.mobileRate);
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white relative">
        {/* Top Header & Caller ID Masking */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
              >
                <span className="text-base">{selectedCountry.flag}</span>
                <span>{selectedCountry.code}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Country Picker Dropdown */}
              {showCountryPicker && (
                <div className="absolute left-0 top-10 z-50 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 max-h-64 overflow-y-auto">
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-2"
                  />
                  <div className="space-y-1">
                    {filteredRates.map((rate) => (
                      <button
                        key={rate.country}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(rate);
                          setShowCountryPicker(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-700 text-left text-xs text-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>{rate.flag}</span>
                          <span className="font-medium">{rate.country}</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          ${rate.mobileRate}/m
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>
                Rate: <strong className="text-emerald-300">${selectedCountry.mobileRate}/min</strong>
              </span>
            </div>
          </div>

          {/* Caller ID Privacy Masking */}
          <button
            type="button"
            onClick={() => setMaskCallerId(!maskCallerId)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
              maskCallerId
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Shield className="w-3 h-3 text-indigo-400" />
            <span>{maskCallerId ? 'Caller ID Masked' : 'Show My Number'}</span>
          </button>
        </div>

        {/* Display Screen */}
        <div className="my-6 text-center">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number..."
            className="w-full bg-transparent text-3xl font-mono font-bold tracking-wider text-center text-white focus:outline-none placeholder:text-slate-600 placeholder:font-sans placeholder:text-xl"
          />

          {matchedContact ? (
            <p className="mt-2 text-xs text-blue-400 font-medium flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Calling: {matchedContact.name} ({matchedContact.company})
            </p>
          ) : phoneNumber ? (
            <p className="mt-2 text-xs text-slate-400">
              Destination: {selectedCountry.country} ({selectedCountry.code})
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Use touch dialpad below or speed dial contacts
            </p>
          )}
        </div>

        {/* Dialpad Buttons */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
          {keys.map((k) => (
            <button
              key={k.num}
              type="button"
              onClick={() => handleKeyPress(k.num)}
              className="w-16 h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 active:scale-95 border border-slate-700/60 flex flex-col items-center justify-center transition-all mx-auto shadow-md"
            >
              <span className="text-xl font-bold text-slate-100">{k.num}</span>
              {k.sub && <span className="text-[9px] font-bold text-slate-400 tracking-widest">{k.sub}</span>}
            </button>
          ))}
        </div>

        {/* Call Action Triggers */}
        <div className="flex items-center justify-center gap-4">
          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            disabled={!phoneNumber}
            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center transition-colors"
          >
            <Delete className="w-5 h-5" />
          </button>

          {/* Voice HD Call */}
          <button
            type="button"
            onClick={() => handleInitiateCall('voice')}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all hover:scale-110 active:scale-95"
            title="Start HD Audio Call"
          >
            <Phone className="w-7 h-7" />
          </button>

          {/* Video 1080p Call */}
          <button
            type="button"
            onClick={() => handleInitiateCall('video')}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            title="Start 1080p Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Dial Quick Picks */}
        <div className="mt-8 pt-4 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Speed Dial & Favorites</span>
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {contacts.slice(0, 4).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setPhoneNumber(c.number);
                  onStartCall(c.number, c.name, 'voice', 0.015);
                }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl px-3 py-2 text-left shrink-0 transition-colors"
              >
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600"
                />
                <div>
                  <p className="text-xs font-semibold text-white leading-tight">{c.name}</p>
                  <p className="text-[10px] text-slate-400">{c.flag} {c.country}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

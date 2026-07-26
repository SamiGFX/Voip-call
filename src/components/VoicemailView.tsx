import React, { useState } from 'react';
import {
  Voicemail as VoicemailIcon,
  Play,
  Pause,
  PhoneCall,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  Bot,
  Volume2,
} from 'lucide-react';
import { Voicemail, CallType } from '../types';

interface VoicemailViewProps {
  voicemails: Voicemail[];
  onStartCall: (targetNumber: string, targetName: string, callType: CallType, ratePerMin: number) => void;
  onDeleteVoicemail: (id: string) => void;
}

export const VoicemailView: React.FC<VoicemailViewProps> = ({
  voicemails,
  onStartCall,
  onDeleteVoicemail,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const togglePlayback = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-white">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <VoicemailIcon className="w-6 h-6 text-blue-400" />
          Voicemail Inbox & AI Transcripts
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Automated speech-to-text audio transcription with sentiment & action extraction
        </p>
      </div>

      {/* Voicemails List */}
      <div className="space-y-4">
        {voicemails.map((vm) => (
          <div
            key={vm.id}
            className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-md ${
              !vm.isRead ? 'border-blue-500/50 bg-slate-900/90' : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={vm.avatar}
                  alt={vm.senderName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{vm.senderName}</h3>
                    {!vm.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" title="New Voicemail" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{vm.senderNumber} • {vm.timestamp}</p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePlayback(vm.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
                    playingId === vm.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {playingId === vm.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  <span>{playingId === vm.id ? 'Pause Audio' : `Play (${vm.durationSeconds}s)`}</span>
                </button>

                <button
                  onClick={() => onStartCall(vm.senderNumber, vm.senderName, 'voice', 0.015)}
                  className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl transition-colors"
                  title="Call Back"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteVoicemail(vm.id)}
                  className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 rounded-xl transition-colors"
                  title="Delete Voicemail"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audio Wave Bar Simulation */}
            {playingId === vm.id && (
              <div className="my-3 bg-slate-950 p-3 rounded-xl border border-blue-500/30 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-400 animate-bounce" />
                <div className="flex-1 flex items-center gap-1 h-6">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-blue-500/60 rounded-full animate-pulse"
                      style={{
                        height: `${Math.max(20, Math.sin(i * 0.5) * 100)}%`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* AI Transcript Box */}
            <div className="mt-4 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                  AI Automated Audio Transcript
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Accuracy 99.4%
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                "{vm.transcript}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

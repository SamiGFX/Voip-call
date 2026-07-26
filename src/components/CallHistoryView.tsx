import React, { useState } from 'react';
import {
  History,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  FileText,
  Download,
  Search,
  Sparkles,
  ShieldCheck,
  Disc,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { CallLog, CallType } from '../types';

interface CallHistoryViewProps {
  logs: CallLog[];
  onStartCall: (targetNumber: string, targetName: string, callType: CallType, ratePerMin: number) => void;
}

export const CallHistoryView: React.FC<CallHistoryViewProps> = ({ logs, onStartCall }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'missed' | 'recorded'>('all');
  const [selectedTranscriptLog, setSelectedTranscriptLog] = useState<CallLog | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.number.includes(searchTerm);
    if (!matchesSearch) return false;
    if (filterMode === 'missed') return log.direction === 'missed';
    if (filterMode === 'recorded') return log.hasRecording;
    return true;
  });

  const getDirectionIcon = (direction: CallLog['direction']) => {
    switch (direction) {
      case 'inbound':
        return <PhoneIncoming className="w-4 h-4 text-emerald-400" />;
      case 'outbound':
        return <PhoneOutgoing className="w-4 h-4 text-blue-400" />;
      case 'missed':
        return <PhoneMissed className="w-4 h-4 text-red-400" />;
    }
  };

  const handleExportCsv = () => {
    const headers = 'ID,Contact,Number,Direction,Timestamp,DurationSec,CostUSD,Recorded,ComplianceVerified\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${l.contactName}","${l.number}","${l.direction}","${l.timestamp}",${l.durationSeconds},${l.cost},${l.hasRecording},${l.complianceVerified}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GlobeCall_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-white">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" />
            Call History & Recording Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Carrier logs, GDPR call recordings, and AI-generated call summaries
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Export Audit CSV Report</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search history by contact or number..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs w-full md:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'all' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Calls ({logs.length})
          </button>
          <button
            onClick={() => setFilterMode('recorded')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'recorded' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Recordings Only
          </button>
          <button
            onClick={() => setFilterMode('missed')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'missed' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Missed Calls
          </button>
        </div>
      </div>

      {/* Call Log List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="divide-y divide-slate-800/80">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700/60">
                  {getDirectionIcon(log.direction)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{log.contactName}</h3>
                    {log.complianceVerified && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        GDPR Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {log.number} • {log.timestamp}
                  </p>
                </div>
              </div>

              {/* Call Stats & Badges */}
              <div className="flex items-center gap-4 flex-wrap md:flex-nowrap justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-200">
                    {log.direction === 'missed' ? (
                      <span className="text-red-400">Missed Call</span>
                    ) : (
                      formatSeconds(log.durationSeconds)
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Cost: ${log.cost.toFixed(3)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Play Audio Mock */}
                  {log.hasRecording && (
                    <button
                      onClick={() => setPlayingAudioId(playingAudioId === log.id ? null : log.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        playingAudioId === log.id
                          ? 'bg-red-600 text-white border-red-500 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Disc className="w-3.5 h-3.5 text-red-400" />
                      <span>{playingAudioId === log.id ? 'Playing...' : 'Audio'}</span>
                    </button>
                  )}

                  {/* AI Summary / Transcript Button */}
                  {log.summary && (
                    <button
                      onClick={() => setSelectedTranscriptLog(log)}
                      className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>AI Recap</span>
                    </button>
                  )}

                  {/* Redial Button */}
                  <button
                    onClick={() => onStartCall(log.number, log.contactName, 'voice', 0.015)}
                    className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl transition-colors"
                    title="Redial Number"
                  >
                    <PhoneOutgoing className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Transcript & Summary Modal */}
      {selectedTranscriptLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-base">Call Intelligence Record</h3>
                  <p className="text-xs text-slate-400">{selectedTranscriptLog.contactName} • {selectedTranscriptLog.timestamp}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTranscriptLog(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-1">Executive Summary</h4>
              <p className="text-xs text-slate-200 bg-slate-800 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
                {selectedTranscriptLog.summary}
              </p>
            </div>

            {selectedTranscriptLog.actionItems && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-1">Action Items</h4>
                <div className="space-y-1">
                  {selectedTranscriptLog.actionItems.map((item, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTranscriptLog.transcript && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-1">Full Speech Transcript</h4>
                <pre className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
                  {selectedTranscriptLog.transcript}
                </pre>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTranscriptLog(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

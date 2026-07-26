import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Search,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  FileText,
  ShieldCheck,
  Send,
  Loader2,
} from 'lucide-react';
import { CallLog } from '../types';

interface AIIntelligenceViewProps {
  logs: CallLog[];
}

export const AIIntelligenceView: React.FC<AIIntelligenceViewProps> = ({ logs }) => {
  const [customText, setCustomText] = useState('');
  const [callerName, setCallerName] = useState('Alex Morgan');
  const [calleeName, setCalleeName] = useState('Sarah Jenkins');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAnalyzeText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText) return;

    try {
      setIsAnalyzing(true);
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: customText,
          caller: callerName,
          callee: calleeName,
          callType: 'Voice Call',
          duration: '4m 12s',
        }),
      });
      const data = await res.json();
      setAiAnalysisResult(data);
    } catch (err) {
      console.error('Failed to analyze:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const logsWithTranscripts = logs.filter((l) => l.summary || l.transcript);

  const filteredLogs = logsWithTranscripts.filter(
    (l) =>
      l.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.summary && l.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.transcript && l.transcript.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-400" />
          GlobeCall AI Intelligence Hub
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time speech transcription, sentiment classification, and action item extraction powered by Gemini 3.6
        </p>
      </div>

      {/* Interactive AI Summarizer Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Bot className="w-5 h-5 text-blue-400" />
          <h2 className="font-bold text-sm text-white">Interactive Call Transcript Analyzer</h2>
        </div>

        <form onSubmit={handleAnalyzeText} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Caller Name</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Callee Name</label>
              <input
                type="text"
                value={calleeName}
                onChange={(e) => setCalleeName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Paste or Type Call Notes / Transcript Speech
            </label>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Alex: We reviewed the APAC media proxy server logs. Sarah: Everything was stable with under 80ms latency. We agreed to proceed with the contract extension..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing || !customText}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Gemini AI Analytics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Call Summary & Action Items</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Output Card */}
        {aiAnalysisResult && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                AI Analysis Complete
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Tone: {aiAnalysisResult.sentiment}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-1">Summary</h4>
              <p className="text-xs text-slate-200 leading-relaxed">{aiAnalysisResult.summary}</p>
            </div>

            {aiAnalysisResult.keyTopics && (
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">Key Discussion Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysisResult.keyTopics.map((topic: string, i: number) => (
                    <span key={i} className="text-xs bg-slate-800 text-blue-300 px-3 py-1 rounded-lg border border-slate-700">
                      #{topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {aiAnalysisResult.actionItems && (
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">Extracted Action Items</h4>
                <div className="space-y-1.5">
                  {aiAnalysisResult.actionItems.map((item: string, i: number) => (
                    <div key={i} className="text-xs bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vault Search & Archive */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Call Transcript Vault Search
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across call transcripts..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{log.contactName}</span>
                <span className="text-[10px] text-slate-400">{log.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {log.summary || log.transcript}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

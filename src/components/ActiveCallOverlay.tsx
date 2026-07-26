import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  Pause,
  Play,
  Disc,
  Users,
  ArrowRightLeft,
  Smartphone,
  Sparkles,
  ShieldAlert,
  Bot,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { CallType, CallStatus } from '../types';
import { audioSynthesizer } from '../utils/audioSynthesizer';

interface ActiveCallOverlayProps {
  status: CallStatus;
  contactName: string;
  number: string;
  callType: CallType;
  ratePerMin: number;
  onEndCall: () => void;
  onSaveCallSummary?: (summaryData: any) => void;
}

export const ActiveCallOverlay: React.FC<ActiveCallOverlayProps> = ({
  status: initialStatus,
  contactName,
  number,
  callType,
  ratePerMin,
  onEndCall,
  onSaveCallSummary,
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(initialStatus);
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [isOnHold, setIsOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [transcripts, setTranscripts] = useState<
    { speaker: string; text: string; timestamp: string }[]
  >([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [postCallAiSummary, setPostCallAiSummary] = useState<any>(null);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(false);
  const [deviceHandoffActive, setDeviceHandoffActive] = useState(false);

  // Audio ringback sound on dial
  useEffect(() => {
    if (callStatus === 'dialing' || callStatus === 'ringing') {
      audioSynthesizer.startRingback();
      const timer = setTimeout(() => {
        audioSynthesizer.playConnectChime();
        setCallStatus('active');
        fetchSimulatedDialogue();
      }, 3500);
      return () => {
        clearTimeout(timer);
        audioSynthesizer.stopRingback();
      };
    }
  }, [callStatus]);

  // Active call duration timer
  useEffect(() => {
    let interval: any = null;
    if (callStatus === 'active' && !isOnHold) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus, isOnHold]);

  // Fetch simulated dialogue from server or local fallback
  const fetchSimulatedDialogue = async () => {
    try {
      setIsAiGenerating(true);
      const res = await fetch('/api/gemini/simulate-call-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName,
          company: 'GlobeCall Network',
          topic: 'VoIP audio verification and GDPR consent',
        }),
      });
      const data = await res.json();
      if (data.dialogue) {
        data.dialogue.forEach((item: any, idx: number) => {
          setTimeout(() => {
            setTranscripts((prev) => [
              ...prev,
              {
                speaker: item.speaker,
                text: item.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }, (idx + 1) * 3000);
        });
      }
    } catch (e) {
      console.warn('Failed script fetch:', e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      setShowConsentModal(true);
    } else {
      setIsRecording(false);
    }
  };

  const handleConfirmConsentAndRecord = () => {
    setIsRecording(true);
    setShowConsentModal(false);
  };

  const handleHangup = async () => {
    audioSynthesizer.playDisconnectChime();
    setCallStatus('ended');

    // Generate AI Summary via backend Gemini endpoint
    try {
      const fullText = transcripts.map((t) => `${t.speaker}: ${t.text}`).join('\n');
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: fullText || `Call with ${contactName} discussing VoIP routing and HD audio verification.`,
          caller: 'You',
          callee: contactName,
          callType,
          duration: `${Math.floor(seconds / 60)}m ${seconds % 60}s`,
        }),
      });
      const summaryData = await res.json();
      setPostCallAiSummary(summaryData);
      setShowSummaryDrawer(true);
      if (onSaveCallSummary) {
        onSaveCallSummary({
          contactName,
          number,
          type: callType,
          durationSeconds: seconds,
          summary: summaryData.summary,
          sentiment: summaryData.sentiment,
          actionItems: summaryData.actionItems,
        });
      }
    } catch (e) {
      console.error('Failed AI summary generation:', e);
      onEndCall();
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-white">
        {/* Top Call Bar */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-xs text-emerald-400 uppercase tracking-wider">
              {callStatus === 'dialing' || callStatus === 'ringing'
                ? 'Ringing Destination...'
                : isOnHold
                ? 'Call On Hold'
                : 'Carrier Bridge Active (Opus HD)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
              {formatTimer(seconds)}
            </span>
            {isRecording && (
              <span className="flex items-center gap-1.5 text-xs bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/30 animate-pulse">
                <Disc className="w-3 h-3 text-red-500" />
                <span>Recording</span>
              </span>
            )}
          </div>
        </div>

        {/* Call Stage Content */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center overflow-y-auto">
          {/* Avatar / Video Stream Simulation */}
          <div className="relative mb-6">
            {isVideoOn ? (
              <div className="w-48 h-36 rounded-2xl bg-slate-800 border-2 border-blue-500/50 overflow-hidden relative shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
                  alt="Video Feed"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                  1080p HD • VP8
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
                    alt={contactName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {/* Motion Audio Wave Effect */}
                <div className="absolute -inset-2 rounded-full border-2 border-blue-500/30 animate-ping pointer-events-none" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-white">{contactName}</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">{number}</p>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">
            Est. Cost: ${( (seconds / 60) * ratePerMin ).toFixed(3)} USD
          </p>

          {/* Device Handoff Banner */}
          {deviceHandoffActive && (
            <div className="mt-3 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Call seamless handoff connected to Mobile App</span>
            </div>
          )}

          {/* Live AI Transcript Feed */}
          <div className="w-full mt-6 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left max-h-40 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                Live AI Speech Transcript
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Whisper AI
              </span>
            </div>
            {transcripts.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Listening to audio stream...</p>
            ) : (
              <div className="space-y-2">
                {transcripts.map((t, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-semibold text-blue-400">{t.speaker}: </span>
                    <span className="text-slate-200">{t.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-center flex-wrap gap-3">
            {/* Mute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Mute Microphone"
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video Toggle */}
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isVideoOn ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Toggle Video Camera"
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Hold Call */}
            <button
              onClick={() => setIsOnHold(!isOnHold)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isOnHold ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Hold Call"
            >
              {isOnHold ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>

            {/* Record Toggle with Dual Consent */}
            <button
              onClick={handleToggleRecording}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Record Call (GDPR Consent)"
            >
              <Disc className="w-5 h-5" />
            </button>

            {/* Call Transfer */}
            <button
              onClick={() => setShowTransferModal(true)}
              className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center justify-center transition-all"
              title="Transfer Call to Extension/Agent"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>

            {/* Device Handoff */}
            <button
              onClick={() => setDeviceHandoffActive(!deviceHandoffActive)}
              className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center justify-center transition-all"
              title="Handoff to Mobile App"
            >
              <Smartphone className="w-5 h-5" />
            </button>

            {/* Hangup Red Button */}
            <button
              onClick={handleHangup}
              className="w-16 h-12 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95 ml-2"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Recording GDPR Consent Confirmation Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-base">Call Recording Legal Disclosure</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              By turning on call recording, an automated audio prompt will announce:{' '}
              <em className="text-white">"This call is recorded for quality and compliance purposes"</em>{' '}
              to comply with international GDPR and 2-party consent regulations.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConsentAndRecord}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Announce & Start Recording
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Call Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="font-bold text-base mb-2">Transfer Call</h3>
            <p className="text-xs text-slate-400 mb-4">
              Transfer this active call to another extension or external phone number.
            </p>
            <input
              type="text"
              value={transferTarget}
              onChange={(e) => setTransferTarget(e.target.value)}
              placeholder="Enter extension or +1 number..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setCallStatus('ended');
                  onEndCall();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Execute Blind Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Call AI Summary Drawer */}
      {showSummaryDrawer && postCallAiSummary && (
        <div className="fixed inset-0 z-70 bg-slate-950/95 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">GlobeCall AI Post-Call Summary</h3>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded uppercase font-bold">
                {postCallAiSummary.sentiment || 'Positive'}
              </span>
            </div>

            <div className="mt-4 space-y-4 text-left">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-1">Executive Summary</h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  {postCallAiSummary.summary}
                </p>
              </div>

              {postCallAiSummary.actionItems && postCallAiSummary.actionItems.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">Extracted Action Items</h4>
                  <ul className="space-y-1">
                    {postCallAiSummary.actionItems.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-2 bg-slate-800/40 p-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSummaryDrawer(false);
                  onEndCall();
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg"
              >
                Close & Return to App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

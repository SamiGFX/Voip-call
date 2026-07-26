import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { Dialer } from './components/Dialer';
import { ActiveCallOverlay } from './components/ActiveCallOverlay';
import { ContactsView } from './components/ContactsView';
import { CallHistoryView } from './components/CallHistoryView';
import { VoicemailView } from './components/VoicemailView';
import { AIIntelligenceView } from './components/AIIntelligenceView';
import { BusinessAdminView } from './components/BusinessAdminView';
import { RatesView } from './components/RatesView';
import { SettingsView } from './components/SettingsView';

import { AccountType, CallType, Contact, CallLog, Voicemail, NetworkTelemetry } from './types';
import { INITIAL_CONTACTS } from './data/contacts';
import { INITIAL_CALL_LOGS } from './data/callHistory';
import { INITIAL_VOICEMAILS } from './data/voicemails';

export default function App() {
  const [accountType, setAccountType] = useState<AccountType>('consumer');
  const [activeTab, setActiveTab] = useState<NavTab>('dialer');
  const [balance, setBalance] = useState<number>(42.5);

  const [telemetry, setTelemetry] = useState<NetworkTelemetry>({
    pingMs: 24,
    jitterMs: 1.2,
    packetLossPercent: 0.02,
    codec: 'Opus (HD Audio)',
    mosScore: 4.48,
    regionServer: 'US-West Media Proxy (San Jose)',
  });

  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [callLogs, setCallLogs] = useState<CallLog[]>(INITIAL_CALL_LOGS);
  const [voicemails, setVoicemails] = useState<Voicemail[]>(INITIAL_VOICEMAILS);

  // Sync initial state from Express backend on mount
  useEffect(() => {
    async function fetchBackendData() {
      try {
        const [contactsRes, logsRes, vmRes, balRes, telRes] = await Promise.allSettled([
          fetch('/api/contacts').then((r) => r.json()),
          fetch('/api/call-logs').then((r) => r.json()),
          fetch('/api/voicemails').then((r) => r.json()),
          fetch('/api/balance').then((r) => r.json()),
          fetch('/api/telemetry').then((r) => r.json()),
        ]);

        if (contactsRes.status === 'fulfilled' && contactsRes.value.contacts) {
          setContacts(contactsRes.value.contacts);
        }
        if (logsRes.status === 'fulfilled' && logsRes.value.logs) {
          setCallLogs(logsRes.value.logs);
        }
        if (vmRes.status === 'fulfilled' && vmRes.value.voicemails) {
          setVoicemails(vmRes.value.voicemails);
        }
        if (balRes.status === 'fulfilled' && typeof balRes.value.balance === 'number') {
          setBalance(balRes.value.balance);
        }
        if (telRes.status === 'fulfilled' && telRes.value.telemetry) {
          setTelemetry(telRes.value.telemetry);
        }
      } catch (err) {
        console.warn('Backend sync warning, using local state:', err);
      }
    }
    fetchBackendData();
  }, []);

  // Active VoIP Call State
  const [activeCall, setActiveCall] = useState<{
    targetNumber: string;
    targetName: string;
    callType: CallType;
    ratePerMin: number;
  } | null>(null);

  const handleStartCall = async (
    targetNumber: string,
    targetName: string,
    callType: CallType,
    ratePerMin: number
  ) => {
    setActiveCall({
      targetNumber,
      targetName,
      callType,
      ratePerMin,
    });

    // Notify backend call controller of session initiation
    try {
      await fetch('/api/calls/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetNumber, targetName, callType }),
      });
    } catch (e) {
      console.warn('Failed call initiation log on backend', e);
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const handleSaveCallSummary = async (summaryData: any) => {
    const costCalc = Number((((summaryData.durationSeconds || 60) / 60) * 0.015).toFixed(3));
    const newLogPayload = {
      contactName: summaryData.contactName || 'Unknown Contact',
      number: summaryData.number || '+1 555-0199',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      type: (summaryData.type || 'voice') as CallType,
      direction: 'outbound' as const,
      durationSeconds: summaryData.durationSeconds || 60,
      cost: costCalc,
      qualityRating: 5,
      hasRecording: true,
      summary: summaryData.summary,
      sentiment: summaryData.sentiment || 'positive',
      actionItems: summaryData.actionItems || [],
    };

    try {
      const res = await fetch('/api/call-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLogPayload),
      });
      const data = await res.json();
      if (data.log) {
        setCallLogs((prev) => [data.log, ...prev]);
        if (typeof data.currentBalance === 'number') {
          setBalance(data.currentBalance);
        }
        return;
      }
    } catch (err) {
      console.warn('Failed to save log to backend:', err);
    }

    // Fallback local update
    const fallbackLog: CallLog = {
      id: `call-${Date.now()}`,
      ...newLogPayload,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      complianceVerified: true,
    };
    setCallLogs((prev) => [fallbackLog, ...prev]);
    setBalance((prev) => Math.max(0, prev - costCalc));
  };

  const handleAddContact = async (newContact: Contact) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      });
      const saved = await res.json();
      if (saved.id) {
        setContacts((prev) => [saved, ...prev]);
        return;
      }
    } catch (e) {
      console.warn('Failed adding contact to backend:', e);
    }
    setContacts((prev) => [newContact, ...prev]);
  };

  const handleDeleteVoicemail = async (id: string) => {
    try {
      await fetch(`/api/voicemails/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed deleting voicemail on backend:', e);
    }
    setVoicemails((prev) => prev.filter((v) => v.id !== id));
  };

  const unreadVoicemailsCount = voicemails.filter((v) => !v.isRead).length;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Header
        accountType={accountType}
        setAccountType={setAccountType}
        telemetry={telemetry}
        balance={balance}
        setBalance={setBalance}
        activeCallCount={activeCall ? 1 : 0}
        onOpenDialer={() => setActiveTab('dialer')}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadVoicemailsCount={unreadVoicemailsCount}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dialer' && (
          <Dialer onStartCall={handleStartCall} contacts={contacts} />
        )}

        {activeTab === 'contacts' && (
          <ContactsView
            contacts={contacts}
            onStartCall={handleStartCall}
            onAddContact={handleAddContact}
          />
        )}

        {activeTab === 'history' && (
          <CallHistoryView logs={callLogs} onStartCall={handleStartCall} />
        )}

        {activeTab === 'messages' && (
          <VoicemailView
            voicemails={voicemails}
            onStartCall={handleStartCall}
            onDeleteVoicemail={handleDeleteVoicemail}
          />
        )}

        {activeTab === 'ai' && <AIIntelligenceView logs={callLogs} />}

        {activeTab === 'admin' && (
          <BusinessAdminView telemetry={telemetry} />
        )}

        {activeTab === 'rates' && (
          <RatesView balance={balance} setBalance={setBalance} />
        )}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Active Call Stage Overlay Modal */}
      {activeCall && (
        <ActiveCallOverlay
          status="dialing"
          contactName={activeCall.targetName}
          number={activeCall.targetNumber}
          callType={activeCall.callType}
          ratePerMin={activeCall.ratePerMin}
          onEndCall={handleEndCall}
          onSaveCallSummary={handleSaveCallSummary}
        />
      )}
    </div>
  );
}

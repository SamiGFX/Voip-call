import React, { useState } from 'react';
import {
  Building2,
  Users,
  PhoneCall,
  Settings2,
  Bot,
  Plus,
  ShieldCheck,
  Activity,
  BarChart2,
  GitBranch,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TeamMember, IVRNode, NetworkTelemetry } from '../types';

interface BusinessAdminViewProps {
  telemetry: NetworkTelemetry;
}

export const BusinessAdminView: React.FC<BusinessAdminViewProps> = ({ telemetry }) => {
  const [activeTab, setActiveTab] = useState<'seats' | 'ivr' | 'routing' | 'telemetry'>('seats');

  // Team Seats Data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'usr-1',
      name: 'Sarah Jenkins',
      email: 's.jenkins@acme.com',
      role: 'Manager',
      extension: '1001',
      directNumber: '+1 (415) 892-3011',
      department: 'Sales & BD',
      callsHandled: 142,
      avgDuration: '4m 15s',
      status: 'available',
      recordingEnabled: true,
    },
    {
      id: 'usr-2',
      name: 'Kenji Sato',
      email: 'k.sato@tokyo.jp',
      role: 'Supervisor',
      extension: '1002',
      directNumber: '+81 3 5555 0142',
      department: 'SIP Infrastructure',
      callsHandled: 98,
      avgDuration: '8m 40s',
      status: 'in_call',
      recordingEnabled: true,
    },
    {
      id: 'usr-3',
      name: 'David O\'Connor',
      email: 'd.oc@sydney.au',
      role: 'Agent',
      extension: '1003',
      directNumber: '+61 2 9384 1029',
      department: 'Support Ops',
      callsHandled: 210,
      avgDuration: '3m 10s',
      status: 'dnd',
      recordingEnabled: true,
    },
  ]);

  // IVR Menu State
  const [ivrMenu, setIvrMenu] = useState<IVRNode[]>([
    { key: '1', label: 'Sales & International Quotes', action: 'transfer', target: 'Queue - Sales (Ext 1001)' },
    { key: '2', label: 'Technical & Telemetry Support', action: 'transfer', target: 'Queue - Tech (Ext 1002)' },
    { key: '3', label: 'Compliance & GDPR Desk', action: 'transfer', target: 'Queue - Legal (Ext 1003)' },
    { key: '0', label: 'Operator / Receptionist', action: 'transfer', target: 'Front Desk Operator' },
  ]);

  const [companyName, setCompanyName] = useState('Acme Global Telecom');
  const [industry, setIndustry] = useState('Technology & Cloud Services');
  const [isAiGeneratingIvr, setIsAiGeneratingIvr] = useState(false);

  // Invite User Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Admin' | 'Agent' | 'Supervisor' | 'Manager'>('Agent');
  const [newMemberDept, setNewMemberDept] = useState('Sales');

  const handleAiIvrAssist = async () => {
    try {
      setIsAiGeneratingIvr(true);
      const res = await fetch('/api/gemini/ivr-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, industry }),
      });
      const data = await res.json();
      if (data.menuOptions) {
        setIvrMenu(data.menuOptions);
      }
    } catch (e) {
      console.error('Failed IVR generation:', e);
    } finally {
      setIsAiGeneratingIvr(false);
    }
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;

    const created: TeamMember = {
      id: `usr-${Date.now()}`,
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      extension: `100${teamMembers.length + 1}`,
      directNumber: `+1 (800) 555-01${teamMembers.length + 10}`,
      department: newMemberDept,
      callsHandled: 0,
      avgDuration: '0m 0s',
      status: 'available',
      recordingEnabled: true,
    };

    setTeamMembers([...teamMembers, created]);
    setShowInviteModal(false);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            GlobeCall Business & Enterprise Admin
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized team seats, IVR routing trees, telemetry performance, and GDPR compliance governance
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Team Seat</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('seats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'seats' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Seats & Roles ({teamMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ivr')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'ivr' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Interactive IVR Menu Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'telemetry' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Carrier Telemetry & MOS Scores</span>
        </button>
      </div>

      {/* Tab 1: Team Seat & Extension Management */}
      {activeTab === 'seats' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Provisioned Team Seat Accounts</h3>
            <span className="text-xs text-emerald-400 font-mono">3 / 10 License Seats Used</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Member</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Ext / Direct Line</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Calls Handled</th>
                  <th className="p-3.5">GDPR Recording</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-white">{member.name}</p>
                      <p className="text-[11px] text-slate-400">{member.email}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded text-[11px] font-semibold text-indigo-300">
                        {member.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      Ext {member.extension} <br />
                      <span className="text-[11px] text-slate-400">{member.directNumber}</span>
                    </td>
                    <td className="p-3.5 text-slate-300">{member.department}</td>
                    <td className="p-3.5 text-slate-300 font-mono">
                      {member.callsHandled} calls ({member.avgDuration} avg)
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => {
                          setTeamMembers(
                            teamMembers.map((m) =>
                              m.id === member.id ? { ...m, recordingEnabled: !m.recordingEnabled } : m
                            )
                          );
                        }}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          member.recordingEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {member.recordingEnabled ? 'Enforced' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive IVR Menu Builder */}
      {activeTab === 'ivr' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white">Interactive Voice Response (IVR) Auto-Attendant</h3>
              <p className="text-xs text-slate-400">Configure phone keypad choices for inbound calls</p>
            </div>

            <button
              onClick={handleAiIvrAssist}
              disabled={isAiGeneratingIvr}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>{isAiGeneratingIvr ? 'Generating with Gemini...' : 'Generate IVR with AI'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Keypad Mapping Nodes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Configured Keypad Options</h4>
            {ivrMenu.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    {item.key}
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.label}</p>
                    <p className="text-[11px] text-slate-400">Target: {item.target}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-indigo-300 font-mono">
                  {item.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Carrier Telemetry & Quality */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs text-slate-400">Mean Opinion Score (MOS)</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{telemetry.mosScore} / 5.0</p>
              <p className="text-[11px] text-slate-500 mt-1">Excellent HD Audio Clarity</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs text-slate-400">Round-Trip Ping Latency</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{telemetry.pingMs} ms</p>
              <p className="text-[11px] text-slate-500 mt-1">Tier-1 Direct Carrier Routing</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs text-slate-400">Jitter & Packet Loss</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{telemetry.jitterMs}ms Jitter</p>
              <p className="text-[11px] text-emerald-400 mt-1">0.02% Packet Loss</p>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="font-bold text-base mb-4">Provision Team Seat</h3>
            <form onSubmit={handleInviteUser} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

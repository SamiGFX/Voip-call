import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Video,
  MessageSquare,
  Star,
  Clock,
  Building,
  Globe,
  CheckCircle,
} from 'lucide-react';
import { Contact, CallType } from '../types';

interface ContactsViewProps {
  contacts: Contact[];
  onStartCall: (targetNumber: string, targetName: string, callType: CallType, ratePerMin: number) => void;
  onAddContact: (newContact: Contact) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onStartCall,
  onAddContact,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'directory'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Contact Form State
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [newCompany, setNewCompany] = useState('');

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.number.includes(searchTerm) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.country.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'favorites') return c.isFavorite;
    if (filterMode === 'directory') return !!c.company;
    return true;
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newNumber) return;

    const created: Contact = {
      id: `cnt-${Date.now()}`,
      name: newName,
      number: newNumber,
      email: newEmail || 'user@example.com',
      country: newCountry,
      countryCode: '+1',
      flag: '🇺🇸',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      company: newCompany || 'Independent',
      status: 'available',
      timeZone: 'UTC',
      localTime: '12:00 PM',
      isFavorite: false,
    };

    onAddContact(created);
    setShowAddModal(false);
    setNewName('');
    setNewNumber('');
    setNewEmail('');
    setNewCompany('');
  };

  const getStatusBadge = (status: Contact['status']) => {
    switch (status) {
      case 'available':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="Available" />;
      case 'in_call':
        return <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20" title="In Call" />;
      case 'dnd':
        return <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-500/20" title="Do Not Disturb" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-slate-500" title="Offline" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-white">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Global Contacts & Directory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-device synced contacts with real-time presence & local timezone clocks
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Contact</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, company, number..."
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
            All Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setFilterMode('favorites')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'favorites' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Starred
          </button>
          <button
            onClick={() => setFilterMode('directory')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'directory' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Company Directory
          </button>
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-md hover:shadow-xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusBadge(contact.status)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      {contact.name}
                      {contact.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{contact.number}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                {contact.company && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{contact.company} • {contact.role}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{contact.flag} {contact.country}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Local Time: <strong className="text-emerald-300 font-mono">{contact.localTime}</strong> ({contact.timeZone})</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onStartCall(contact.number, contact.name, 'voice', 0.015)}
                className="flex-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Audio Call</span>
              </button>

              <button
                onClick={() => onStartCall(contact.number, contact.name, 'video', 0.02)}
                className="flex-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Call</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">Add New GlobeCall Contact</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">International Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="e.g. +44 20 7946 0912"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Acme Global"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="marcus@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

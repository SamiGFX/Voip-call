import React from 'react';
import {
  Phone,
  Users,
  History,
  MessageSquare,
  Sparkles,
  Building,
  Globe,
  Settings,
  Voicemail as VoicemailIcon,
} from 'lucide-react';

export type NavTab =
  | 'dialer'
  | 'contacts'
  | 'history'
  | 'messages'
  | 'ai'
  | 'admin'
  | 'rates'
  | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadVoicemailsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  unreadVoicemailsCount,
}) => {
  const tabs = [
    { id: 'dialer' as NavTab, label: 'Dialer', icon: Phone },
    { id: 'contacts' as NavTab, label: 'Contacts', icon: Users },
    { id: 'history' as NavTab, label: 'Call Log', icon: History },
    {
      id: 'messages' as NavTab,
      label: 'Voicemail',
      icon: VoicemailIcon,
      badge: unreadVoicemailsCount > 0 ? unreadVoicemailsCount : undefined,
    },
    { id: 'ai' as NavTab, label: 'AI Intelligence', icon: Sparkles },
    { id: 'admin' as NavTab, label: 'Business Admin', icon: Building },
    { id: 'rates' as NavTab, label: 'Global Rates', icon: Globe },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-[65px] z-30 shadow-sm overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-1 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all relative ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

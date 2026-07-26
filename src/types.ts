export type AccountType = 'consumer' | 'smb' | 'enterprise';

export type UserStatus = 'available' | 'in_call' | 'dnd' | 'offline';

export type CallStatus = 'idle' | 'dialing' | 'ringing' | 'active' | 'on_hold' | 'ended';

export type CallType = 'voice' | 'video' | 'conference';

export type CallDirection = 'inbound' | 'outbound' | 'missed';

export interface Contact {
  id: string;
  name: string;
  number: string;
  email: string;
  country: string;
  countryCode: string;
  flag: string;
  avatar: string;
  company?: string;
  department?: string;
  role?: string;
  status: UserStatus;
  timeZone: string;
  localTime: string;
  isFavorite: boolean;
}

export interface CallLog {
  id: string;
  contactName: string;
  number: string;
  avatar: string;
  type: CallType;
  direction: CallDirection;
  timestamp: string;
  durationSeconds: number;
  cost: number;
  qualityRating: number; // 1 to 5
  hasRecording: boolean;
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'constructive' | 'urgent';
  actionItems?: string[];
  complianceVerified: boolean;
}

export interface RateItem {
  country: string;
  flag: string;
  code: string;
  iso: string;
  landlineRate: number; // USD per min
  mobileRate: number;   // USD per min
  qualityScore: number; // percentage (e.g. 99.2)
  carrier: string;
  region: string;
}

export interface Voicemail {
  id: string;
  senderName: string;
  senderNumber: string;
  avatar: string;
  timestamp: string;
  durationSeconds: number;
  isRead: boolean;
  transcript: string;
  sentiment: 'positive' | 'neutral' | 'urgent';
  actionNeeded: boolean;
}

export interface ChatMessage {
  id: string;
  callId?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Agent' | 'Supervisor' | 'Manager';
  extension: string;
  directNumber: string;
  department: string;
  callsHandled: number;
  avgDuration: string;
  status: UserStatus;
  recordingEnabled: boolean;
}

export interface IVRNode {
  key: string;
  label: string;
  action: 'transfer' | 'voicemail' | 'sub_menu' | 'external';
  target: string;
}

export interface NetworkTelemetry {
  pingMs: number;
  jitterMs: number;
  packetLossPercent: number;
  codec: 'Opus (HD Audio)' | 'VP8 (HD Video)' | 'G.711 Low Bandwidth';
  mosScore: number; // Mean Opinion Score e.g. 4.45 / 5.0
  regionServer: string;
}

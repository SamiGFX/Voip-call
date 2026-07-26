import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Safe Gemini client getter
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// ==========================================
// IN-MEMORY BACKEND DATA STORES & SEEDS
// ==========================================

let accountBalance = 42.50;
let balanceTransactions = [
  { id: "tx-1", date: "2026-07-25 10:00", type: "topup", amount: 50.00, description: "Credit Card Top-Up (Visa ending 4242)" },
  { id: "tx-2", date: "2026-07-25 14:22", type: "call_deduction", amount: -0.05, description: "VoIP Call to Sarah Jenkins (+1 415 892-3011)" },
  { id: "tx-3", date: "2026-07-25 11:05", type: "call_deduction", amount: -0.32, description: "HD Video Call to Kenji Sato (+81 3 5555 0142)" },
];

let CALL_RATES: Record<string, { country: string; flag: string; code: string; landlineRate: number; mobileRate: number; qualityScore: number; carrier: string; iso: string; region: string }> = {
  US: { iso: "US", country: "United States", flag: "🇺🇸", code: "+1", landlineRate: 0.008, mobileRate: 0.012, qualityScore: 99.4, carrier: "Verizon / AT&T Tier-1 Direct", region: "North America" },
  GB: { iso: "GB", country: "United Kingdom", flag: "🇬🇧", code: "+44", landlineRate: 0.012, mobileRate: 0.024, qualityScore: 98.9, carrier: "BT / Vodafone Direct", region: "Europe" },
  CA: { iso: "CA", country: "Canada", flag: "🇨🇦", code: "+1", landlineRate: 0.009, mobileRate: 0.011, qualityScore: 99.2, carrier: "Rogers / Bell Direct", region: "North America" },
  DE: { iso: "DE", country: "Germany", flag: "🇩🇪", code: "+49", landlineRate: 0.015, mobileRate: 0.032, qualityScore: 98.5, carrier: "Deutsche Telekom", region: "Europe" },
  FR: { iso: "FR", country: "France", flag: "🇫🇷", code: "+33", landlineRate: 0.014, mobileRate: 0.029, qualityScore: 98.7, carrier: "Orange Tier-1", region: "Europe" },
  IN: { iso: "IN", country: "India", flag: "🇮🇳", code: "+91", landlineRate: 0.019, mobileRate: 0.022, qualityScore: 97.8, carrier: "Airtel / Jio Direct", region: "Asia Pacific" },
  JP: { iso: "JP", country: "Japan", flag: "🇯🇵", code: "+81", landlineRate: 0.021, mobileRate: 0.045, qualityScore: 99.6, carrier: "NTT Docomo / Softbank", region: "Asia Pacific" },
  AU: { iso: "AU", country: "Australia", flag: "🇦🇺", code: "+61", landlineRate: 0.018, mobileRate: 0.035, qualityScore: 98.9, carrier: "Telstra Premium", region: "Asia Pacific" },
  BR: { iso: "BR", country: "Brazil", flag: "🇧🇷", code: "+55", landlineRate: 0.025, mobileRate: 0.058, qualityScore: 96.2, carrier: "Vivo / Claro HQ", region: "Latin America" },
  NG: { iso: "NG", country: "Nigeria", flag: "🇳🇬", code: "+234", landlineRate: 0.089, mobileRate: 0.095, qualityScore: 94.5, carrier: "MTN / Glo Direct", region: "Africa" },
  CN: { iso: "CN", country: "China", flag: "🇨🇳", code: "+86", landlineRate: 0.022, mobileRate: 0.028, qualityScore: 97.1, carrier: "China Telecom", region: "Asia Pacific" },
  MX: { iso: "MX", country: "Mexico", flag: "🇲🇽", code: "+52", landlineRate: 0.016, mobileRate: 0.028, qualityScore: 97.4, carrier: "Telcel Direct", region: "Latin America" },
  ZA: { iso: "ZA", country: "South Africa", flag: "🇿🇦", code: "+27", landlineRate: 0.035, mobileRate: 0.068, qualityScore: 96.0, carrier: "Vodacom SA", region: "Africa" },
  AE: { iso: "AE", country: "United Arab Emirates", flag: "🇦🇪", code: "+971", landlineRate: 0.120, mobileRate: 0.150, qualityScore: 98.2, carrier: "Etisalat / du", region: "Middle East" },
  SG: { iso: "SG", country: "Singapore", flag: "🇸🇬", code: "+65", landlineRate: 0.011, mobileRate: 0.015, qualityScore: 99.8, carrier: "Singtel Ultra HQ", region: "Asia Pacific" },
};

let contactsStore = [
  {
    id: "cnt-1",
    name: "Sarah Jenkins",
    number: "+1 (415) 892-3011",
    email: "sarah.jenkins@acme-global.com",
    country: "United States",
    countryCode: "+1",
    flag: "🇺🇸",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    company: "Acme Global",
    department: "Sales & Business Dev",
    role: "VP of Global Partnerships",
    status: "available",
    timeZone: "PST (UTC-7)",
    localTime: "09:45 AM",
    isFavorite: true,
  },
  {
    id: "cnt-2",
    name: "Kenji Sato",
    number: "+81 3 5555 0142",
    email: "k.sato@tokyotech.jp",
    country: "Japan",
    countryCode: "+81",
    flag: "🇯🇵",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    company: "Tokyo Telecom Corp",
    department: "Infrastructure & SIP",
    role: "Principal VoIP Engineer",
    status: "in_call",
    timeZone: "JST (UTC+9)",
    localTime: "01:45 AM (Next day)",
    isFavorite: true,
  },
  {
    id: "cnt-3",
    name: "Elena Rostova",
    number: "+44 20 7946 0912",
    email: "elena.r@londonfintech.co.uk",
    country: "United Kingdom",
    countryCode: "+44",
    flag: "🇬🇧",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    company: "London Capital Group",
    department: "Compliance & Legal",
    role: "Chief Compliance Officer",
    status: "available",
    timeZone: "BST (UTC+1)",
    localTime: "05:45 PM",
    isFavorite: false,
  },
  {
    id: "cnt-4",
    name: "David O'Connor",
    number: "+61 2 9384 1029",
    email: "david.oc@sydneycloud.com.au",
    country: "Australia",
    countryCode: "+61",
    flag: "🇦🇺",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    company: "Sydney Cloud Logistics",
    department: "Customer Success",
    role: "Head of Support Operations",
    status: "dnd",
    timeZone: "AEST (UTC+10)",
    localTime: "02:45 AM (Next day)",
    isFavorite: true,
  },
  {
    id: "cnt-5",
    name: "Amara Okafor",
    number: "+234 1 234 5678",
    email: "amara.okafor@lagosnetworks.ng",
    country: "Nigeria",
    countryCode: "+234",
    flag: "🇳🇬",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    company: "Lagos Digital Hub",
    department: "Product Operations",
    role: "Senior Product Manager",
    status: "available",
    timeZone: "WAT (UTC+1)",
    localTime: "05:45 PM",
    isFavorite: false,
  },
  {
    id: "cnt-6",
    name: "Carlos Mendez",
    number: "+52 55 5281 9000",
    email: "carlos.m@mexicodigital.mx",
    country: "Mexico",
    countryCode: "+52",
    flag: "🇲🇽",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    company: "LATAM Growth Agency",
    department: "Marketing & Outreach",
    role: "Regional Manager",
    status: "offline",
    timeZone: "CST (UTC-6)",
    localTime: "10:45 AM",
    isFavorite: false,
  },
];

let callLogsStore = [
  {
    id: "call-101",
    contactName: "Sarah Jenkins",
    number: "+1 (415) 892-3011",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    type: "voice",
    direction: "outbound",
    timestamp: "2026-07-25 14:22",
    durationSeconds: 342,
    cost: 0.05,
    qualityRating: 5,
    hasRecording: true,
    transcript: "You: Hi Sarah, checking in on the EMEA SIP routing agreement.\nSarah: Hi! Yes, legal approved the dual-consent recording clauses under GDPR Article 6.\nYou: Excellent. We will enable auto-transcription for the support queue next week.\nSarah: Sounds great, send over the documentation when ready.",
    summary: "Discussed EMEA SIP routing agreement and confirmed legal approval for GDPR recording compliance. Auto-transcription rollout scheduled for next week.",
    sentiment: "positive",
    actionItems: [
      "Send SIP documentation to Sarah Jenkins",
      "Verify dual-consent audio prompt on EU trunk",
    ],
    complianceVerified: true,
  },
  {
    id: "call-102",
    contactName: "Kenji Sato",
    number: "+81 3 5555 0142",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    type: "video",
    direction: "inbound",
    timestamp: "2026-07-25 11:05",
    durationSeconds: 890,
    cost: 0.32,
    qualityRating: 5,
    hasRecording: true,
    transcript: "Kenji: Good morning! We tested the Opus HD codec latency between Tokyo and San Francisco.\nYou: What were the mean opinion scores?\nKenji: MOS score averaged 4.48 with under 85ms round-trip latency. Packet loss was under 0.1%.\nYou: Impressive! Let us deploy the tier-1 failover routes.",
    summary: "Reviewed Tokyo-SF latency test metrics. Opus HD codec achieved 4.48 MOS score with 85ms round-trip time. Tier-1 failover approved.",
    sentiment: "positive",
    actionItems: [
      "Deploy Tokyo tier-1 failover route in Admin Console",
      "Update APAC telemetry benchmarks in dashboard",
    ],
    complianceVerified: true,
  },
  {
    id: "call-103",
    contactName: "Elena Rostova",
    number: "+44 20 7946 0912",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    type: "voice",
    direction: "inbound",
    timestamp: "2026-07-24 16:40",
    durationSeconds: 195,
    cost: 0.04,
    qualityRating: 4,
    hasRecording: false,
    transcript: "Elena: Hello, I noticed a slight spike in international SMS rate adjustments for UK mobile numbers.\nYou: That was due to carrier surcharge updates in London. I will send you the updated rate table.",
    summary: "Clarified UK mobile carrier surcharge updates and promised updated pricing schedules.",
    sentiment: "neutral",
    actionItems: [
      "Email updated UK rate schedule to Elena Rostova",
    ],
    complianceVerified: true,
  },
];

let voicemailsStore = [
  {
    id: "vm-1",
    senderName: "Amara Okafor",
    senderNumber: "+234 1 234 5678",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    timestamp: "2026-07-25 15:10",
    durationSeconds: 42,
    isRead: false,
    transcript: "Hey! Amara here calling from Lagos Digital Hub. I wanted to confirm our joint webinar on low-latency VoIP in emerging markets next Thursday. Please call me back when you get a chance!",
    sentiment: "positive",
    actionNeeded: true,
  },
  {
    id: "vm-2",
    senderName: "Carlos Mendez",
    senderNumber: "+52 55 5281 9000",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    timestamp: "2026-07-24 10:30",
    durationSeconds: 28,
    isRead: true,
    transcript: "Hola! Calling regarding the enterprise seat license renewal for Mexico operations. All details are set in the billing portal.",
    sentiment: "neutral",
    actionNeeded: false,
  },
];

let teamSeatsStore = [
  {
    id: "usr-1",
    name: "Sarah Jenkins",
    email: "s.jenkins@acme.com",
    role: "Manager",
    extension: "1001",
    directNumber: "+1 (415) 892-3011",
    department: "Sales & BD",
    callsHandled: 142,
    avgDuration: "4m 15s",
    status: "available",
    recordingEnabled: true,
  },
  {
    id: "usr-2",
    name: "Kenji Sato",
    email: "k.sato@tokyo.jp",
    role: "Supervisor",
    extension: "1002",
    directNumber: "+81 3 5555 0142",
    department: "SIP Infrastructure",
    callsHandled: 98,
    avgDuration: "8m 40s",
    status: "in_call",
    recordingEnabled: true,
  },
  {
    id: "usr-3",
    name: "David O'Connor",
    email: "d.oc@sydney.au",
    role: "Agent",
    extension: "1003",
    directNumber: "+61 2 9384 1029",
    department: "Support Ops",
    callsHandled: 210,
    avgDuration: "3m 10s",
    status: "dnd",
    recordingEnabled: true,
  },
];

let ivrConfigStore = {
  companyName: "Acme Global Telecom",
  industry: "Technology & Cloud Services",
  greeting: "Welcome to Acme Global Telecom, powered by GlobeCall Enterprise VoIP.",
  menuOptions: [
    { key: "1", label: "Sales & International Quotes", action: "transfer", target: "Queue - Sales (Ext 1001)" },
    { key: "2", label: "Technical & Telemetry Support", action: "transfer", target: "Queue - Tech (Ext 1002)" },
    { key: "3", label: "Compliance & GDPR Desk", action: "transfer", target: "Queue - Legal (Ext 1003)" },
    { key: "0", label: "Operator / Receptionist", action: "transfer", target: "Front Desk Operator" },
  ],
};

let sipTrunksStore = [
  { id: "trunk-us-west", name: "US West Primary (San Jose)", ip: "198.51.100.45", port: 5060, status: "active", latencyMs: 24, activeChannels: 18, maxChannels: 100 },
  { id: "trunk-eu-central", name: "EU Central Primary (Frankfurt)", ip: "203.0.113.10", port: 5060, status: "active", latencyMs: 82, activeChannels: 12, maxChannels: 100 },
  { id: "trunk-apac-tokyo", name: "APAC Primary (Tokyo)", ip: "198.51.100.88", port: 5060, status: "active", latencyMs: 85, activeChannels: 8, maxChannels: 50 },
];

// Active Call Sessions tracked in memory
const activeCallSessions: Record<string, any> = {};

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "GlobeCall VoIP Engine Backend",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    activeSessions: Object.keys(activeCallSessions).length,
  });
});

// Balance & Billing API
app.get("/api/balance", (_req, res) => {
  res.json({ balance: accountBalance, transactions: balanceTransactions });
});

app.post("/api/balance/topup", (req, res) => {
  const { amount, paymentMethod } = req.body;
  const numAmount = Number(amount) || 25;
  accountBalance += numAmount;
  const newTx = {
    id: `tx-${Date.now()}`,
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
    type: "topup",
    amount: numAmount,
    description: `Credit Balance Top-Up (${paymentMethod || "Credit Card"})`,
  };
  balanceTransactions.unshift(newTx);
  res.json({ success: true, balance: accountBalance, transaction: newTx });
});

// Rates API
app.get("/api/rates", (_req, res) => {
  res.json({ rates: CALL_RATES });
});

app.post("/api/rates/calculate", (req, res) => {
  const { iso, minutes, lineType } = req.body;
  const countryData = CALL_RATES[iso] || CALL_RATES["US"];
  const duration = Number(minutes) || 1;
  const rate = lineType === "landline" ? countryData.landlineRate : countryData.mobileRate;
  const totalCost = Number((duration * rate).toFixed(4));

  res.json({
    iso: countryData.iso,
    country: countryData.country,
    ratePerMinute: rate,
    durationMinutes: duration,
    lineType: lineType || "mobile",
    estimatedCostUSD: totalCost,
    carrierRoute: countryData.carrier,
    qualityScore: countryData.qualityScore,
  });
});

// Contacts CRUD
app.get("/api/contacts", (_req, res) => {
  res.json({ contacts: contactsStore });
});

app.post("/api/contacts", (req, res) => {
  const newContact = {
    id: `cnt-${Date.now()}`,
    name: req.body.name || "New Contact",
    number: req.body.number || "+1 555-0000",
    email: req.body.email || "",
    country: req.body.country || "United States",
    countryCode: req.body.countryCode || "+1",
    flag: req.body.flag || "🇺🇸",
    avatar: req.body.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    company: req.body.company || "Independent",
    department: req.body.department || "General",
    role: req.body.role || "Client",
    status: req.body.status || "available",
    timeZone: req.body.timeZone || "UTC",
    localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isFavorite: req.body.isFavorite || false,
  };
  contactsStore.unshift(newContact);
  res.status(201).json(newContact);
});

app.delete("/api/contacts/:id", (req, res) => {
  contactsStore = contactsStore.filter((c) => c.id !== req.params.id);
  res.json({ success: true, id: req.params.id });
});

app.put("/api/contacts/:id", (req, res) => {
  const idx = contactsStore.findIndex((c) => c.id === req.params.id);
  if (idx !== -1) {
    contactsStore[idx] = { ...contactsStore[idx], ...req.body };
    return res.json(contactsStore[idx]);
  }
  res.status(404).json({ error: "Contact not found" });
});

// Call History Logs CRUD
app.get("/api/call-logs", (_req, res) => {
  res.json({ logs: callLogsStore });
});

app.post("/api/call-logs", (req, res) => {
  const newLog = {
    id: `call-${Date.now()}`,
    contactName: req.body.contactName || "Unknown Contact",
    number: req.body.number || "+1 555-0199",
    avatar: req.body.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    type: req.body.type || "voice",
    direction: req.body.direction || "outbound",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    durationSeconds: req.body.durationSeconds || 60,
    cost: Number(req.body.cost) || 0.015,
    qualityRating: req.body.qualityRating || 5,
    hasRecording: req.body.hasRecording ?? true,
    transcript: req.body.transcript || "",
    summary: req.body.summary || "Completed VoIP PSTN Session",
    sentiment: req.body.sentiment || "positive",
    actionItems: req.body.actionItems || [],
    complianceVerified: true,
  };
  callLogsStore.unshift(newLog);

  // Deduct cost from account balance
  if (newLog.cost > 0) {
    accountBalance = Math.max(0, accountBalance - newLog.cost);
    balanceTransactions.unshift({
      id: `tx-${Date.now()}`,
      date: newLog.timestamp,
      type: "call_deduction",
      amount: -newLog.cost,
      description: `VoIP Call to ${newLog.contactName} (${newLog.number})`,
    });
  }

  res.status(201).json({ log: newLog, currentBalance: accountBalance });
});

app.delete("/api/call-logs/:id", (req, res) => {
  callLogsStore = callLogsStore.filter((l) => l.id !== req.params.id);
  res.json({ success: true, id: req.params.id });
});

// Voicemails API
app.get("/api/voicemails", (_req, res) => {
  res.json({ voicemails: voicemailsStore });
});

app.post("/api/voicemails", (req, res) => {
  const newVm = {
    id: `vm-${Date.now()}`,
    senderName: req.body.senderName || "Incoming Caller",
    senderNumber: req.body.senderNumber || "+1 (800) 555-0199",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    durationSeconds: req.body.durationSeconds || 30,
    isRead: false,
    transcript: req.body.transcript || "Caller left a voicemail audio clip.",
    sentiment: req.body.sentiment || "neutral",
    actionNeeded: req.body.actionNeeded ?? true,
  };
  voicemailsStore.unshift(newVm);
  res.status(201).json(newVm);
});

app.patch("/api/voicemails/:id/read", (req, res) => {
  const vm = voicemailsStore.find((v) => v.id === req.params.id);
  if (vm) {
    vm.isRead = true;
    return res.json(vm);
  }
  res.status(404).json({ error: "Voicemail not found" });
});

app.delete("/api/voicemails/:id", (req, res) => {
  voicemailsStore = voicemailsStore.filter((v) => v.id !== req.params.id);
  res.json({ success: true, id: req.params.id });
});

// Active VoIP Call Controller Endpoints
app.post("/api/calls/initiate", (req, res) => {
  const { targetNumber, targetName, callType } = req.body;
  const sessionId = `sip-sess-${Date.now()}`;
  const countryCodeMatch = targetNumber.startsWith("+81") ? "JP" : targetNumber.startsWith("+44") ? "GB" : targetNumber.startsWith("+61") ? "AU" : "US";
  const rateData = CALL_RATES[countryCodeMatch] || CALL_RATES["US"];

  const session = {
    sessionId,
    targetNumber: targetNumber || "+1 (555) 0199",
    targetName: targetName || "Unknown Party",
    callType: callType || "voice",
    startTime: new Date().toISOString(),
    status: "connected",
    ratePerMin: rateData.mobileRate,
    carrier: rateData.carrier,
    codec: "Opus HD (48kHz stereo)",
    encryption: "SRTP AES-256-GCM",
  };

  activeCallSessions[sessionId] = session;
  res.json({ success: true, session });
});

app.post("/api/calls/end", (req, res) => {
  const { sessionId, durationSeconds, transcript } = req.body;
  const session = activeCallSessions[sessionId];

  const duration = Number(durationSeconds) || 45;
  const rate = session?.ratePerMin || 0.012;
  const cost = Number(((duration / 60) * rate).toFixed(3));

  delete activeCallSessions[sessionId];

  res.json({
    success: true,
    sessionId,
    durationSeconds: duration,
    costUSD: cost,
    carrierReport: {
      packetsSent: Math.floor(duration * 50),
      packetsReceived: Math.floor(duration * 50 - 2),
      jitterMs: 1.1,
      mosScore: 4.49,
    },
  });
});

// Network Telemetry & Carrier Diagnostics
app.get("/api/telemetry", (_req, res) => {
  res.json({
    telemetry: {
      pingMs: Math.floor(20 + Math.random() * 8),
      jitterMs: Number((1.0 + Math.random() * 0.4).toFixed(1)),
      packetLossPercent: 0.01,
      codec: "Opus (HD Audio 48kHz)",
      mosScore: 4.48,
      regionServer: "US-West Media Proxy (San Jose)",
      activeSipTrunks: sipTrunksStore,
    },
  });
});

// Business Enterprise Management APIs
app.get("/api/business/team", (_req, res) => {
  res.json({ team: teamSeatsStore });
});

app.post("/api/business/team", (req, res) => {
  const { name, email, role, department } = req.body;
  const newMember = {
    id: `usr-${Date.now()}`,
    name: name || "New Team Member",
    email: email || "user@company.com",
    role: role || "Agent",
    extension: `${1001 + teamSeatsStore.length}`,
    directNumber: `+1 (800) 555-0${100 + teamSeatsStore.length}`,
    department: department || "Operations",
    callsHandled: 0,
    avgDuration: "0m 0s",
    status: "available",
    recordingEnabled: true,
  };
  teamSeatsStore.push(newMember);
  res.status(201).json(newMember);
});

app.get("/api/business/ivr", (_req, res) => {
  res.json({ ivr: ivrConfigStore });
});

app.post("/api/business/ivr", (req, res) => {
  const { greeting, menuOptions, companyName, industry } = req.body;
  if (companyName) ivrConfigStore.companyName = companyName;
  if (industry) ivrConfigStore.industry = industry;
  if (greeting) ivrConfigStore.greeting = greeting;
  if (menuOptions) ivrConfigStore.menuOptions = menuOptions;

  res.json({ success: true, ivr: ivrConfigStore });
});

// ==========================================
// GEMINI AI INTEGRATION ENDPOINTS
// ==========================================

// AI Call Summarization
app.post("/api/gemini/summarize", async (req, res) => {
  try {
    const client = getGeminiClient();
    const { transcript, caller, callee, callType, duration } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript text is required" });
    }

    if (!client) {
      return res.json({
        summary: `Call between ${caller || "Caller"} and ${callee || "Callee"} lasting ${duration || "3 mins"}. Discussion centered around upcoming VoIP routing and project coordination.`,
        sentiment: "positive",
        keyTopics: ["VoIP Setup", "Project Timeline", "Action Plan"],
        actionItems: [
          "Follow up on agreement via GlobeCall chat",
          "Send recording recap to management",
        ],
        complianceFlags: ["GDPR Recording Consent: Confirmed", "Data Encryption: Standard AES-256"],
        suggestedFollowUp: "Schedule follow-up call next Tuesday at 10:00 AM.",
        fallbackMode: true,
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Analyze the following VoIP call transcript between ${caller || "Party A"} and ${callee || "Party B"}. Call type: ${callType || "Voice Call"}. Duration: ${duration || "N/A"}.\n\nTranscript:\n${transcript}`,
      config: {
        systemInstruction:
          "You are GlobeCall AI, an enterprise VoIP intelligence assistant. Produce concise, highly professional structured JSON call analytics including summary, sentiment (positive, neutral, constructive, urgent), key topics, actionable follow-ups, and compliance flags.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Executive 2-3 sentence overview of call" },
            sentiment: { type: Type.STRING, description: "Overall tone: positive, neutral, constructive, or urgent" },
            keyTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Main subjects discussed",
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Extracted tasks and follow ups",
            },
            complianceFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Legal/regulatory disclaimers or consent markers detected",
            },
            suggestedFollowUp: { type: Type.STRING, description: "Recommended next step or meeting time" },
          },
          required: ["summary", "sentiment", "keyTopics", "actionItems", "complianceFlags"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini summarize error:", error);
    res.status(500).json({
      error: "Failed to generate AI summary",
      details: error.message,
    });
  }
});

// AI Call Dialogue Simulation
app.post("/api/gemini/simulate-call-script", async (req, res) => {
  try {
    const client = getGeminiClient();
    const { contactName, company, topic } = req.body;

    if (!client) {
      return res.json({
        dialogue: [
          { speaker: contactName || "Alex Morgan", text: `Hello! Thanks for calling ${company || "GlobeCall Enterprise"}. How can I assist you today?` },
          { speaker: "You", text: `Hi ${contactName || "Alex"}, I wanted to check on the global routing setup for our international call centers.` },
          { speaker: contactName || "Alex Morgan", text: "Great news! The Opus HD audio codecs and SIP trunks are fully provisioned across London, Tokyo, and New York." },
          { speaker: "You", text: "That's fantastic. Let's make sure call recording consent is turned on for GDPR compliance." },
          { speaker: contactName || "Alex Morgan", text: "Already configured. All recordings include the automated dual-consent greeting before bridging." },
        ],
        topic: topic || "International SIP Trunks & Compliance",
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Generate a short 4-line realistic VoIP telephone dialogue between "You" and "${contactName || "Contact"}" working at "${company || "Global Telecom"}". Topic: "${topic || "Business VoIP upgrade and audio quality verification"}". Make it engaging and professional.`,
      config: {
        systemInstruction: "Return a JSON array of speech turns for a phone call.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            dialogue: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ["speaker", "text"],
              },
            },
          },
          required: ["topic", "dialogue"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Simulate call script error:", error);
    res.status(500).json({ error: "Failed to generate call script" });
  }
});

// AI IVR Flow Builder Assistant
app.post("/api/gemini/ivr-assist", async (req, res) => {
  try {
    const client = getGeminiClient();
    const { companyName, industry } = req.body;

    if (!client) {
      return res.json({
        greeting: `Welcome to ${companyName || "Acme Global"}, powered by GlobeCall VoIP.`,
        menuOptions: [
          { key: "1", label: "Sales & International Billing", target: "Department Queue - Sales" },
          { key: "2", label: "Technical Support & Telemetry", target: "Department Queue - Tech Support" },
          { key: "3", label: "Enterprise Security & Compliance", target: "Compliance Specialist" },
          { key: "0", label: "Speak with Operator", target: "Reception Desk" },
        ],
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Design an Interactive Voice Response (IVR) phone menu for "${companyName || "Enterprise Corp"}" in the "${industry || "Technology & Services"}" industry. Include an opening voice prompt and 4 key choices.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            menuOptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  label: { type: Type.STRING },
                  target: { type: Type.STRING },
                },
                required: ["key", "label", "target"],
              },
            },
          },
          required: ["greeting", "menuOptions"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate IVR design" });
  }
});

// AI Call Speech Translation Endpoint
app.post("/api/gemini/translate", async (req, res) => {
  try {
    const client = getGeminiClient();
    const { text, targetLanguage } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for translation" });
    }

    if (!client) {
      return res.json({
        originalText: text,
        targetLanguage: targetLanguage || "Spanish",
        translatedText: `[Translated to ${targetLanguage || "Spanish"}]: ${text}`,
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Translate the following call transcript snippet into ${targetLanguage || "Spanish"}:\n\n"${text}"`,
      config: {
        systemInstruction: "You are a professional real-time telecom speech translator. Return a JSON object with translatedText.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
          },
          required: ["translatedText"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      originalText: text,
      targetLanguage: targetLanguage || "Spanish",
      translatedText: parsed.translatedText,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to perform AI translation" });
  }
});

// AI Network Diagnostic Endpoint
app.post("/api/gemini/network-diagnostic", async (req, res) => {
  try {
    const client = getGeminiClient();
    const { pingMs, jitterMs, packetLossPercent, codec } = req.body;

    if (!client) {
      return res.json({
        healthScore: "Optimal",
        recommendation: "Your Opus HD audio codec parameters and 24ms ping round-trip provide crisp voice clarity.",
        suggestedActions: ["Keep current jitter buffer size at 20ms", "Media proxy route optimal"],
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Perform a VoIP network diagnostic for these metrics:\nPing: ${pingMs || 25}ms, Jitter: ${jitterMs || 1.2}ms, Packet Loss: ${packetLossPercent || 0.02}%, Codec: ${codec || "Opus"}.`,
      config: {
        systemInstruction: "You are a Senior Network Performance & VoIP Systems Architect. Return JSON analysis.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.STRING, description: "Optimal, Good, Fair, or Critical" },
            recommendation: { type: Type.STRING, description: "Detailed 2 sentence network analysis" },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["healthScore", "recommendation", "suggestedActions"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate network diagnostic" });
  }
});

// Start Express and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GlobeCall Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

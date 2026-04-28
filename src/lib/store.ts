// ─── Types ───────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  name: string;
  industry: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  rating?: number;
  status: string; // 'new', 'waiting', 'others', 'client'
  source: string;
  lastSentAt?: string;
  followUpCount?: number;
  createdAt: string;
}

export interface Client {
  id: string;
  leadId: string;
  name: string;
  industry: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'completed' | 'on-hold';
  convertedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // e.g. ['leads_view', 'leads_edit', 'email_send', 'finance_view', 'team_manage']
  createdAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  password?: string;
  roleId: string;
  role: string; // Display name
  phone: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  lastLogin?: string;
}

export interface EmailTemplate {
  id: string;
  industry: string;
  subject: string;
  body: string;
  tags: string[];
  attachments?: { name: string; type: string; data: string }[];
  createdAt: string;
}

export interface SavedPainPoint {
  id: string;
  industry: string;
  city: string;
  problem: string;
  detail: string;
  solution?: string;
  language: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  industry: string;
  leads: string[]; // Selected lead IDs
  sentCount: number;
  replyCount: number;
  status: 'active' | 'completed' | 'paused';
  autoFollowUp: boolean;
  followUpDelayDays: number;
  createdAt: string;
}

export interface Deal {
  id: string;
  clientId: string;
  clientName: string;
  emailsSent: number;
  hasReplied: boolean;
  status: 'negotiating' | 'confirmed' | 'lost';
  budget: number;
  revenue: number;
  paidAmount: number;
  pendingAmount: number;
  referredBy: string; // Team member name/ID
  notes: string;
  updatedAt: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;
  industry: string;
  notes?: string;
  status: 'active' | 'contacted' | 'closed';
  createdAt: string;
}

export interface AppSettings {
  industries: string[];
  language: 'English' | 'Tamil' | 'Tanglish';
  apiKeys: {
    locationIq: string;
    openai: string;
    apollo: string;
    hunter: string;
    sendgrid: string;
    gmailUser: string;
  };
  company: {
    name: string;
    logo: string;
    prefix: string;
  };
  user: {
    name: string;
    email: string;
    position: string;
    company: string;
    phone: string;
    role: string;
    signature?: string;
  };
}

// ─── Default Data ─────────────────────────────────────────────────────────────

export const DEFAULT_INDUSTRIES = [
  'Hotels & Resorts', 'Restaurants', 'Hospitals & Clinics', 'Retail Shops',
  'Real Estate', 'Gyms & Fitness', 'Salons & Spas', 'Schools & Colleges',
  'Law Firms', 'CA & Tax Firms', 'Auto Dealers', 'Pharmacies',
  'Dentists', 'Logistics & Transport', 'IT & Software', 'Manufacturing',
];

export const PAIN_POINTS_MAP: any = {
  'Hotels & Resorts': {
    problems: ['Manual billing delays', 'Inventory management confusion', 'Paper-based errors'],
    emailSubject: 'Quick question about hotel billing',
    emailBody: 'Hi [Manager name], noticed [Hotel name]...',
    platforms: ['Google Maps', 'Booking.com']
  }
};

export const PAIN_POINTS_DATA: Record<string, Record<string, { problems: { title: string; detail: string; solution: string }[] }>> = {
  'Hotels & Resorts': {
    'English': {
      problems: [
        { 
          title: 'Manual Check-in Delays', 
          detail: 'Guests wait 20+ mins due to manual ID verification and register entry. This causes poor first impressions and low ratings.',
          solution: 'Build a Mobile Check-in App. Guests can scan IDs and sign digitally. Use Digital Marketing to highlight "Fastest Check-in" in the city to attract business travelers.'
        },
        { 
          title: 'Inventory Management Confusion', 
          detail: 'Room availability is not synced across OTAs (Booking.com, MMT), leading to double bookings and overbooking penalties.',
          solution: 'Implement a Cloud-based Property Management System (PMS) with Channel Manager. This syncs all bookings in real-time. Upsell with SEO services to improve direct booking website visibility.'
        },
        { 
          title: 'Paper-based Billing Errors', 
          detail: 'Billing for food and laundry is often forgotten or miscalculated when done manually, leading to revenue leakage of 5-10%.',
          solution: 'Create a Tablet-based POS System for room service and laundry. All bills are instantly linked to the room number. Set up Automated WhatsApp receipts for professional image.'
        }
      ]
    },
    'Tamil': {
      problems: [
        { 
          title: 'பதிவு செய்வதில் தாமதம்', 
          detail: 'ஐடி சரிபார்ப்பு மற்றும் ரெஜிஸ்டர் என்ட்ரி கைகளால் செய்யப்படுவதால் வாடிக்கையாளர்கள் நீண்ட நேரம் காத்திருக்க வேண்டியுள்ளது.',
          solution: 'ஒரு மொபைல் செக்-இன் ஆப் உருவாக்கலாம். இதன் மூலம் கஸ்டமர்கள் தாங்களாகவே ஐடி கார்டுகளை ஸ்கேன் செய்துவிடலாம். "வேகமான செக்-இன்" என பேஸ்புக் விளம்பரம் செய்வதன் மூலம் அதிக வாடிக்கையாளர்களை ஈர்க்கலாம்.'
        },
        { 
          title: 'அறை மேலாண்மை குழப்பம்', 
          detail: 'அறைகள் காலியாக இருப்பதை ஆன்லைன் தளங்களில் அப்டேட் செய்யாததால் ஒரே அறைக்கு இரண்டு பேர் முன்பதிவு செய்யும் நிலை ஏற்படுகிறது.',
          solution: 'ஒரு சேனல் மேனேஜர் சிஸ்டம் (Cloud PMS) அமைக்கலாம். இது எல்லா ஆன்லைன் புக்கிங்கையும் ஒரே நேரத்தில் அப்டேட் செய்யும். கூடவே அவர்களின் இணையதளத்தை எஸ்சிஓ (SEO) செய்து நேரடி புக்கிங்கை அதிகரிக்கலாம்.'
        },
        { 
          title: 'பில்லிங் தவறுகள்', 
          detail: 'உணவு மற்றும் இதர சேவைகளுக்கான பில்களை மேனுவலாக போடும்போது சிலவற்றை விட்டுவிடுவதால் லாபம் குறைகிறது.',
          solution: 'டேப்லெட் மூலம் இயங்கும் பில்லிங் சாஃப்ட்வேர் (POS) வழங்கலாம். இது எல்லா ஆர்டர்களையும் உடனுக்குடன் ரூம் பில்லில் சேர்த்துவிடும். வாடிக்கையாளர்களுக்கு வாட்ஸ்அப்பில் தானியங்கி ரசீதுகள் அனுப்பலாம்.'
        }
      ]
    },
    'Tanglish': {
      problems: [
        { 
          title: 'Check-in Delays and Crowd', 
          detail: 'Register book-la entry panna neram aguradhala guests wait panranga. Idhu rating-ah kammi pannum.',
          solution: 'Oru Mobile App panna mudiyum. Guests direct-ah ID scan panni check-in pannikalam. "Super Fast Check-in" nu Digital Marketing panna guests-ku romba pudikum.'
        },
        { 
          title: 'Room Booking Confusion', 
          detail: 'Online booking-um local booking-um sync aguradhu illa. Overbooking problems varudhu.',
          solution: 'Real-time Channel Manager software set panni kudukalam. Ella sites-layum (Goibibo, MMT) automatic-ah update agum. Direct website SEO panna commission kooda save pannalam.'
        },
        { 
          title: 'Manual Billing Revenue Leakage', 
          detail: 'Extras (food, laundry) bill podumbodhu marandhuradhala 10% revenue loss agudhu.',
          solution: 'Tablet-based Billing POS system implement panna room orders yellam accurate-ah track agum. WhatsApp automation panna receipts instant-ah poidum, revenue-um correct-ah irukum.'
        }
      ]
    }
  },
  'Restaurants': {
    'English': {
      problems: [
        { 
          title: 'No Digital Menu / QR', 
          detail: 'Waiters are overburdened during peak hours. Customers leave because they cannot get the menu quickly.',
          solution: 'Develop a QR Code Digital Menu where customers can order from their table. Implement Social Media Ads highlighting your "Tech-first Dining" experience.'
        },
        { 
          title: 'KOT Miscommunication', 
          detail: 'Handwritten Kitchen Order Tickets are often misinterpreted, leading to wrong dishes and food waste.',
          solution: 'Set up a Kitchen Display System (KDS). Orders from the waiter app go straight to a screen in the kitchen. This reduces food waste by 15%.'
        },
        { 
          title: 'Lack of Customer Loyalty', 
          detail: 'No data is collected about regular customers, so you cannot offer discounts or re-target them via WhatsApp.',
          solution: 'Build a Customer CRM. Collect phone numbers via the billing app. Set up WhatsApp Automation for birthday offers and weekend special menus.'
        }
      ]
    },
    'Tamil': {
      problems: [
        { 
          title: 'டிஜிட்டல் மெனு இல்லாமை', 
          detail: 'கூட்டம் அதிகமாக இருக்கும் போது ஆர்டர் எடுக்க பணியாளர்கள் திணறுகிறார்கள். கியூ ஆர் கோட் இருந்தால் இது எளிதாகும்.',
          solution: 'கியூ ஆர் கோட் மெனு சிஸ்டம் அறிமுகப்படுத்தலாம். வாடிக்கையாளர்கள் தங்கள் போன் மூலமே ஆர்டர் செய்யலாம். இன்ஸ்டாகிராம் ரீல்ஸ் மூலம் உங்கள் ஹோட்டல் டிஜிட்டல் வசதிகளை விளம்பரப்படுத்தலாம்.'
        },
        { 
          title: 'சமையல் ஆர்டர் குழப்பம்', 
          detail: 'கைகளால் ஆர்டர் எழுதப்படுவதால் சமையலறையில் தவறவுகள் நடக்க வாய்ப்புள்ளது. இது உணவை வீணாக்குகிறது.',
          solution: 'கிச்சன் டிஸ்ப்ளே சிஸ்டம் (KDS) அமைக்கலாம். சர்வர் எடுக்கும் ஆர்டர் நேரடியாக கிச்சன் ஸ்கிரீனில் தெரியும். இது உணவு தயாரிப்பில் உள்ள தவறுகளை 100% குறைக்கும்.'
        },
        { 
          title: 'வாடிக்கையாளர் விவரங்கள் இல்லை', 
          detail: 'வழக்கமான வாடிக்கையாளர்களுக்கு சலுகைகள் வழங்கவோ அவர்களை மீண்டும் அழைக்கவோ டேட்டாபேஸ் கிடையாது.',
          solution: 'வாடிக்கையாளர் சிஆர்எம் (CRM) சாஃப்ட்வேர் வழங்கலாம். பில்லிங் செய்யும்போது நம்பர் வாங்கி, அவர்களுக்கு விசேஷ நாட்களில் ஆஃபர் மெசேஜ் அனுப்ப ஆட்டோமேஷன் செய்யலாம்.'
        }
      ]
    },
    'Tanglish': {
      problems: [
        { 
          title: 'QR Menu and Ordering', 
          detail: 'Rush hours-la order eduka aal pathala. QR code irundha customers-eh order pannipaanga.',
          solution: 'QR-based contactless ordering system panni kudukalam. Social Media Marketing panni "Smart Restaurant" nu brand pannalam, youth crowd vandhute irupaanga.'
        },
        { 
          title: 'Kitchen Order Errors', 
          detail: 'KOT paper tholanjidudhu illa thappa ezhudhuranga. Idhunaala unavu veenagudhu.',
          solution: 'Tablets for Waiters kuduthu order eduka vachalam. Kitchen-la oru monitor vacha direct-ah order anga vandhudum. Wrong orders yellam stop panni loss-ah kuraikalam.'
        },
        { 
          title: 'No Customer Data Tracking', 
          detail: 'Regluar customers yaaru-nu theriyala. WhatsApp marketing panna mudiyala.',
          solution: 'Customer Loyalty App create pannalam. Customer database maintain panni, automated WhatsApp campaign panna repeat customers adhigam avanga.'
        }
      ]
    }
  }
};

// ─── Store Functions ──────────────────────────────────────────────────────────

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function setItem<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Leads
export const getLeads = (): Lead[] => getItem('lf_leads', []);
export const saveLeads = (leads: Lead[]) => setItem('lf_leads', leads);
export const addLead = (lead: Lead) => { const leads = getLeads(); leads.unshift(lead); saveLeads(leads); };
export const updateLead = (id: string, updates: Partial<Lead>) => {
  saveLeads(getLeads().map(l => l.id === id ? { ...l, ...updates } : l));
};
export const deleteLead = (id: string) => saveLeads(getLeads().filter(l => l.id !== id));

// Clients
export const getClients = (): Client[] => getItem('lf_clients', []);
export const saveClients = (c: Client[]) => setItem('lf_clients', c);
export const addClient = (c: Client) => { const all = getClients(); all.unshift(c); saveClients(all); };
export const deleteClient = (id: string) => saveClients(getClients().filter(c => c.id !== id));

// Contacts
export const getContacts = (): Contact[] => getItem('lf_contacts', []);
export const saveContacts = (c: Contact[]) => setItem('lf_contacts', c);
export const addContact = (c: Contact) => { const all = getContacts(); all.unshift(c); saveContacts(all); };
export const updateContact = (id: string, updates: Partial<Contact>) => {
  saveContacts(getContacts().map(c => c.id === id ? { ...c, ...updates } : c));
};
export const deleteContact = (id: string) => saveContacts(getContacts().filter(c => c.id !== id));

export const convertLeadToClient = (lead: Lead) => {
  const client: Client = {
    id: uid(),
    leadId: lead.id,
    name: lead.name,
    industry: lead.industry,
    location: lead.location,
    address: lead.address || lead.location,
    phone: lead.phone,
    email: lead.email,
    status: 'active',
    convertedAt: now(),
  };
  addClient(client);

  // Also store in contacts
  const contact: Contact = {
    id: uid(),
    name: lead.name, // Business name as primary contact
    company: lead.name,
    email: lead.email,
    phone: lead.phone,
    role: 'Owner / Decision Maker',
    industry: lead.industry,
    status: 'active',
    createdAt: now(),
  };
  addContact(contact);

  deleteLead(lead.id);
};

// Campaigns
export const getCampaigns = (): Campaign[] => getItem('lf_campaigns', []);
export const saveCampaigns = (c: Campaign[]) => setItem('lf_campaigns', c);
export const addCampaign = (c: Campaign) => { const all = getCampaigns(); all.unshift(c); saveCampaigns(all); };

// Deals
export const getDeals = (): Deal[] => getItem('lf_deals', []);
export const saveDeals = (d: Deal[]) => setItem('lf_deals', d);
export const addDeal = (d: Deal) => { const all = getDeals(); all.unshift(d); saveDeals(all); };
export const updateDeal = (id: string, updates: Partial<Deal>) => {
  const all = getDeals();
  const idx = all.findIndex(d => d.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates, updatedAt: now() };
    saveDeals(all);
  }
};

// Saved Pain Points
export const getSavedPainPoints = (): SavedPainPoint[] => getItem('lf_saved_pain_points', []);
export const saveSavedPainPoints = (p: SavedPainPoint[]) => setItem('lf_saved_pain_points', p);
export const addSavedPainPoint = (p: SavedPainPoint) => { const all = getSavedPainPoints(); all.unshift(p); saveSavedPainPoints(all); };
export const deleteSavedPainPoint = (id: string) => saveSavedPainPoints(getSavedPainPoints().filter(p => p.id !== id));

// Team
export const getRoles = (): Role[] => getItem('lf_roles', [
  { id: 'admin', name: 'Administrator', description: 'Full access to all modules', permissions: ['all'], createdAt: now() },
  { id: 'sales', name: 'Sales Agent', description: 'Can manage leads and send emails', permissions: ['leads_view', 'email_send'], createdAt: now() }
]);
export const saveRoles = (r: Role[]) => setItem('lf_roles', r);
export const addRole = (r: Role) => { const all = getRoles(); all.push(r); saveRoles(all); };

export const getTeam = (): TeamMember[] => getItem('lf_team', []);
export const saveTeam = (t: TeamMember[]) => setItem('lf_team', t);
export const addTeamMember = (t: TeamMember) => { const all = getTeam(); all.unshift(t); saveTeam(all); };
export const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
  const all = getTeam();
  const idx = all.findIndex(t => t.id === id);
  if (idx !== -1) { all[idx] = { ...all[idx], ...updates }; saveTeam(all); }
};
export const deleteTeamMember = (id: string) => saveTeam(getTeam().filter(t => t.id !== id));

// Email Templates
export const getTemplates = (): EmailTemplate[] => getItem('lf_templates', []);
export const saveTemplates = (t: EmailTemplate[]) => setItem('lf_templates', t);

// Settings
export const getSettings = (): AppSettings => getItem('lf_settings', {
  industries: DEFAULT_INDUSTRIES,
  language: 'English',
  apiKeys: { locationIq: '', openai: '', apollo: '', hunter: '', sendgrid: '', gmailUser: '' },
  company: { name: 'Lead Finder', logo: '', prefix: 'LF' },
  user: { 
    name: 'Admin User', 
    email: 'admin@leadfinder.io', 
    position: 'Consultant',
    company: 'My Agency',
    phone: '+91 00000 00000',
    role: 'admin', 
    signature: 'Best regards,\n[Name]\n[Position]\n[Company]\n[Phone]\n[Email]' 
  },
});
export const saveSettings = (s: AppSettings) => setItem('lf_settings', s);

// Auth
export const getAuth = () => getItem('lf_auth', { isLoggedIn: false, user: null });
export const setAuth = (v: object) => setItem('lf_auth', v);

// Helpers
export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
export const now = () => new Date().toISOString();
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

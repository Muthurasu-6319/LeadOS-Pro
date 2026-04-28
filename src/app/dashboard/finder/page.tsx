'use client';
import { useState, useEffect } from 'react';
import { getSettings, addLead, uid, now } from '@/lib/store';
import { 
  Search, 
  MapPin, 
  Globe, 
  Building2, 
  Phone, 
  Mail, 
  Check, 
  Loader2, 
  CheckCircle2, 
  ShieldAlert,
  Info
} from 'lucide-react';
import Link from 'next/link';

const INDUSTRY_TAGS: Record<string, string> = {
  'Hotels & Resorts': 'hotel',
  'Restaurants': 'restaurant',
  'Hospitals & Clinics': 'hospital',
  'Retail Shops': 'shop',
  'Real Estate': 'real estate agency',
  'Gyms & Fitness': 'gym',
  'Salons & Spas': 'beauty salon',
  'Schools & Colleges': 'school',
  'Law Firms': 'lawyer',
  'CA & Tax Firms': 'accounting',
  'Auto Dealers': 'car dealer',
  'Pharmacies': 'pharmacy',
  'Dentists': 'dentist',
  'Logistics & Transport': 'logistics',
  'IT & Software': 'software company',
  'Manufacturing': 'factory'
};

type FinderLead = {
  id: string;
  name: string;
  industry: string;
  location: string;
  phone: string;
  email: string;
  rating: number;
  status: string;
  source: string;
  createdAt: string;
};

export default function FinderPage() {
  const [settings, setSettings] = useState<any>(null);
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FinderLead[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    if (s.industries.length > 0) setIndustry(s.industries[0]);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const searchLeads = async () => {
    if (!location.trim()) return;
    setLoading(true);
    setResults([]);
    
    const apiKey = settings?.apiKeys?.locationIq;
    if (!apiKey) {
      setLoading(false);
      showToast('Please add API Key in Settings');
      return;
    }

    try {
      const tag = INDUSTRY_TAGS[industry] || industry;
      const searchLocation = location.toLowerCase().includes('tamil nadu') ? location : `${location}, Tamil Nadu`;
      const query = encodeURIComponent(`${tag} in ${searchLocation}`);
      
      const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${query}&format=json&addressdetails=1&extratags=1&limit=${count * 2}&countrycodes=in`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const filtered = data
          .filter(item => item.class !== 'highway' && item.class !== 'boundary')
          .slice(0, count)
          .map(item => {
            const a = item.address;
            const name = item.display_name.split(',')[0];
            const addrParts = [a.road, a.suburb || a.neighbourhood, a.city || a.town || a.village, a.postcode].filter(Boolean);
            
            let originalPhone = item.extratags?.phone || item.extratags?.['contact:phone'] || '';
            
            return {
              id: uid(),
              name: name || `${industry} Business`,
              industry,
              location: a.city || a.town || a.village || location,
              address: addrParts.join(', ') || item.display_name,
              phone: originalPhone || 'Not Found',
              email: '',
              rating: 4.5,
              status: 'new',
              source: 'LocationIQ (Live)',
              createdAt: now(),
            };
          });
        setResults(filtered);
      } else {
        showToast(`No leads found.`);
      }
    } catch (err) {
      showToast('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const openGoogleSearch = (name: string, loc: string) => {
    const q = encodeURIComponent(`${name} ${loc} phone number`);
    window.open(`https://www.google.com/search?q=${q}`, '_blank');
  };

  const handleSave = (lead: FinderLead) => {
    addLead({ ...lead, status: 'new' });
    setSaved(prev => new Set([...prev, lead.id]));
    showToast(`Saved "${lead.name}" to Leads!`);
  };

  const hasApiKey = !!settings?.apiKeys?.locationIq;

  return (
    <div className="fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 18px', fontSize: 13, zIndex: 9999, boxShadow: 'var(--shadow)', animation: 'slideUp 0.3s ease', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
           <CheckCircle2 size={16} color="var(--green)" /> {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Finder</h1>
          <p className="page-subtitle">Find businesses and save them as leads. Convert them to clients later.</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
              <label className="form-label">Industry</label>
              <select className="form-select" value={industry} onChange={e => setIndustry(e.target.value)}>
                {settings?.industries.map((i: string) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
              <label className="form-label">Town / City Name</label>
              <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Pollachi..." onKeyDown={e => e.key === 'Enter' && searchLeads()} />
            </div>
            <button className="btn btn-primary btn-lg" onClick={searchLeads} disabled={loading || !location.trim()}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Searching...</> : <><Search size={18} /> Find Leads</>}
            </button>
          </div>
        </div>

        {results.length > 0 && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.map(lead => (
              <div key={lead.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', background: saved.has(lead.id) ? 'var(--green-light)' : 'var(--bg-card)' }}>
                <div style={{ width: 48, height: 48, background: 'var(--accent-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  <Building2 size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{lead.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                       <MapPin size={14} style={{ marginTop: 2 }} color="var(--accent)" /> 
                       <span>{lead.location}</span>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                         <Phone size={14} color={lead.phone === 'Not Found' ? 'var(--text-muted)' : 'var(--green)'} /> 
                         <span style={{ fontWeight: lead.phone === 'Not Found' ? 400 : 700 }}>{lead.phone}</span>
                      </span>
                      {lead.phone === 'Not Found' && (
                         <button onClick={() => openGoogleSearch(lead.name, location)} style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 6, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                            <Globe size={10} /> Search Google
                         </button>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                   {!saved.has(lead.id) ? (
                     <button className="btn btn-primary btn-sm" onClick={() => handleSave(lead)}>Save Lead</button>
                   ) : (
                     <span className="badge badge-green"><Check size={12} /> Saved</span>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
             <Loader2 size={32} className="animate-spin" color="var(--accent)" style={{ margin: '0 auto 16px' }} />
             <div style={{ fontSize: 16, fontWeight: 600 }}>Fetching Live Data...</div>
          </div>
        )}
      </div>
    </div>
  );
}

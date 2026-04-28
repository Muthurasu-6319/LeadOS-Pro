'use client';
import { useState, useEffect } from 'react';
import { getSettings, saveSettings, DEFAULT_INDUSTRIES } from '@/lib/store';
import type { AppSettings } from '@/lib/store';
import { 
  Factory, 
  Key, 
  Building2, 
  User, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  X, 
  Eye, 
  EyeOff, 
  Info, 
  ShieldAlert,
  Save,
  ChevronRight,
  MapPin,
  Bot,
  Rocket,
  Target,
  Languages,
  Mail
} from 'lucide-react';

const SETTING_TABS = [
  { id: 'Industries', label: 'Industries', Icon: Factory },
  { id: 'Company',    label: 'Company',    Icon: Building2 },
  { id: 'Regards',    label: 'Email Regards', Icon: Mail },
  { id: 'Account',    label: 'Account',    Icon: User },
] as const;

type SettingTab = typeof SETTING_TABS[number]['id'];

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingTab>('Industries');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [newIndustry, setNewIndustry] = useState('');
  const [toast, setToast] = useState('');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  useEffect(() => { setSettings(getSettings()); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const save = (updated: AppSettings) => {
    saveSettings(updated);
    setSettings(updated);
    showToast('Settings saved successfully');
  };

  const updateSignature = (newSignature: string) => {
    if (!settings) return;
    save({ ...settings, user: { ...settings.user, signature: newSignature } });
  };

  const refreshSignature = () => {
    if (!settings) return;
    const { name, position, company, phone, email } = settings.user;
    const sig = `Best regards,\n\n${name || '[Name]'}\n${position || '[Position]'}\n${company || '[Company]'}\n${phone || '[Phone]'}\n${email || '[Email]'}`;
    updateSignature(sig);
  };

  if (!settings) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 28, height: 28 }} />
    </div>
  );

  return (
    <div className="fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 18px', fontSize: 13, zIndex: 9999, boxShadow: 'var(--shadow)', animation: 'slideUp 0.3s ease', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
           <CheckCircle2 size={16} color="var(--green)" /> {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure industries, email signatures, company info & account details.</p>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', gap: 32 }}>
          {/* Sidebar nav */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div className="card" style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SETTING_TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  width: '100%', padding: '12px 14px', textAlign: 'left', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: tab === t.id ? 700 : 500, fontFamily: 'inherit',
                  background: tab === t.id ? 'var(--accent-light)' : 'transparent',
                  color: tab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                  borderRadius: 8,
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <t.Icon size={16} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>

            {/* ── Industries ─────────────────────────────── */}
            {tab === 'Industries' && (
              <div className="card slide-up">
                <div style={{ marginBottom: 20 }}>
                   <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Industries</h2>
                   <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Manage the list of industries used across Lead Finder, Pain Point analyser, and Email Templates.</p>
                </div>

                {/* Add */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                     <Factory size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                     <input className="form-input" placeholder="Add new industry (e.g. Event Management)" value={newIndustry || ''} onChange={e => setNewIndustry(e.target.value)} style={{ paddingLeft: 34 }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newIndustry.trim() && !settings.industries.includes(newIndustry.trim())) {
                            save({ ...settings, industries: [...settings.industries, newIndustry.trim()] });
                            setNewIndustry('');
                          }
                        }} />
                  </div>
                  <button className="btn btn-primary" onClick={() => {
                    if (!newIndustry.trim() || settings.industries.includes(newIndustry.trim())) return;
                    save({ ...settings, industries: [...settings.industries, newIndustry.trim()] });
                    setNewIndustry('');
                  }}><Plus size={16} /> Add</button>
                </div>

                {/* List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                  {settings.industries.map((ind, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{ind}</span>
                      </div>
                      <button onClick={() => save({ ...settings, industries: settings.industries.filter((_, j) => j !== i) })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)', padding: 4, borderRadius: 6, transition: 'all 0.15s' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Info size={16} color="var(--accent)" /> <span>Industries added here will appear in Lead Finder and Analysis dropdowns.</span>
                </div>
              </div>
            )}


            {/* ── Company ──────────────────────────────────── */}
            {tab === 'Company' && (
              <div className="card slide-up">
                <div style={{ marginBottom: 24 }}>
                   <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Company Branding</h2>
                   <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>These details appear on exported reports and documents.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <div style={{ position: 'relative' }}>
                     <Building2 size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                     <input className="form-input" value={settings.company.name || ''} placeholder="My Agency" onChange={e => save({ ...settings, company: { ...settings.company, name: e.target.value } })} style={{ paddingLeft: 34 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Report ID Prefix</label>
                  <input className="form-input" value={settings.company.prefix || ''} placeholder="LF" maxLength={5} onChange={e => save({ ...settings, company: { ...settings.company, prefix: e.target.value.toUpperCase() } })} />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Example report ID: <strong>{settings.company.prefix || 'LF'}-RPT-001</strong></div>
                </div>

                <div className="divider" style={{ margin: '30px 0' }} />
                
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Report Preview</h3>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, borderStyle: 'dashed' }}>
                  <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{(settings.company.name || 'Company').toUpperCase()} — LEAD REPORT</div>
                  <div>Report ID: {settings.company.prefix || 'LF'}-RPT-{Date.now().toString().slice(-6)}</div>
                  <div>Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  <div style={{ margin: '10px 0', borderBottom: '1px solid var(--border)' }} />
                  <div style={{ fontStyle: 'italic' }}>Detailed analysis results...</div>
                  <div style={{ marginTop: 12 }}>© {new Date().getFullYear()} {settings.company.name || 'Company'}</div>
                </div>
              </div>
            )}

            {/* ── Email Regards ────────────────────────────── */}
            {tab === 'Regards' && (
              <div className="card slide-up">
                <div style={{ marginBottom: 24 }}>
                   <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Email Regards (Signature)</h2>
                   <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Customize how you sign off your automated cold emails.</p>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-input" value={settings.user.name} onChange={e => save({ ...settings, user: { ...settings.user, name: e.target.value } })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Position</label>
                    <input className="form-input" placeholder="e.g. Founder, Manager" value={settings.user.position} onChange={e => save({ ...settings, user: { ...settings.user, position: e.target.value } })} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input className="form-input" value={settings.user.company} onChange={e => save({ ...settings, user: { ...settings.user, company: e.target.value } })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={settings.user.phone} onChange={e => save({ ...settings, user: { ...settings.user, phone: e.target.value } })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input className="form-input" value={settings.user.email} onChange={e => save({ ...settings, user: { ...settings.user, email: e.target.value } })} />
                </div>

                <div className="divider" style={{ margin: '24px 0' }} />

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label className="form-label" style={{ margin: 0 }}>Signature Preview</label>
                    <button className="btn btn-secondary btn-sm" onClick={refreshSignature}>
                      <Rocket size={14} /> Auto-generate from info
                    </button>
                  </div>
                  <textarea 
                    className="form-textarea" 
                    style={{ minHeight: 140, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}
                    value={settings.user.signature}
                    onChange={e => updateSignature(e.target.value)}
                  />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    Tip: You can manually edit the signature block above. This block will be appended to the end of every cold email.
                  </p>
                </div>
              </div>
            )}

            {/* ── Account ──────────────────────────────────── */}
            {tab === 'Account' && (
              <div className="card slide-up">
                <div style={{ marginBottom: 24 }}>
                   <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Account Profile</h2>
                   <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Update your profile name, email, and system role.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30, padding: '20px', background: 'var(--bg-input)', borderRadius: 16, border: '1px solid var(--border)' }}>
                  <div style={{ width: 64, height: 64, background: 'var(--accent)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28, color: '#fff', flexShrink: 0, boxShadow: 'var(--shadow)' }}>
                    {(settings.user.name?.[0] ?? 'A').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>{settings.user.name || 'User'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{settings.user.email || '—'}</div>
                    <div style={{ marginTop: 8 }}>
                       <span className="badge badge-purple" style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                          <ShieldAlert size={10} /> {settings.user.role || 'agent'}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={settings.user.name || ''} onChange={e => save({ ...settings, user: { ...settings.user, name: e.target.value } })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={settings.user.email || ''} onChange={e => save({ ...settings, user: { ...settings.user, email: e.target.value } })} />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 10 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Languages size={14} color="var(--accent)" /> Result Language (Tanglish/Tamil/English)
                  </label>
                  <select className="form-select" value={settings.language || 'English'} onChange={e => save({ ...settings, language: e.target.value as any })}>
                    <option value="English">English</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Tanglish">Tanglish (Tamil + English)</option>
                  </select>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>This affects how Pain Points are generated and displayed.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select className="form-select" value={settings.user.role || 'agent'} onChange={e => save({ ...settings, user: { ...settings.user, role: e.target.value } })}>
                    {['admin', 'manager', 'agent'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>

                <div className="divider" style={{ margin: '30px 0' }} />
                
                <div style={{ padding: '20px', background: 'var(--red-light)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)', marginBottom: 6 }}>
                     <ShieldAlert size={18} />
                     <h3 style={{ fontSize: 15, fontWeight: 700 }}>Danger Zone</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>This will permanently clear all leads, contacts, and settings from this browser's local storage.</p>
                  <button className="btn btn-danger" onClick={() => {
                    if (!confirm('CRITICAL: Clear ALL data? This will remove all leads, contacts, and settings permanently.')) return;
                    ['lf_leads', 'lf_contacts', 'lf_team', 'lf_templates', 'lf_settings', 'lf_saved_pain_points'].forEach(k => localStorage.removeItem(k));
                    window.location.reload();
                  }}>
                    <Trash2 size={16} /> Delete All Data Permanently
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

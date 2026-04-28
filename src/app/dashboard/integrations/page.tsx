'use client';
import { useState, useEffect } from 'react';
import { Rocket, Plus, CheckCircle2, AlertCircle, ExternalLink, X, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { getSettings, saveSettings } from '@/lib/store';
import type { AppSettings } from '@/lib/store';

const INTEGRATION_DEFS = [
  { 
    id: 'locationIq', 
    name: 'Google Places API', 
    description: 'Find businesses by location', 
    icon: '📍',
    help: 'Used for fetching business data from maps. We use LocationIQ as a reliable alternative.',
    placeholder: 'pk.ey...'
  },
  { 
    id: 'apollo', 
    name: 'Apollo.io', 
    description: 'Contact enrichment', 
    icon: '🚀',
    help: 'Used to find decision maker emails and phone numbers.',
    placeholder: 'ap_...'
  },
  { 
    id: 'openai', 
    name: 'Claude / OpenAI API', 
    description: 'AI pain point analysis', 
    icon: '🤖',
    help: 'Powers the AI analysis and automated email generation.',
    placeholder: 'sk-...'
  },
  { 
    id: 'hunter', 
    name: 'Hunter.io', 
    description: 'Email finder', 
    icon: '🎯',
    help: 'Find and verify professional email addresses from domains.',
    placeholder: 'hunter_...'
  },
  { 
    id: 'sendgrid', 
    name: 'Gmail SMTP', 
    description: 'Email delivery via Gmail', 
    icon: '📧',
    help: 'Use your Gmail address and an App Password (not your regular password) to send automated outreach emails.',
    placeholder: '16-character app password'
  },
];

export default function IntegrationsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState('');
  const [tempUser, setTempUser] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleConnect = (id: string) => {
    setEditingId(id);
    setTempKey(settings?.apiKeys[id as keyof typeof settings.apiKeys] || '');
    if (id === 'sendgrid') {
      setTempUser(settings?.apiKeys.gmailUser || '');
    }
    setShowKey(false);
  };

  const handleSave = () => {
    if (!settings || !editingId) return;
    const updated = {
      ...settings,
      apiKeys: {
        ...settings.apiKeys,
        [editingId]: tempKey,
        ...(editingId === 'sendgrid' ? { gmailUser: tempUser } : {})
      }
    };
    saveSettings(updated);
    setSettings(updated);
    setEditingId(null);
    showToast(`${INTEGRATION_DEFS.find(i => i.id === editingId)?.name} connected!`);
  };

  const handleDisconnect = (id: string) => {
    if (!settings || !confirm(`Disconnect ${INTEGRATION_DEFS.find(i => i.id === id)?.name}?`)) return;
    const updated = {
      ...settings,
      apiKeys: {
        ...settings.apiKeys,
        [id]: ''
      }
    };
    saveSettings(updated);
    setSettings(updated);
    showToast('Disconnected');
  };

  if (!settings) return null;

  return (
    <div className="fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 18px', fontSize: 13, zIndex: 9999, boxShadow: 'var(--shadow)', animation: 'slideUp 0.3s ease', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
           <CheckCircle2 size={16} color="var(--green)" /> {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Manage your API connections and power your lead engine.</p>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gap: 16, maxWidth: 800 }}>
          {INTEGRATION_DEFS.map((int) => {
            const isConnected = !!settings.apiKeys[int.id as keyof typeof settings.apiKeys];
            return (
              <div key={int.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, background: 'var(--bg-primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {int.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{int.name}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{int.description}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${isConnected ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: 12, padding: '4px 12px' }}>
                    {isConnected ? 'Connected' : 'Not connected'}
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleConnect(int.id)}>
                    {isConnected ? 'Configure' : 'Connect'}
                  </button>
                  {isConnected && (
                    <button className="btn btn-icon btn-danger" style={{ padding: 6 }} onClick={() => handleDisconnect(int.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, padding: 24, background: '#f8fafc', borderRadius: 16, border: '1px dashed #cbd5e1', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            Looking for more integrations? <a href="#" style={{ color: 'var(--accent)', fontWeight: 600 }}>Request a feature</a>
          </p>
        </div>
      </div>

      {/* API Key Modal */}
      {editingId && (
        <div className="modal-overlay" onClick={() => setEditingId(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Configure {INTEGRATION_DEFS.find(i => i.id === editingId)?.name}</h2>
              <button className="modal-close" onClick={() => setEditingId(null)}><X size={18} /></button>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {INTEGRATION_DEFS.find(i => i.id === editingId)?.help}
              </p>
            </div>

            {editingId === 'sendgrid' && (
              <div className="form-group">
                <label className="form-label">Gmail Address (Username)</label>
                <input 
                  className="form-input" 
                  placeholder="yourname@gmail.com"
                  value={tempUser}
                  onChange={e => setTempUser(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{editingId === 'sendgrid' ? 'App Password' : 'API Key / Access Token'}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-input" 
                  type={showKey ? 'text' : 'password'}
                  placeholder={INTEGRATION_DEFS.find(i => i.id === editingId)?.placeholder}
                  value={tempKey}
                  onChange={e => setTempKey(e.target.value)}
                  style={{ paddingRight: 40, fontFamily: showKey ? 'monospace' : 'inherit' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowKey(!showKey)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={16} /> Save Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

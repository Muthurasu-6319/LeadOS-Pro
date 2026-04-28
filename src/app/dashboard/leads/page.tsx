'use client';
import { useState, useEffect } from 'react';
import { wrapInHtmlTemplate } from '@/lib/email-template';
import { getLeads, updateLead, deleteLead, convertLeadToClient, fmtDate, getSettings, getTemplates } from '@/lib/store';
import type { Lead, AppSettings } from '@/lib/store';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Filter, 
  Download,
  Save,
  Factory,
  UserPlus,
  Clock,
  MoreHorizontal,
  Target
} from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showToastMsg, setShowToastMsg] = useState('');

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSending, setIsSending] = useState<string | null>(null);

  useEffect(() => { 
    setLeads(getLeads());
    setSettings(getSettings());
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

  const showToast = (msg: string) => { setShowToastMsg(msg); setTimeout(() => setShowToastMsg(''), 3000); };

  const handleSaveEdit = () => {
    if (!editingLead) return;
    updateLead(editingLead.id, editingLead);
    setLeads(getLeads());
    setEditingLead(null);
    showToast('Lead updated successfully');
  };

  const handleSendEmail = async (lead: Lead) => {
    if (!lead.email) {
      alert('Please add an email address first.');
      setEditingLead(lead);
      return;
    }

    const appPass = settings?.apiKeys.sendgrid;
    const userEmail = settings?.apiKeys.gmailUser || settings?.user.email;

    if (!appPass || !userEmail) {
      alert('Please configure your Gmail Address and App Password in the Integrations page.');
      return;
    }

    // Load templates and find match
    const templates = getTemplates();
    const industryTemplate = templates.find(t => t.industry === lead.industry);
    
    let subject = `How we can help ${lead.name} grow`;
    let body = `Hi ${lead.name},\n\nWe noticed your business in ${lead.location}. We specialize in solving common challenges in the ${lead.industry} industry, including process automation, digital growth, and operational efficiency.\n\nWe have helped many businesses like yours overcome these hurdles, and we'd love to show you how we can do the same for you.\n\n${settings?.user.signature || `Best regards,\n${settings?.user.name}`}`;

    if (industryTemplate) {
      subject = industryTemplate.subject || '';
      body = industryTemplate.body || '';
      
      // Replace placeholders
      const replacements: Record<string, string> = {
        '\\[Name\\]': lead.name || '',
        '\\[Company\\]': lead.name || '',
        '\\[City\\]': lead.location || '',
        '\\[Industry\\]': lead.industry || '',
        '\\[Address\\]': lead.address || lead.location || '',
        // User/Sender related placeholders
        '\\[Your Name\\]': settings?.user.name || '',
        '\\[Your Position\\]': settings?.user.position || '',
        '\\[Your Company\\]': settings?.user.company || '',
        '\\[Your Phone Number\\]': settings?.user.phone || '',
        '\\[Your Contact Information\\]': `${settings?.user.phone || ''} / ${settings?.user.email || ''}`,
        '\\[Your Email\\]': settings?.user.email || '',
      };
      
      Object.keys(replacements).forEach(key => {
        const regex = new RegExp(key, 'g');
        subject = subject.replace(regex, replacements[key] || '');
        body = body.replace(regex, replacements[key] || '');
      });

      // Append signature ONLY if the body doesn't already contain the user's name
      // and it doesn't already look like it has a "Best regards" or similar sign-off
      const hasSignOff = body.toLowerCase().includes('best regards') || 
                         body.toLowerCase().includes('sincerely') || 
                         body.toLowerCase().includes('thanks,') ||
                         body.includes(settings?.user.name || '___');

      if (settings?.user.signature && !hasSignOff) {
        body += `\n\n${settings.user.signature}`;
      }
    }

    const htmlContent = wrapInHtmlTemplate(
      body, 
      settings?.company.name || 'Our Company', 
      settings?.company.logo,
      '' // Signature is already in the body logic above
    );

    setIsSending(lead.id);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: lead.email,
          subject: subject,
          text: body,
          html: htmlContent, // Send as HTML
          attachments: industryTemplate?.attachments || [],
          fromName: settings?.company.name || settings?.user.name, // Use company name as sender
          auth: {
            user: userEmail,
            pass: appPass
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        updateLead(lead.id, { status: 'waiting' });
        setLeads(getLeads());
        showToast(`Email sent successfully to ${lead.name}!`);
      } else {
        alert('Failed to send email: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while sending the email.');
    } finally {
      setIsSending(null);
    }
  };

  const handleSimulateReply = (lead: Lead) => {
    updateLead(lead.id, { status: 'contacted' });
    setLeads(getLeads());
    showToast(`${lead.name} replied to your email!`);
  };

  const handleConvertToClient = (lead: Lead) => {
    if (!confirm(`Convert ${lead.name} to a client?`)) return;
    convertLeadToClient(lead);
    setLeads(getLeads());
    showToast(`${lead.name} is now a client!`);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    deleteLead(id);
    setLeads(getLeads());
  };

  const [filter, setFilter] = useState('All');

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.industry.toLowerCase().includes(search.toLowerCase());
    if (filter === 'All') return matchesSearch;
    if (filter === 'Not contacted') return matchesSearch && l.status === 'new';
    if (filter === 'Email sent') return matchesSearch && l.status === 'waiting';
    if (filter === 'Replied') return matchesSearch && l.status === 'contacted';
    return matchesSearch;
  });

  const getCount = (status: string) => {
    if (status === 'All') return leads.length;
    if (status === 'Not contacted') return leads.filter(l => l.status === 'new').length;
    if (status === 'Email sent') return leads.filter(l => l.status === 'waiting').length;
    if (status === 'Replied') return leads.filter(l => l.status === 'contacted').length;
    return 0;
  };

  return (
    <div className="fade-in">
      {showToastMsg && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 18px', fontSize: 13, zIndex: 9999, boxShadow: 'var(--shadow)', animation: 'slideUp 0.3s ease', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
           <CheckCircle2 size={16} color="var(--green)" /> {showToastMsg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">My leads</h1>
          <p className="page-subtitle">All leads with status tracking</p>
        </div>
        <button className="btn btn-secondary">Export CSV</button>
      </div>

      <div className="page-body">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {['All', 'Not contacted', 'Email sent', 'Replied'].map((t) => (
            <button 
              key={t} 
              onClick={() => setFilter(t)}
              className={`btn ${filter === t ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 99, padding: '6px 16px', fontSize: 13 }}
            >
              {t} ({getCount(t)})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: 24, padding: '12px 20px' }}>
          <div className="search-bar" style={{ maxWidth: '100%' }}>
            <span className="search-icon"><Search size={14} /></span>
            <input placeholder="Search leads..." value={search} onChange={handleSearch} />
          </div>
        </div>

        {/* Lead Cards */}
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 44, height: 44, background: 'var(--bg-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{lead.name}</h3>
                    <button onClick={() => setEditingLead(lead)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <Edit3 size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                    {lead.email || <span style={{ color: 'var(--red)', fontStyle: 'italic' }}>no email</span>} · {lead.phone || 'no phone'}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} /> {lead.address || lead.location}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <span className={`badge ${lead.status === 'new' ? 'badge-yellow' : lead.status === 'waiting' ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: 11 }}>
                      {lead.status === 'new' ? 'Not contacted' : lead.status === 'waiting' ? 'Email sent' : 'Replied'}
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: 11 }}>{lead.industry}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                {/* Send Email / Follow up (Always available) */}
                <button 
                  className="btn btn-primary" 
                  style={{ minWidth: 110, justifyContent: 'center', background: lead.status === 'new' ? 'var(--accent)' : 'var(--bg-card-hover)', color: lead.status === 'new' ? '#fff' : 'var(--text-primary)', border: lead.status === 'new' ? 'none' : '1px solid var(--border)' }} 
                  onClick={() => handleSendEmail(lead)}
                  disabled={isSending === lead.id}
                >
                  {isSending === lead.id ? 'Sending...' : (lead.status === 'new' ? 'Send email' : 'Follow up')}
                </button>
                
                {lead.status === 'waiting' && (
                  <button className="btn btn-success" style={{ minWidth: 110, justifyContent: 'center' }} onClick={() => handleSimulateReply(lead)}>
                    Simulate Reply
                  </button>
                )}

                {lead.status === 'contacted' && (
                  <button className="btn btn-primary" style={{ minWidth: 120, justifyContent: 'center', background: 'var(--purple)', border: 'none' }} onClick={() => handleConvertToClient(lead)}>
                    <UserPlus size={14} /> Convert Client
                  </button>
                )}

                <button className="btn btn-icon btn-secondary" style={{ border: '1px solid var(--border)' }} onClick={() => handleDelete(lead.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredLeads.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon"><Target size={48} /></div>
              <div className="empty-title">No leads found</div>
              <div className="empty-subtitle">Try adjusting your filters or search terms.</div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingLead && (
        <div className="modal-overlay" onClick={() => setEditingLead(null)}>
          <div className="modal" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Lead Details</h2>
              <button className="modal-close" onClick={() => setEditingLead(null)}><X size={18} /></button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input className="form-input" value={editingLead.name} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Email ID</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: 34 }}
                  value={editingLead.email || ''} 
                  onChange={e => setEditingLead({...editingLead, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: 34 }}
                  value={editingLead.phone || ''} 
                  onChange={e => setEditingLead({...editingLead, phone: e.target.value})}
                  placeholder="+91 00000 00000"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <textarea 
                  className="form-textarea" 
                  style={{ paddingLeft: 34, minHeight: 60 }}
                  value={editingLead.address || editingLead.location || ''} 
                  onChange={e => setEditingLead({...editingLead, address: e.target.value})}
                  placeholder="Business address..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setEditingLead(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircle2({ size, color }: { size: number, color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
}

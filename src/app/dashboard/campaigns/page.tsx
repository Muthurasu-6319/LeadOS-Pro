'use client';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Mail, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Users, 
  Send, 
  X, 
  Target,
  ChevronRight,
  Zap,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { 
  getCampaigns, 
  saveCampaigns, 
  getLeads, 
  updateLead, 
  getSettings, 
  getTemplates, 
  uid, 
  now, 
  fmtDate 
} from '@/lib/store';
import type { Campaign, Lead, AppSettings } from '@/lib/store';
import { wrapInHtmlTemplate } from '@/lib/email-template';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    setCampaigns(getCampaigns());
    const allLeads = getLeads();
    setLeads(allLeads);
    setSettings(getSettings());
    
    // Check for any automated follow-ups needed
    processAutomatedFollowUps(allLeads);
  }, []);

  const processAutomatedFollowUps = async (allLeads: Lead[]) => {
    const s = getSettings();
    const campaigns = getCampaigns();
    const activeCampaigns = campaigns.filter(c => c.status === 'active' && c.autoFollowUp);
    
    const appPass = s?.apiKeys.sendgrid;
    const userEmail = s?.apiKeys.gmailUser || s?.user.email;
    if (!appPass || !userEmail) return;

    for (const campaign of activeCampaigns) {
      const template = getTemplates().find(t => t.industry === campaign.industry);
      if (!template) continue;

      const leadsToFollowUp = allLeads.filter(l => 
        campaign.leads.includes(l.id) && 
        l.status === 'waiting' && 
        l.lastSentAt && 
        (new Date().getTime() - new Date(l.lastSentAt).getTime()) > (campaign.followUpDelayDays * 24 * 60 * 60 * 1000)
      );

      for (const lead of leadsToFollowUp) {
        // Send follow-up email
        await sendEmail(lead, template, s);
        updateLead(lead.id, { 
          lastSentAt: now(), 
          followUpCount: (lead.followUpCount || 0) + 1 
        });
      }
    }
  };

  const sendEmail = async (lead: Lead, template: any, s: AppSettings) => {
    const appPass = s?.apiKeys.sendgrid;
    const userEmail = s?.apiKeys.gmailUser || s?.user.email;
    
    let subject = `Follow up: ${template.subject}`;
    let body = `Hi ${lead.name},\n\nJust wanted to follow up on my previous email. Did you have a chance to look at it?\n\nBest,\n${s.user.name}`;

    const htmlContent = wrapInHtmlTemplate(body, s.company.name, s.company.logo, '');

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: lead.email,
        subject,
        text: body,
        html: htmlContent,
        fromName: s.company.name || s.user.name,
        auth: { user: userEmail, pass: appPass }
      })
    });
  };

  const stats = {
    totalSent: campaigns.reduce((acc, c) => acc + c.sentCount, 0),
    totalReplies: campaigns.reduce((acc, c) => acc + (c.replyCount || 0), 0),
    activeCampaigns: campaigns.filter(c => c.status === 'active').length
  };

  const availableLeadsForIndustry = leads.filter(l => l.industry === selectedIndustry && l.status === 'new');

  const toggleLead = (id: string) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedLeadIds.length === availableLeadsForIndustry.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(availableLeadsForIndustry.map(l => l.id));
    }
  };

  const handleLaunchCampaign = async () => {
    if (!selectedIndustry || !campaignName || selectedLeadIds.length === 0) {
      alert('Please fill in all fields and select at least one lead');
      return;
    }

    const template = getTemplates().find(t => t.industry === selectedIndustry);
    if (!template) {
      alert(`No template for ${selectedIndustry}`);
      return;
    }

    const appPass = settings?.apiKeys.sendgrid;
    const userEmail = settings?.apiKeys.gmailUser || settings?.user.email;

    setIsLaunching(true);
    let sentSuccess = 0;

    try {
      const leadsToContact = leads.filter(l => selectedLeadIds.includes(l.id));
      
      for (const lead of leadsToContact) {
        let subject = template.subject;
        let body = template.body;

        const htmlContent = wrapInHtmlTemplate(body, settings?.company.name || '', settings?.company.logo, '');

        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: lead.email,
            subject,
            text: body,
            html: htmlContent,
            fromName: settings?.company.name || settings?.user.name,
            auth: { user: userEmail, pass: appPass }
          })
        });

        if (res.ok) {
          updateLead(lead.id, { status: 'waiting', lastSentAt: now(), followUpCount: 0 });
          sentSuccess++;
        }
      }

      const newCampaign: Campaign = {
        id: uid(),
        name: campaignName,
        industry: selectedIndustry,
        leads: selectedLeadIds,
        sentCount: sentSuccess,
        replyCount: 0,
        status: autoFollowUp ? 'active' : 'completed',
        autoFollowUp,
        followUpDelayDays: 3,
        createdAt: now()
      };

      const updated = [newCampaign, ...campaigns];
      saveCampaigns(updated);
      setCampaigns(updated);
      setLeads(getLeads());
      setShowNewModal(false);
      alert('Campaign launched!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Email campaigns</h1>
          <p className="page-subtitle">Track performance and manage bulk outreach</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowNewModal(true); setSelectedLeadIds([]); }}>
          <Plus size={16} /> New campaign
        </button>
      </div>

      <div className="page-body">
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} color="#2563eb" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Total Sent</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.totalSent}</div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={16} color="#16a34a" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Replies</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.totalReplies}</div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: '#fef2f2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#dc2626" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Conv. Rate</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
              {stats.totalSent > 0 ? Math.round((stats.totalReplies / stats.totalSent) * 100) : 0}%
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: '#faf5ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="#7c3aed" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Active</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.activeCampaigns}</div>
          </div>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Recent Campaigns</h2>
        
        <div style={{ display: 'grid', gap: 16 }}>
          {campaigns.map((c) => (
            <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, background: 'var(--bg-primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color="var(--accent)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{c.name}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {c.industry} · {c.leads.length} leads · {fmtDate(c.createdAt)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>Sent</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{c.sentCount}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>Replies</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{c.replyCount || 0}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>Status</div>
                  <span className={`badge ${c.status === 'completed' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: 10, padding: '2px 10px' }}>
                    {c.status === 'active' ? 'Running' : 'Completed'}
                  </span>
                </div>
                <button className="btn btn-secondary btn-icon" style={{ padding: 8 }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}

          {campaigns.length === 0 && (
            <div className="empty-state" style={{ background: 'var(--bg-card)', padding: '60px 40px' }}>
              <div className="empty-icon" style={{ background: '#f8fafc', color: '#cbd5e1' }}><Send size={48} /></div>
              <div className="empty-title">No campaigns launched yet</div>
              <div className="empty-subtitle">Start your first automated outreach campaign to see performance data here.</div>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowNewModal(true)}>Create Campaign</button>
            </div>
          )}
        </div>
      </div>

      {/* New Campaign Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" style={{ maxWidth: 550, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Targeted Campaign</h2>
              <button className="modal-close" onClick={() => setShowNewModal(false)}><X size={18} /></button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Campaign Name</label>
              <input 
                className="form-input" 
                placeholder="e.g. Q2 Outreach - Hotel Industry" 
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Industry</label>
              <select 
                className="form-input" 
                value={selectedIndustry}
                onChange={e => { setSelectedIndustry(e.target.value); setSelectedLeadIds([]); }}
              >
                <option value="">Choose Industry...</option>
                {Array.from(new Set(leads.filter(l => l.status === 'new').map(l => l.industry))).map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {selectedIndustry && (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Select Leads to Include ({selectedLeadIds.length})</label>
                  <button onClick={selectAll} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {selectedLeadIds.length === availableLeadsForIndustry.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 12, padding: 8 }}>
                  {availableLeadsForIndustry.map(l => (
                    <div 
                      key={l.id} 
                      onClick={() => toggleLead(l.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                        background: selectedLeadIds.includes(l.id) ? 'var(--bg-primary)' : 'transparent',
                        marginBottom: 4
                      }}
                    >
                      <div style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedLeadIds.includes(l.id) ? 'var(--accent)' : 'transparent' }}>
                        {selectedLeadIds.includes(l.id) && <CheckCircle2 size={12} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{l.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} color="#2563eb" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Smart Follow-up</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Auto-resend if no reply in 3 days</div>
                  </div>
                </div>
                <button 
                  onClick={() => setAutoFollowUp(!autoFollowUp)}
                  style={{ 
                    width: 48, height: 24, borderRadius: 12, background: autoFollowUp ? 'var(--accent)' : '#cbd5e1', 
                    position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                  }}
                >
                  <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: autoFollowUp ? 26 : 4, transition: 'all 0.3s' }} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                disabled={isLaunching || selectedLeadIds.length === 0}
                onClick={handleLaunchCampaign}
              >
                {isLaunching ? 'Launching...' : <><Zap size={16} /> Start Campaign</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

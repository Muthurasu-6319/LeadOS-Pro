'use client';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  UserPlus,
  MessageSquare,
  X,
  CreditCard,
  PieChart
} from 'lucide-react';
import { 
  getDeals, 
  addDeal, 
  updateDeal, 
  getClients, 
  getLeads, 
  getTeam,
  uid, 
  now, 
  fmtDate 
} from '@/lib/store';
import type { Deal, Client, Lead, TeamMember } from '@/lib/store';

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<(Client | Lead)[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    clientId: '',
    emailsSent: 0,
    hasReplied: false,
    status: 'negotiating' as Deal['status'],
    budget: 0,
    revenue: 0,
    paidAmount: 0,
    referredBy: '',
    notes: ''
  });

  useEffect(() => {
    setDeals(getDeals());
    const allPossibleClients = [...getClients(), ...getLeads().filter(l => l.status !== 'new')];
    setClients(allPossibleClients);
    setTeam(getTeam());
  }, []);

  const totalRevenue = deals.reduce((acc, d) => acc + (Number(d.revenue) || 0), 0);
  const totalPaid = deals.reduce((acc, d) => acc + (Number(d.paidAmount) || 0), 0);
  const totalPending = deals.reduce((acc, d) => acc + (Number(d.revenue) - Number(d.paidAmount) || 0), 0);

  const handleSaveDeal = () => {
    if (!formData.clientId) {
      alert('Please select a client');
      return;
    }

    const selectedClient = clients.find(c => c.id === formData.clientId);
    
    const newDeal: Deal = {
      id: uid(),
      clientId: formData.clientId,
      clientName: selectedClient?.name || 'Unknown',
      emailsSent: Number(formData.emailsSent),
      hasReplied: formData.hasReplied,
      status: formData.status,
      budget: Number(formData.budget),
      revenue: Number(formData.revenue),
      paidAmount: Number(formData.paidAmount),
      pendingAmount: Number(formData.revenue) - Number(formData.paidAmount),
      referredBy: formData.referredBy,
      notes: formData.notes,
      createdAt: now(),
      updatedAt: now()
    };

    addDeal(newDeal);
    setDeals(getDeals());
    setShowModal(false);
    setFormData({
      clientId: '', emailsSent: 0, hasReplied: false, status: 'negotiating',
      budget: 0, revenue: 0, paidAmount: 0, referredBy: '', notes: ''
    });
  };

  const filteredDeals = deals.filter(d => 
    d.clientName.toLowerCase().includes(search.toLowerCase()) || 
    d.referredBy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Sales Pipeline & Finance</h1>
          <p className="page-subtitle">Manage deals, track revenue, and monitor payments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Deal
        </button>
      </div>

      <div className="page-body">
        {/* Financial Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', border: 'none' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Total Pipeline Revenue</div>
            <div style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.9)', fontSize: 11 }}>
              <TrendingUp size={12} /> Target: ₹1,00,000
            </div>
          </div>
          <div className="card" style={{ padding: 24, background: '#fff' }}>
            <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Total Paid</div>
            <div style={{ color: '#10b981', fontSize: 28, fontWeight: 800 }}>₹{totalPaid.toLocaleString('en-IN')}</div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 11 }}>
              <CheckCircle2 size={12} color="#10b981" /> {Math.round((totalPaid / totalRevenue) * 100 || 0)}% collected
            </div>
          </div>
          <div className="card" style={{ padding: 24, background: '#fff' }}>
            <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Total Pending</div>
            <div style={{ color: '#f59e0b', fontSize: 28, fontWeight: 800 }}>₹{totalPending.toLocaleString('en-IN')}</div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 11 }}>
              <AlertCircle size={12} color="#f59e0b" /> Follow up required
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              className="form-input" 
              placeholder="Search by client or referrer..." 
              style={{ paddingLeft: 44, margin: 0 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary"><Filter size={16} /> Filters</button>
        </div>

        {/* Deals Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Outreach</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Financials</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Referrer</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map(deal => (
                <tr key={deal.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{deal.clientName}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>ID: {deal.id.slice(0, 8)}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>EMAILS</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{deal.emailsSent}</div>
                      </div>
                      <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />
                      <div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>REPLY</div>
                        {deal.hasReplied ? 
                          <span style={{ color: '#10b981', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}><CheckCircle2 size={12} /> Yes</span> :
                          <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}><Clock size={12} /> Waiting</span>
                        }
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>REVENUE</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>₹{deal.revenue.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>PAID</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>₹{deal.paidAmount.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>PENDING</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>₹{deal.pendingAmount.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={12} color="#64748b" />
                      </div>
                      <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{deal.referredBy || 'Organic'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span className={`badge ${
                      deal.status === 'confirmed' ? 'badge-green' : 
                      deal.status === 'negotiating' ? 'badge-blue' : 'badge-yellow'
                    }`} style={{ textTransform: 'capitalize' }}>
                      {deal.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-icon" style={{ padding: 8 }}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {deals.length === 0 && (
            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <PieChart size={32} color="#cbd5e1" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>No deals found</h3>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Add your first deal to start tracking revenue and outreach.</p>
              <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => setShowModal(true)}>
                <Plus size={16} /> Create First Deal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Deal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Track New Deal</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Select Client</label>
                <select 
                  className="form-input"
                  value={formData.clientId}
                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                >
                  <option value="">Choose from database...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Emails Sent</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.emailsSent}
                  onChange={e => setFormData({...formData, emailsSent: Number(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deal Status</label>
                <select 
                  className="form-input"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="negotiating">Negotiating</option>
                  <option value="confirmed">Confirmed / Closed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <MessageSquare size={16} color="#2563eb" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Has the client replied?</span>
                  <button 
                    onClick={() => setFormData({...formData, hasReplied: !formData.hasReplied})}
                    style={{ 
                      marginLeft: 'auto', width: 44, height: 22, borderRadius: 11, background: formData.hasReplied ? '#10b981' : '#cbd5e1', 
                      position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: formData.hasReplied ? 25 : 3, transition: 'all 0.3s' }} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Client Budget (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Max budget"
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Revenue (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Total project value"
                  value={formData.revenue}
                  onChange={e => setFormData({...formData, revenue: Number(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount Paid (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Already paid"
                  value={formData.paidAmount}
                  onChange={e => setFormData({...formData, paidAmount: Number(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Referred By</label>
                <select 
                  className="form-input"
                  value={formData.referredBy}
                  onChange={e => setFormData({...formData, referredBy: e.target.value})}
                >
                  <option value="">Select Team Member...</option>
                  {team.map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.role})</option>
                  ))}
                  <option value="Organic">Organic / Direct</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveDeal}>Save Deal Intelligence</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

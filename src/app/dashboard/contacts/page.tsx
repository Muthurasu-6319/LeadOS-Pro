'use client';
import { useState, useEffect } from 'react';
import { getContacts, updateContact, deleteContact, addContact, uid, now, fmtDate, DEFAULT_INDUSTRIES } from '@/lib/store';
import type { Contact } from '@/lib/store';
import { 
  Users, 
  Search, 
  UserPlus, 
  Trash2, 
  X, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Factory
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { cls: string; Icon: any; label: string }> = {
  active:    { cls: 'badge-green',  Icon: CheckCircle2, label: 'Active' },
  contacted: { cls: 'badge-purple', Icon: Clock,        label: 'Contacted' },
  closed:    { cls: 'badge-red',    Icon: X,            label: 'Closed' }
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', role: '', industry: DEFAULT_INDUSTRIES[0], notes: '' });
  const [toast, setToast] = useState('');

  const load = () => setContacts(getContacts());
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const filtered = contacts.filter(c => {
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    addContact({ ...form, id: uid(), status: 'active', createdAt: now() });
    setShowModal(false);
    setForm({ name: '', company: '', email: '', phone: '', role: '', industry: DEFAULT_INDUSTRIES[0], notes: '' });
    load();
    showToast('Contact added successfully');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this contact?')) return;
    deleteContact(id);
    setSelected(null);
    load();
    showToast('Contact deleted');
  };

  const handleStatusChange = (id: string, status: Contact['status']) => {
    updateContact(id, { status });
    load();
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  return (
    <div className="fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 18px', fontSize: 13, zIndex: 9999, boxShadow: 'var(--shadow)', animation: 'slideUp 0.3s ease', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
           <CheckCircle2 size={16} color="var(--green)" /> {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">All decision makers & business contacts saved from leads.</p>
        </div>
        <button id="add-contact-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Contact
        </button>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="tabs" style={{ margin: 0, border: 'none' }}>
            {['all', 'active', 'contacted', 'closed'].map(s => (
              <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>
          <div className="search-bar" style={{ marginLeft: 'auto' }}>
            <span className="search-icon"><Search size={14} /></span>
            <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Users size={48} color="var(--border-light)" /></div>
            <div className="empty-title">No contacts yet</div>
            <div className="empty-subtitle">Save leads from the Lead Finder, or add contacts manually.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 20 }}>
            <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Industry</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => {
                      const cfg = STATUS_CONFIG[c.status];
                      return (
                        <tr key={c.id} onClick={() => setSelected(c)} style={{ cursor: 'pointer', background: selected?.id === c.id ? 'var(--bg-card-hover)' : undefined }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, background: 'var(--accent-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--accent)', flexShrink: 0 }}>
                                {c.name[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{c.company}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{c.role || '—'}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{c.industry}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{c.phone}</td>
                          <td>
                            <span className={`badge ${cfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                              <cfg.Icon size={10} /> {cfg.label}
                            </span>
                          </td>
                          <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
                            <button className="btn btn-danger btn-icon" onClick={() => handleDelete(c.id)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="card slide-up" style={{ width: 300, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 20, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Contact Details</h3>
                  <button className="modal-close" onClick={() => setSelected(null)}><X size={16} /></button>
                </div>
                
                <div style={{ width: 56, height: 56, background: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: '#fff', margin: '0 auto 16px', boxShadow: 'var(--shadow)' }}>
                  {selected.name[0]?.toUpperCase()}
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{selected.role} @ {selected.company}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                    <span className={`badge ${STATUS_CONFIG[selected.status].cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {(() => { const Icon = STATUS_CONFIG[selected.status].Icon; return <Icon size={10} /> })()} {STATUS_CONFIG[selected.status].label}
                    </span>
                  </div>
                </div>
                
                <div className="divider" style={{ margin: '20px 0' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: Mail, label: 'Email', val: selected.email },
                    { icon: Phone, label: 'Phone', val: selected.phone },
                    { icon: Building2, label: 'Company', val: selected.company },
                    { icon: Briefcase, label: 'Role', val: selected.role },
                    { icon: Factory, label: 'Industry', val: selected.industry },
                    { icon: Calendar, label: 'Added', val: fmtDate(selected.createdAt) },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <item.icon size={14} /> {item.label}
                      </span>
                      <span style={{ fontWeight: 500, color: 'var(--text-secondary)', maxWidth: 160, textAlign: 'right', wordBreak: 'break-all' }}>
                        {item.val || '—'}
                      </span>
                    </div>
                  ))}
                </div>
                
                {selected.notes && (
                  <div style={{ marginTop: 20, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={12} /> Notes
                    </div>
                    {selected.notes}
                  </div>
                )}
                
                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Update Status</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {(['active', 'contacted', 'closed'] as Contact['status'][]).map(s => (
                      <button key={s} className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center', textTransform: 'capitalize', padding: '6px 4px' }} onClick={() => handleStatusChange(selected.id, s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => handleDelete(selected.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={20} color="var(--accent)" /> Add New Contact
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Ravi Kumar" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-input" placeholder="ABC Hotels" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="ravi@hotel.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Role / Designation</label>
                <input className="form-input" placeholder="Owner / Manager" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select className="form-select" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
                  {DEFAULT_INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Any notes about this contact..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ minHeight: 70 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="save-contact-btn" className="btn btn-primary" onClick={handleAdd}>Save Contact</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

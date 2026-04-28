'use client';
import { useState, useEffect } from 'react';
import { getTeam, saveTeam, uid, now, fmtDate } from '@/lib/store';
import type { TeamMember } from '@/lib/store';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  X, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle,
  MoreVertical,
  Plus,
  Key,
  UserCheck,
  UserCog,
  AlertCircle
} from 'lucide-react';

const ROLES: TeamMember['role'][] = ['admin', 'manager', 'agent'];
const ALL_PERMISSIONS = ['View Leads', 'Edit Leads', 'Delete Leads', 'View Contacts', 'Edit Contacts', 'Send Emails', 'View Reports', 'Manage Team', 'Settings'];
const ROLE_CONFIG: Record<string, { cls: string; Icon: any }> = { 
  admin:   { cls: 'badge-purple', Icon: Shield }, 
  manager: { cls: 'badge-blue',   Icon: UserCog }, 
  agent:   { cls: 'badge-cyan',   Icon: UserCheck } 
};

const DEFAULT_PERMS: Record<TeamMember['role'], string[]> = {
  admin: ALL_PERMISSIONS,
  manager: ['View Leads', 'Edit Leads', 'View Contacts', 'Edit Contacts', 'Send Emails', 'View Reports'],
  agent: ['View Leads', 'View Contacts', 'Send Emails'],
};

export default function TeamsPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'agent' as TeamMember['role'], permissions: DEFAULT_PERMS.agent });

  const load = () => setTeam(getTeam());
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const member: TeamMember = {
      id: uid(), ...form, status: 'active', joinedAt: now(),
    };
    const all = [...team, member];
    saveTeam(all);
    setTeam(all);
    setShowModal(false);
    setForm({ name: '', email: '', phone: '', role: 'agent', permissions: DEFAULT_PERMS.agent });
    showToast('Team member added successfully');
  };

  const handleToggleStatus = (id: string) => {
    const all = team.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' as TeamMember['status'] } : m);
    saveTeam(all);
    setTeam(all);
  };

  const handleDelete = (id: string) => {
    if (team.length === 1) { showToast('Cannot delete the last team member'); return; }
    if (!confirm('Remove this team member?')) return;
    const all = team.filter(m => m.id !== id);
    saveTeam(all);
    setTeam(all);
    if (selected?.id === id) setSelected(null);
    showToast('Member removed');
  };

  const roleCount = (r: string) => team.filter(m => m.role === r).length;

  return (
    <div className="fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 18px', fontSize: 13, zIndex: 9999, boxShadow: 'var(--shadow)', animation: 'slideUp 0.3s ease', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
           <CheckCircle2 size={16} color="var(--green)" /> {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Add team members, assign roles & permissions.</p>
        </div>
        <button id="add-member-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="page-body">
        {/* Role stats */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Members', value: team.length, Icon: Users, color: 'var(--accent)', bg: 'var(--accent-light)' },
            { label: 'Admins', value: roleCount('admin'), Icon: Shield, color: 'var(--accent)', bg: 'var(--accent-light)' },
            { label: 'Managers', value: roleCount('manager'), Icon: UserCog, color: 'var(--blue)', bg: 'var(--blue-light)' },
            { label: 'Agents', value: roleCount('agent'), Icon: UserCheck, color: 'var(--cyan)', bg: 'var(--cyan-light)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--accent-color': s.color, '--icon-bg': s.bg, '--icon-color': s.color } as any}>
              <div className="stat-icon"><s.Icon size={19} /></div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Team grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {team.map(member => {
            const cfg = ROLE_CONFIG[member.role];
            return (
              <div key={member.id} className="card" style={{ borderColor: selected?.id === member.id ? 'var(--accent)' : 'var(--border)', cursor: 'pointer', opacity: member.status === 'inactive' ? 0.7 : 1, position: 'relative' }} onClick={() => setSelected(member)}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, background: 'var(--accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: '#fff', flexShrink: 0, boxShadow: 'var(--shadow)' }}>
                    {member.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.email}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className={`badge ${cfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                       <cfg.Icon size={10} /> {member.role}
                    </span>
                    <span className={`badge ${member.status === 'active' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                       {member.status === 'active' ? <PlayCircle size={10} /> : <PauseCircle size={10} />} {member.status}
                    </span>
                  </div>
                </div>

                <div className="divider" style={{ margin: '0 0 16px' }} />

                {/* Info */}
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} color="var(--text-muted)" /> {member.phone || '—'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={14} color="var(--text-muted)" /> Joined {fmtDate(member.joinedAt)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Key size={14} color="var(--text-muted)" /> {member.permissions.length} permissions</div>
                </div>

                {/* Permissions Preview */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {member.permissions.slice(0, 3).map(p => (
                    <span key={p} style={{ fontSize: 10.5, padding: '4px 10px', background: 'var(--bg-input)', borderRadius: 99, color: 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: 500 }}>{p}</span>
                  ))}
                  {member.permissions.length > 3 && (
                    <span style={{ fontSize: 10.5, padding: '4px 10px', background: 'var(--accent-light)', borderRadius: 99, color: 'var(--accent)', fontWeight: 600 }}>+{member.permissions.length - 3} more</span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  <button className={`btn btn-sm ${member.status === 'active' ? 'btn-secondary' : 'btn-success'}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleToggleStatus(member.id)}>
                    {member.status === 'active' ? <><PauseCircle size={14} /> Deactivate</> : <><PlayCircle size={14} /> Activate</>}
                  </button>
                  {member.role !== 'admin' && (
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(member.id)} title="Remove Member">
                       <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <UserPlus size={20} color="var(--accent)" /> Add Team Member
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Priya Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="priya@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => {
                const role = e.target.value as TeamMember['role'];
                setForm(f => ({ ...f, role, permissions: DEFAULT_PERMS[role] }));
              }}>
                {ROLES.map(r => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ marginBottom: 8 }}>Permissions</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px', background: 'var(--bg-input)', borderRadius: 10, border: '1px solid var(--border)' }}>
                {ALL_PERMISSIONS.map(p => {
                  const checked = form.permissions.includes(p);
                  return (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: checked ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: checked ? 600 : 400 }}>
                      <input type="checkbox" checked={checked} onChange={() => {
                        setForm(f => ({
                          ...f,
                          permissions: checked ? f.permissions.filter(x => x !== p) : [...f.permissions, p]
                        }));
                      }} style={{ accentColor: 'var(--accent)' }} />
                      {p}
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="save-member-btn" className="btn btn-primary" onClick={handleAdd}>Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

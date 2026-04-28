'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  Mail, 
  Phone, 
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Lock
} from 'lucide-react';
import { 
  getTeam, 
  addTeamMember, 
  updateTeamMember, 
  deleteTeamMember, 
  getRoles,
  uid, 
  now, 
  fmtDate 
} from '@/lib/store';
import type { TeamMember, Role } from '@/lib/store';

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    roleId: '',
    status: 'active' as TeamMember['status']
  });

  useEffect(() => {
    setTeam(getTeam());
    setRoles(getRoles());
  }, []);

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.roleId || !formData.userId) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedRole = roles.find(r => r.id === formData.roleId);

    if (editingId) {
      updateTeamMember(editingId, {
        ...formData,
        role: selectedRole?.name || 'Member'
      });
    } else {
      const newMember: TeamMember = {
        id: uid(),
        ...formData,
        role: selectedRole?.name || 'Member',
        joinedAt: now()
      };
      addTeamMember(newMember);
    }

    setTeam(getTeam());
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ userId: '', name: '', email: '', password: '', phone: '', roleId: '', status: 'active' });
    setEditingId(null);
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
      userId: member.userId,
      name: member.name,
      email: member.email,
      password: member.password || '',
      phone: member.phone,
      roleId: member.roleId,
      status: member.status
    });
    setEditingId(member.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      deleteTeamMember(id);
      setTeam(getTeam());
    }
  };

  const filteredTeam = team.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Manage your organization's users and their access levels</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <UserPlus size={16} /> Add Team Member
        </button>
      </div>

      <div className="page-body">
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Total Members</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{team.length}</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Active Now</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{team.filter(t => t.status === 'active').length}</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Admin Roles</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#7c3aed' }}>{team.filter(t => t.roleId === 'admin').length}</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Last Activity</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginTop: 8 }}>Today, 10:45 AM</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input 
            className="form-input" 
            placeholder="Search by name, email or role..." 
            style={{ paddingLeft: 44, margin: 0 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Team Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredTeam.map(member => (
            <div key={member.id} className="card" style={{ padding: 24, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>
                  {member.name.charAt(0)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(member)} className="btn btn-secondary btn-icon" style={{ padding: 8 }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="btn btn-secondary btn-icon" style={{ padding: 8, color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{member.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <Shield size={12} color="#7c3aed" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>{member.role}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
                  <Mail size={14} /> {member.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
                  <Lock size={14} /> ID: {member.userId}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
                  <Calendar size={14} /> Joined {fmtDate(member.joinedAt)}
                </div>
              </div>

              <div className="divider" style={{ margin: '20px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${member.status === 'active' ? 'badge-green' : 'badge-yellow'}`} style={{ textTransform: 'capitalize' }}>
                  {member.status}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Last seen: 2h ago</span>
              </div>
            </div>
          ))}

          {filteredTeam.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '60px 40px', textAlign: 'center', background: '#f8fafc', borderRadius: 20, border: '2px dashed #e2e8f0' }}>
              <div style={{ width: 64, height: 64, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Users size={32} color="#cbd5e1" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>No team members found</h3>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Start building your team by adding your first member.</p>
            </div>
          )}
        </div>
      </div>

      {/* Team Member Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Team Member' : 'Add New Team Member'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">User ID (Login ID)</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. john_sales"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  className="form-input" 
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password"
                  className="form-input" 
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Role</label>
                <select 
                  className="form-input"
                  value={formData.roleId}
                  onChange={e => setFormData({...formData, roleId: e.target.value})}
                >
                  <option value="">Choose Role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select 
                  className="form-input"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Phone Number (Optional)</label>
                <input 
                  className="form-input" 
                  placeholder="+91 00000 00000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingId ? 'Update Member' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

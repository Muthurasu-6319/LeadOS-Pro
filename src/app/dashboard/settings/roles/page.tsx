'use client';
import { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  Lock, 
  Eye, 
  Mail, 
  DollarSign, 
  Users,
  Settings as SettingsIcon,
  Search
} from 'lucide-react';
import { getRoles, saveRoles, uid, now } from '@/lib/store';
import type { Role } from '@/lib/store';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const PERMISSION_GROUPS = [
    {
      name: 'Leads & Discovery',
      permissions: [
        { id: 'leads_view', label: 'View Leads', icon: Eye, color: '#3b82f6' },
        { id: 'leads_add', label: 'Find New Leads', icon: Plus, color: '#10b981' },
        { id: 'leads_edit', label: 'Edit Lead Details', icon: Edit2, color: '#2563eb' },
        { id: 'leads_delete', label: 'Delete Leads', icon: Trash2, color: '#ef4444' },
      ]
    },
    {
      name: 'Outreach & Campaigns',
      permissions: [
        { id: 'campaigns_view', label: 'View Campaigns', icon: Mail, color: '#f59e0b' },
        { id: 'campaigns_add', label: 'Launch Campaigns', icon: Plus, color: '#10b981' },
        { id: 'campaigns_edit', label: 'Edit Campaigns', icon: Edit2, color: '#2563eb' },
        { id: 'campaigns_delete', label: 'Delete Campaigns', icon: Trash2, color: '#ef4444' },
      ]
    },
    {
      name: 'Pipeline & Finance',
      permissions: [
        { id: 'pipeline_view', label: 'View Pipeline', icon: DollarSign, color: '#10b981' },
        { id: 'pipeline_add', label: 'Add Deals', icon: Plus, color: '#10b981' },
        { id: 'pipeline_edit', label: 'Update Financials', icon: Edit2, color: '#2563eb' },
        { id: 'pipeline_delete', label: 'Delete Deals', icon: Trash2, color: '#ef4444' },
      ]
    },
    {
      name: 'Team & Security',
      permissions: [
        { id: 'team_view', label: 'View Team', icon: Users, color: '#7c3aed' },
        { id: 'team_add', label: 'Add Members', icon: Plus, color: '#10b981' },
        { id: 'team_edit', label: 'Edit Members', icon: Edit2, color: '#2563eb' },
        { id: 'team_delete', label: 'Remove Members', icon: Trash2, color: '#ef4444' },
      ]
    },
    {
      name: 'Administrative',
      permissions: [
        { id: 'settings_all', label: 'Full System Settings', icon: SettingsIcon, color: '#475569' },
        { id: 'all', label: 'Super Admin Access', icon: Lock, color: '#000' }
      ]
    }
  ];

  const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap(g => g.permissions);

  useEffect(() => {
    setRoles(getRoles());
  }, []);

  const handleSave = () => {
    if (!formData.name) return;

    let updatedRoles: Role[];
    if (editingId) {
      updatedRoles = roles.map(r => r.id === editingId ? { ...r, ...formData } : r);
    } else {
      const newRole: Role = {
        id: uid(),
        ...formData,
        createdAt: now()
      };
      updatedRoles = [...roles, newRole];
    }

    saveRoles(updatedRoles);
    setRoles(updatedRoles);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', permissions: [] });
    setEditingId(null);
  };

  const togglePermission = (id: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id) 
        ? prev.permissions.filter(p => p !== id) 
        : [...prev.permissions, id]
    }));
  };

  const handleEdit = (role: Role) => {
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setEditingId(role.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (id === 'admin') {
      alert('System Administrator role cannot be deleted');
      return;
    }
    if (confirm('Delete this role? This will affect all assigned team members.')) {
      const updated = roles.filter(r => r.id !== id);
      saveRoles(updated);
      setRoles(updated);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Role Permissions</h1>
          <p className="page-subtitle">Define access levels and security rules for your team</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={16} /> New Role
        </button>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
          {roles.map(role => (
            <div key={role.id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, background: 'var(--bg-primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={22} color="var(--accent)" />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(role)} className="btn btn-secondary btn-icon" style={{ padding: 8 }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(role.id)} className="btn btn-secondary btn-icon" style={{ padding: 8, color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>{role.name}</h3>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>{role.description}</p>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Permissions Overview</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {role.permissions.map(pId => {
                    const p = ALL_PERMISSIONS.find(ap => ap.id === pId);
                    return (
                      <div key={pId} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#f1f5f9', borderRadius: 20, fontSize: 10, fontWeight: 700, color: '#475569' }}>
                        {p?.icon && <p.icon size={10} />} {p?.label || pId}
                      </div>
                    );
                  })}
                  {role.permissions.length === 0 && <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No permissions assigned</span>}
                </div>
              </div>

              <div className="divider" style={{ margin: '20px 0' }} />
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Created {new Date(role.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 800, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, paddingBottom: 20 }}>
              <h2 className="modal-title">{editingId ? 'Edit Role' : 'Create Custom Role'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div style={{ padding: '0 4px' }}>
              <div className="form-group">
                <label className="form-label">Role Name</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Sales Representative"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  placeholder="Briefly describe what this role can do..."
                  style={{ minHeight: 80, resize: 'vertical' }}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: 20 }}>Granular Module Access</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.name}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>{group.name}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                        {group.permissions.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => togglePermission(p.id)}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid',
                              borderColor: formData.permissions.includes(p.id) ? p.color : '#e2e8f0',
                              background: formData.permissions.includes(p.id) ? `${p.color}08` : 'transparent',
                              cursor: 'pointer', transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ width: 24, height: 24, borderRadius: 6, background: formData.permissions.includes(p.id) ? p.color : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <p.icon size={14} color={formData.permissions.includes(p.id) ? '#fff' : '#94a3b8'} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: formData.permissions.includes(p.id) ? '#1e293b' : '#64748b' }}>{p.label}</span>
                            {formData.permissions.includes(p.id) && <Check size={16} color={p.color} style={{ marginLeft: 'auto' }} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 40, position: 'sticky', bottom: 0, background: '#fff', paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Permissions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

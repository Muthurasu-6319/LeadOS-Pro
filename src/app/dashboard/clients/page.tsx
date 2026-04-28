'use client';
import { useState, useEffect } from 'react';
import { getClients, deleteClient, fmtDate } from '@/lib/store';
import type { Client } from '@/lib/store';
import { 
  Search, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Factory, 
  Calendar,
  UserCheck,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { setClients(getClients()); }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Remove this client?')) return;
    deleteClient(id);
    setClients(getClients());
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Clients</h1>
          <p className="page-subtitle">Manage your converted clients and their project details.</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="search-bar" style={{ maxWidth: 400 }}>
            <span className="search-icon"><Search size={14} /></span>
            <input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><UserCheck size={48} color="var(--border-light)" /></div>
            <div className="empty-title">No clients yet</div>
            <div className="empty-subtitle">Go to the Leads page and click "Convert to Client" to see them here.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
            {filtered.map(client => (
              <div key={client.id} className="card" style={{ padding: 24, borderTop: '4px solid var(--green)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, background: 'var(--green-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{client.name}</h3>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                         <Factory size={12} /> {client.industry}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-green">Active Client</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <MapPin size={16} color="var(--text-muted)" /> {client.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <Phone size={16} color="var(--text-muted)" /> {client.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <Mail size={16} color="var(--text-muted)" /> {client.email || 'No email provided'}
                  </div>
                </div>

                <div className="divider" style={{ margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} /> Converted on {fmtDate(client.convertedAt)}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" title="Project Details"><ExternalLink size={14} /></button>
                    <button className="btn btn-secondary btn-sm" title="Chat"><MessageSquare size={14} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(client.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

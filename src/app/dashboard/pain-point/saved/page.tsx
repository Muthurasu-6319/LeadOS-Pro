'use client';
import { useState, useEffect } from 'react';
import { getSavedPainPoints, deleteSavedPainPoint, fmtDate } from '@/lib/store';
import type { SavedPainPoint } from '@/lib/store';
import { 
  Bookmark, 
  Trash2, 
  MapPin, 
  Factory, 
  Calendar, 
  Languages, 
  Search, 
  X,
  FileText,
  Building2,
  ChevronRight
} from 'lucide-react';

export default function SavedPainPointsPage() {
  const [items, setItems] = useState<SavedPainPoint[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SavedPainPoint | null>(null);

  const load = () => setItems(getSavedPainPoints());
  useEffect(() => { load(); }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this saved pain point?')) return;
    deleteSavedPainPoint(id);
    setSelected(null);
    load();
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return !q || i.problem.toLowerCase().includes(q) || i.industry.toLowerCase().includes(q) || i.city.toLowerCase().includes(q);
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Pain Points</h1>
          <p className="page-subtitle">Your curated list of business problems for targeted pitching.</p>
        </div>
      </div>

      <div className="page-body">
        {/* Search */}
        <div style={{ marginBottom: 20 }}>
           <div className="search-bar" style={{ maxWidth: 400 }}>
              <span className="search-icon"><Search size={14} /></span>
              <input placeholder="Search saved pain points..." value={search} onChange={e => setSearch(e.target.value)} />
           </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Bookmark size={48} color="var(--border-light)" /></div>
            <div className="empty-title">No saved pain points</div>
            <div className="empty-subtitle">Analyse an industry in the Pain Point Analyser and save problems to see them here.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 24 }}>
            {/* List */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(item => (
                <div key={item.id} className="card" onClick={() => setSelected(item)} style={{ 
                  cursor: 'pointer', 
                  border: selected?.id === item.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: selected?.id === item.id ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px'
                }}>
                  <div style={{ width: 40, height: 40, background: 'var(--accent-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                     <FileText size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{item.problem}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Factory size={12} /> {item.industry}</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {item.city}</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Languages size={12} /> {item.language}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              ))}
            </div>

            {/* Detail */}
            {selected && (
              <div className="card slide-up" style={{ width: 350, flexShrink: 0, position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                   <h3 style={{ fontSize: 15, fontWeight: 700 }}>Pain Point Detail</h3>
                   <button className="modal-close" onClick={() => setSelected(null)}><X size={16} /></button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                   <div style={{ width: 56, height: 56, background: 'var(--accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 12px', boxShadow: 'var(--shadow)' }}>
                      <Bookmark size={24} />
                   </div>
                   <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', padding: '0 10px' }}>{selected.problem}</h2>
                   <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                      <span className="badge badge-purple">{selected.industry}</span>
                      <span className="badge badge-blue">{selected.language}</span>
                   </div>
                </div>

                <div className="divider" />

                <div style={{ marginBottom: 24 }}>
                   <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={12} /> Detailed Problem Statement
                   </div>
                   <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', background: 'var(--bg-input)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                      {selected.detail}
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} color="var(--text-muted)" /> City</span>
                      <span style={{ fontWeight: 600 }}>{selected.city}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} color="var(--text-muted)" /> Saved Date</span>
                      <span style={{ fontWeight: 600 }}>{fmtDate(selected.createdAt)}</span>
                   </div>
                </div>

                <div className="divider" />

                <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleDelete(selected.id)}>
                   <Trash2 size={16} /> Delete Pain Point
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

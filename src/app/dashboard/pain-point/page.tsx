'use client';
import { useState, useEffect } from 'react';
import { PAIN_POINTS_DATA, getSettings, addSavedPainPoint, uid, now } from '@/lib/store';
import { 
  Search, 
  AlertCircle, 
  MapPin, 
  Factory, 
  CheckCircle2, 
  Zap, 
  Bookmark,
  XCircle,
  Languages,
  Target,
  ArrowRight,
  Lightbulb,
  X,
  Laptop,
  Smartphone,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export default function PainPointPage() {
  const [settings, setSettings] = useState<any>(null);
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('Chennai');
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [selectedProblem, setSelectedProblem] = useState<any>(null);

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    if (s.industries.length > 0) setIndustry(s.industries[0]);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const generate = async () => {
    if (!industry || !city) return;
    setLoading(true);
    setGenerated(false);
    setSavedIds(new Set());
    setRejectedIds(new Set());
    await new Promise(r => setTimeout(r, 1200));
    setGenerated(true);
    setLoading(false);
  };

  const handleSave = (prob: any) => {
    addSavedPainPoint({
      id: uid(),
      industry,
      city,
      problem: prob.title,
      detail: prob.detail,
      solution: prob.solution,
      language: settings?.language ?? 'English',
      createdAt: now(),
    });
    setSavedIds(prev => new Set([...prev, prob.title]));
    showToast(`Saved "${prob.title}"`);
  };

  const handleReject = (title: string) => {
    setRejectedIds(prev => new Set([...prev, title]));
    showToast(`Ignored "${title}"`);
  };

  if (!settings) return null;

  const lang = settings.language || 'English';
  const data = PAIN_POINTS_DATA[industry]?.[lang] || PAIN_POINTS_DATA['Hotels & Resorts']?.[lang];

  return (
    <div className="fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 18px', fontSize: 13, zIndex: 9999, boxShadow: 'var(--shadow)', animation: 'slideUp 0.3s ease', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
           <CheckCircle2 size={16} color="var(--green)" /> {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Pain Point Analyser</h1>
          <p className="page-subtitle">Identify problems and get expert solutions for any industry.</p>
        </div>
        <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
           <Languages size={14} color="var(--accent)" /> Result Language: <strong>{lang}</strong>
        </div>
      </div>

      <div className="page-body">
        {/* Generator */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
              <label className="form-label">Select Industry</label>
              <select className="form-select" value={industry} onChange={e => { setIndustry(e.target.value); setGenerated(false); }}>
                {settings.industries.map((i: string) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
              <label className="form-label">Town / City</label>
              <input className="form-input" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Chennai..." />
            </div>
            <button className="btn btn-primary btn-lg" onClick={generate} disabled={loading} style={{ flexShrink: 0 }}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Analyzing...</>
              ) : (
                <><Search size={18} /> Get Detailed Analysis</>
              )}
            </button>
          </div>
        </div>

        {!generated && !loading && (
          <div className="empty-state" style={{ minHeight: 300 }}>
            <div className="empty-icon"><Search size={48} color="var(--border-light)" /></div>
            <div className="empty-title">Start Industry Analysis</div>
            <div className="empty-subtitle">We will find deep operational gaps and provide expert solutions in {lang}.</div>
          </div>
        )}

        {loading && (
          <div className="empty-state" style={{ minHeight: 300 }}>
            <div style={{ marginBottom: 16 }}><Zap size={48} color="var(--accent)" className="animate-pulse" /></div>
            <div className="empty-title">Deep Scanning {industry}…</div>
            <div className="empty-subtitle">Finding operational bottlenecks and growth opportunities...</div>
          </div>
        )}

        {generated && data && (
          <div className="slide-up">
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
               <AlertCircle size={20} color="var(--accent)" /> Identified Pain Points
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
              {data.problems.map((p, i) => {
                const isSaved = savedIds.has(p.title);
                const isRejected = rejectedIds.has(p.title);
                return (
                  <div key={i} className="card" style={{ 
                    padding: 24, 
                    borderLeft: isSaved ? '5px solid var(--green)' : isRejected ? '5px solid var(--red)' : '5px solid var(--accent)',
                    opacity: isRejected ? 0.6 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 240
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                         <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', flex: 1 }}>{p.title}</h3>
                         {isSaved ? <span className="badge badge-green">Saved</span> : isRejected ? <span className="badge badge-red">Ignored</span> : null}
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{p.detail}</p>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setSelectedProblem(p)}>
                         <Lightbulb size={16} /> View Full Solution
                      </button>
                      {!isSaved && !isRejected && (
                         <>
                           <button className="btn btn-secondary" style={{ padding: '0 12px' }} onClick={() => handleSave(p)} title="Save for later">
                              <Bookmark size={16} />
                           </button>
                           <button className="btn btn-secondary" style={{ padding: '0 12px' }} onClick={() => handleReject(p.title)} title="Ignore">
                              <XCircle size={16} />
                           </button>
                         </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Solution Modal */}
      {selectedProblem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: 20 }} onClick={() => setSelectedProblem(null)}>
           <div className="card slide-up" style={{ maxWidth: 700, width: '100%', padding: 40, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, background: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                       <Lightbulb size={24} />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800 }}>Detailed Solution</h2>
                 </div>
                 <button className="modal-close" onClick={() => setSelectedProblem(null)}><X size={20} /></button>
              </div>

              <div style={{ marginBottom: 32 }}>
                 <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Problem</div>
                 <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>{selectedProblem.title}</h3>
                 <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selectedProblem.detail}</p>
              </div>

              <div className="divider" style={{ margin: '32px 0' }} />

              <div>
                 <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={16} /> Step-by-Step Strategic Solution
                 </div>
                 
                 <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 30, fontSize: 16, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {selectedProblem.solution}
                 </div>

                 <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 12, border: '1px solid var(--border)' }}>
                       <Smartphone size={18} color="var(--accent)" style={{ marginBottom: 10 }} />
                       <div style={{ fontWeight: 700, fontSize: 14 }}>App Solution</div>
                       <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Custom mobile app development.</div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 12, border: '1px solid var(--border)' }}>
                       <TrendingUp size={18} color="var(--green)" style={{ marginBottom: 10 }} />
                       <div style={{ fontWeight: 700, fontSize: 14 }}>Marketing</div>
                       <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>FB/Insta targeted ads.</div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 12, border: '1px solid var(--border)' }}>
                       <MessageSquare size={18} color="var(--blue)" style={{ marginBottom: 10 }} />
                       <div style={{ fontWeight: 700, fontSize: 14 }}>Automation</div>
                       <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>WhatsApp Business API.</div>
                    </div>
                 </div>
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 40, height: 56, fontSize: 16 }} onClick={() => setSelectedProblem(null)}>
                 Close Solution
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

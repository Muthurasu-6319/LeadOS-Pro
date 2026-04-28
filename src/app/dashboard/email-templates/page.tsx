'use client';
import { useState, useEffect } from 'react';
import { DEFAULT_INDUSTRIES, getSettings, getTemplates, saveTemplates, uid, now, fmtDate } from '@/lib/store';
import type { EmailTemplate, AppSettings } from '@/lib/store';
import { 
  Mail, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  X, 
  Tag, 
  Calendar, 
  ChevronRight, 
  Save, 
  Clock,
  AlertCircle,
  Paperclip,
  FileText as FileIcon
} from 'lucide-react';

export default function EmailTemplatesPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>(DEFAULT_INDUSTRIES[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState<'s' | 'b' | null>(null);

  const load = () => {
    const s = getSettings();
    setSettings(s);
    const t = getTemplates();
    setTemplates(t);
    
    const industryTemplates = t.filter(x => x.industry === selectedIndustry);
    if (industryTemplates.length > 0) {
      setSelectedTemplate(industryTemplates[0]);
    } else {
      setSelectedTemplate(null);
    }
  };

  useEffect(() => { load(); }, []);

  const handleIndustrySelect = (ind: string) => {
    setSelectedIndustry(ind);
    const t = templates.filter(x => x.industry === ind);
    if (t.length > 0) {
      setSelectedTemplate(t[0]);
    } else {
      setSelectedTemplate(null);
    }
    setEditMode(false);
  };

  const handleGenerateAI = async () => {
    const apiKey = settings?.apiKeys.openai;
    if (!apiKey) {
      alert('Please add your OpenAI API Key in Settings first.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: selectedIndustry, apiKey })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      const newT: EmailTemplate = {
        id: uid(),
        industry: selectedIndustry,
        subject: data.subject,
        body: data.body,
        tags: ['AI Generated'],
        attachments: [],
        createdAt: now()
      };

      const updated = [newT, ...templates];
      saveTemplates(updated);
      setTemplates(updated);
      setSelectedTemplate(newT);
      setEditMode(true); // Allow immediate editing
    } catch (err: any) {
      alert('Generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = () => {
    if (!selectedTemplate) return;
    const updated = templates.map(t => t.id === selectedTemplate.id ? selectedTemplate : t);
    saveTemplates(updated);
    setTemplates(updated);
    setEditMode(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this template?')) return;
    const updated = templates.filter(t => t.id !== id);
    saveTemplates(updated);
    setTemplates(updated);
    if (selectedTemplate?.id === id) {
      const t = updated.filter(x => x.industry === selectedIndustry);
      setSelectedTemplate(t[0] || null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedTemplate) return;
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newAttachment = { name: file.name, type: file.type, data: base64 };
        
        const updatedTemplate = {
          ...selectedTemplate,
          attachments: [...(selectedTemplate.attachments || []), newAttachment]
        };
        setSelectedTemplate(updatedTemplate);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    if (!selectedTemplate) return;
    const updatedAttachments = (selectedTemplate.attachments || []).filter((_, i) => i !== index);
    setSelectedTemplate({ ...selectedTemplate, attachments: updatedAttachments });
  };

  const copy = (txt: string, type: 's' | 'b') => {
    navigator.clipboard.writeText(txt);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const industries = settings?.industries || DEFAULT_INDUSTRIES;
  const templatesForIndustry = templates.filter(t => t.industry === selectedIndustry);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Email Intelligence</h1>
          <p className="page-subtitle">Industry-specific templates powered by AI analysis</p>
        </div>
      </div>

      <div className="page-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 24, height: '100%', minHeight: 0 }}>
          
          {/* Industry Sidebar */}
          <div style={{ width: 240, flexShrink: 0, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-input)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Industries</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {industries.map(ind => (
                <button 
                  key={ind} 
                  onClick={() => handleIndustrySelect(ind)}
                  style={{
                    width: '100%', padding: '12px 16px', textAlign: 'left', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: 13.5, fontWeight: selectedIndustry === ind ? 700 : 500,
                    background: selectedIndustry === ind ? 'var(--accent-light)' : 'transparent',
                    color: selectedIndustry === ind ? 'var(--accent)' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  {ind}
                  {selectedIndustry === ind && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            {/* Header / Actions for Selected Industry */}
            <div className="card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{selectedIndustry}</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{templatesForIndustry.length} saved templates</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" onClick={handleGenerateAI} disabled={isGenerating}>
                  {isGenerating ? <><Clock className="animate-spin" size={16} /> Analyzing...</> : <><Tag size={16} /> Generate with AI</>}
                </button>
              </div>
            </div>

            {/* Template Display */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 20 }}>
              {templatesForIndustry.length > 0 ? (
                <>
                  {/* Minor sidebar for templates of this industry if multiple */}
                  {templatesForIndustry.length > 1 && (
                    <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', paddingRight: 4, flexShrink: 0 }}>
                      {templatesForIndustry.map(t => (
                        <button 
                          key={t.id} 
                          onClick={() => { setSelectedTemplate(t); setEditMode(false); }}
                          style={{
                            padding: 12, borderRadius: 10, textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)', fontSize: 12, transition: 'all 0.2s',
                            background: selectedTemplate?.id === t.id ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                            borderColor: selectedTemplate?.id === t.id ? 'var(--accent)' : 'var(--border)',
                            boxShadow: selectedTemplate?.id === t.id ? 'var(--shadow-md)' : 'none',
                            flexShrink: 0
                          }}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
                          <div style={{ color: 'var(--text-muted)' }}>{fmtDate(t.createdAt)}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* The Template Content */}
                  {selectedTemplate && (
                    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 32, borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexShrink: 0 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <span className="badge badge-blue">Email Template</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Created {fmtDate(selectedTemplate.createdAt)}</span>
                          </div>
                          {editMode ? (
                            <input 
                              className="form-input" 
                              style={{ fontSize: 18, fontWeight: 700, width: '100%' }}
                              value={selectedTemplate.subject}
                              onChange={e => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                            />
                          ) : (
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>{selectedTemplate.subject}</h3>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {editMode ? (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => { setEditMode(false); load(); }}>Cancel</button>
                              <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>Save</button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-secondary btn-icon" onClick={() => setEditMode(true)}><Edit3 size={14} /></button>
                              <button className="btn btn-danger btn-icon" onClick={() => handleDelete(selectedTemplate.id)}><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="divider" style={{ margin: '0 0 24px', flexShrink: 0 }} />

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Body</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => copy(selectedTemplate.subject, 's')}><Copy size={14} /> {copied === 's' ? 'Copied' : 'Copy Subj'}</button>
                            <button className="btn btn-primary btn-sm" onClick={() => copy(selectedTemplate.body, 'b')}><Copy size={14} /> {copied === 'b' ? 'Copied' : 'Copy Body'}</button>
                          </div>
                        </div>
                        
                        {editMode ? (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
                            <textarea 
                              className="form-textarea" 
                              style={{ flex: 1, minHeight: 0, fontFamily: 'inherit', lineHeight: 1.8 }}
                              value={selectedTemplate.body}
                              onChange={e => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                            />
                            
                            {/* Attachment Uploader in Edit Mode */}
                            <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Paperclip size={14} /> Attachments (PDF, Images, etc.)
                                </label>
                                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                                  <Clock size={14} /> Upload Files
                                  <input type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
                                </label>
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {(selectedTemplate.attachments || []).map((file, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11 }}>
                                    <FileIcon size={12} color="var(--accent)" />
                                    <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                    <button onClick={() => removeAttachment(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--red)', display: 'flex' }}>
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                                {(selectedTemplate.attachments || []).length === 0 && (
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No attachments added.</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
                            <div style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, fontSize: 14.5, lineHeight: 1.9, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', overflowY: 'auto' }}>
                              {selectedTemplate.body}
                              
                              {/* Show Attachments in Viewer */}
                              {(selectedTemplate.attachments || []).length > 0 && (
                                <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Paperclip size={14} /> Attached Files:
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    {selectedTemplate.attachments?.map((file, i) => (
                                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }}>
                                        <FileIcon size={14} color="var(--accent)" />
                                        <span style={{ fontWeight: 600 }}>{file.name}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>({file.type.split('/')[1]?.toUpperCase()})</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="card empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: 20 }}>
                  <div style={{ width: 64, height: 64, background: 'var(--bg-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <AlertCircle size={32} color="var(--accent)" />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No templates for {selectedIndustry}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 300, textAlign: 'center' }}>Use our AI to analyze pain points and generate a custom cold email template instantly.</p>
                  <button className="btn btn-primary btn-lg" onClick={handleGenerateAI} disabled={isGenerating}>
                     {isGenerating ? <><Clock className="animate-spin" size={18} /> Generating...</> : <><Tag size={18} /> Generate with AI Now</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { getLeads, getContacts, getTeam, getSettings, fmtDate } from '@/lib/store';
import { 
  FileText, 
  BarChart2, 
  Download, 
  ClipboardList, 
  Users, 
  Building2, 
  MapPin, 
  Factory, 
  Database, 
  Table, 
  Info,
  CheckCircle2,
  Send,
  XCircle,
  Clock
} from 'lucide-react';

export default function ReportsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [exporting, setExporting] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    setLeads(getLeads());
    setContacts(getContacts());
    setTeam(getTeam());
    setSettings(getSettings());
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const stats = {
    total: leads.length,
    saved: leads.filter(l => l.status === 'saved').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    rejected: leads.filter(l => l.status === 'rejected').length,
    contacts: contacts.length,
    team: team.length,
  };

  // Industry breakdown
  const industryMap: Record<string, number> = {};
  leads.forEach(l => { industryMap[l.industry] = (industryMap[l.industry] || 0) + 1; });
  const industries = Object.entries(industryMap).sort((a, b) => b[1] - a[1]);

  // Location breakdown
  const locationMap: Record<string, number> = {};
  leads.forEach(l => { locationMap[l.location] = (locationMap[l.location] || 0) + 1; });
  const locations = Object.entries(locationMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // CSV export
  const exportCSV = async (type: string) => {
    setExporting(type);
    await new Promise(r => setTimeout(r, 700));

    let csv = '';
    let filename = '';

    if (type === 'leads') {
      csv = 'Name,Industry,Location,Phone,Email,Status,Rating,Date\n' +
        leads.map(l => `"${l.name}","${l.industry}","${l.location}","${l.phone}","${l.email}","${l.status}","${l.rating ?? ''}","${fmtDate(l.createdAt)}"`).join('\n');
      filename = `leads_${Date.now()}.csv`;
    } else if (type === 'contacts') {
      csv = 'Name,Company,Email,Phone,Role,Industry,Status,Date\n' +
        contacts.map(c => `"${c.name}","${c.company}","${c.email}","${c.phone}","${c.role}","${c.industry}","${c.status}","${fmtDate(c.createdAt)}"`).join('\n');
      filename = `contacts_${Date.now()}.csv`;
    } else if (type === 'team') {
      csv = 'Name,Email,Phone,Role,Status,Joined\n' +
        team.map(m => `"${m.name}","${m.email}","${m.phone}","${m.role}","${m.status}","${fmtDate(m.joinedAt)}"`).join('\n');
      filename = `team_${Date.now()}.csv`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    setExporting('');
    showToast(`${filename} downloaded`);
  };

  // JSON export
  const exportJSON = async (type: string) => {
    setExporting(type + '-json');
    await new Promise(r => setTimeout(r, 500));
    const data = type === 'leads' ? leads : type === 'contacts' ? contacts : team;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${type}_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    setExporting('');
    showToast(`JSON report exported`);
  };

  // Full report (text)
  const exportFullReport = async () => {
    setExporting('full');
    await new Promise(r => setTimeout(r, 900));
    const companyName = settings?.company?.name ?? 'Lead Finder';
    const prefix = settings?.company?.prefix ?? 'LF';
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    const report = `${companyName.toUpperCase()} — LEAD REPORT
Report ID: ${prefix}-RPT-${Date.now()}
Generated: ${date}
${'='.repeat(60)}

SUMMARY
-------
Total Leads     : ${stats.total}
Saved Leads     : ${stats.saved}
Contacted       : ${stats.contacted}
Rejected        : ${stats.rejected}
Total Contacts  : ${stats.contacts}
Team Members    : ${stats.team}

INDUSTRY BREAKDOWN
------------------
${industries.map(([ind, cnt]) => `${ind.padEnd(30)} ${cnt} lead${cnt > 1 ? 's' : ''}`).join('\n') || 'No data'}

TOP LOCATIONS
-------------
${locations.map(([loc, cnt]) => `${loc.padEnd(30)} ${cnt} lead${cnt > 1 ? 's' : ''}`).join('\n') || 'No data'}

LEADS DETAIL
------------
${leads.map((l, i) => `${i + 1}. ${l.name} | ${l.industry} | ${l.location} | ${l.phone} | ${l.email} | ${l.status}`).join('\n') || 'No leads yet'}

CONTACTS
--------
${contacts.map((c, i) => `${i + 1}. ${c.name} | ${c.company} | ${c.email} | ${c.phone} | ${c.status}`).join('\n') || 'No contacts yet'}

${'='.repeat(60)}
© ${new Date().getFullYear()} ${companyName}
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `full_report_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
    setExporting('');
    showToast('Full report downloaded');
  };

  return (
    <div className="fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 18px', fontSize: 13, zIndex: 9999, boxShadow: 'var(--shadow)', animation: 'slideUp 0.3s ease', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
           <BarChart2 size={16} color="var(--accent)" /> {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Download leads, contacts & team data in CSV, JSON or full text report.</p>
        </div>
        <button id="export-full-btn" className="btn btn-primary" onClick={exportFullReport} disabled={!!exporting}>
          {exporting === 'full' ? (
            <><span className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Generating...</>
          ) : (
            <><FileText size={16} /> Full Report</>
          )}
        </button>
      </div>

      <div className="page-body">
        {/* Summary stats */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Leads', value: stats.total, Icon: ClipboardList, color: 'var(--accent)', bg: 'var(--accent-light)' },
            { label: 'Saved', value: stats.saved, Icon: CheckCircle2, color: 'var(--green)', bg: 'var(--green-light)' },
            { label: 'Contacted', value: stats.contacted, Icon: Send, color: 'var(--cyan)', bg: 'var(--cyan-light)' },
            { label: 'Rejected', value: stats.rejected, Icon: XCircle, color: 'var(--red)', bg: 'var(--red-light)' },
            { label: 'Contacts', value: stats.contacts, Icon: Users, color: 'var(--blue)', bg: 'var(--blue-light)' },
            { label: 'Team', value: stats.team, Icon: Building2, color: 'var(--accent)', bg: 'var(--accent-light)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--accent-color': s.color, '--icon-bg': s.bg, '--icon-color': s.color } as any}>
              <div className="stat-icon"><s.Icon size={19} /></div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 24, marginBottom: 32 }}>
          {/* Industry breakdown */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
               <Factory size={18} color="var(--accent)" /> Leads by Industry
            </h3>
            {industries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>No data available</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {industries.slice(0, 6).map(([ind, cnt]) => {
                  const pct = stats.total ? Math.round((cnt / stats.total) * 100) : 0;
                  return (
                    <div key={ind}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{ind}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{cnt} ({pct}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location breakdown */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
               <MapPin size={18} color="var(--accent)" /> Leads by Location
            </h3>
            {locations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>No data available</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {locations.map(([loc, cnt]) => {
                  const pct = stats.total ? Math.round((cnt / stats.total) * 100) : 0;
                  return (
                    <div key={loc}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{loc}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{cnt} ({pct}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--blue)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Export options */}
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
           <Download size={18} color="var(--accent)" /> Export Data
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[
            { title: 'Leads Data', Icon: ClipboardList, count: stats.total, type: 'leads', desc: 'All leads with status, contact info & industry' },
            { title: 'Contacts List', Icon: Users, count: stats.contacts, type: 'contacts', desc: 'All saved contacts with company & role details' },
            { title: 'Team Roster', Icon: Building2, count: stats.team, type: 'team', desc: 'Team roster with roles & permissions' },
          ].map(item => (
            <div key={item.type} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, background: 'var(--accent-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                   <item.Icon size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.count} record{item.count !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <button
                  id={`export-${item.type}-csv`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center', gap: 6 }}
                  onClick={() => exportCSV(item.type)}
                  disabled={!!exporting}
                >
                  {exporting === item.type ? <span className="spinner" style={{ width: 12, height: 12, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : <Table size={14} />} CSV
                </button>
                <button
                  id={`export-${item.type}-json`}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center', gap: 6 }}
                  onClick={() => exportJSON(item.type)}
                  disabled={!!exporting}
                >
                  {exporting === item.type + '-json' ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Database size={14} />} JSON
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, padding: '14px 18px', background: 'var(--blue-light)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: 10, fontSize: 13, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Info size={16} /> <span>CSV files are compatible with Excel & Sheets. JSON is for developer use or CRM imports.</span>
        </div>
      </div>
    </div>
  );
}

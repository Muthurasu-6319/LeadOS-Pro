'use client';
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity,
  Users,
  Target,
  Zap,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { getLeads, getClients, getCampaigns, getTemplates } from '@/lib/store';

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    setLeads(getLeads());
    setClients(getClients());
    setCampaigns(getCampaigns());
  }, []);

  const totalLeads = leads.length + clients.length;
  const conversionRate = totalLeads > 0 ? Math.round((clients.length / totalLeads) * 100) : 0;
  const contactedCount = leads.filter(l => l.status !== 'new').length;

  // Industry Breakdown
  const industries = Array.from(new Set([...leads, ...clients].map(l => l.industry)));
  const industryData = industries.map(ind => {
    const count = [...leads, ...clients].filter(l => l.industry === ind).length;
    return { name: ind, count, percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0 };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Intelligence Analytics</h1>
          <p className="page-subtitle">Visual overview of your lead generation performance</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary"><Activity size={16} /> Real-time</button>
          <button className="btn btn-primary">Export Report</button>
        </div>
      </div>

      <div className="page-body">
        {/* Top Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} color="#2563eb" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Total Database</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{totalLeads}</div>
            <div style={{ fontSize: 11, color: '#10b981', marginTop: 8, fontWeight: 700 }}>+12% from last week</div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="#16a34a" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Outreach</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{contactedCount}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>{Math.round((contactedCount / totalLeads) * 100 || 0)}% of database</div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: '#faf5ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={16} color="#7c3aed" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Conversion</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{conversionRate}%</div>
            <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 8, fontWeight: 700 }}>Industry average: 3.2%</div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: '#ecfdf5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} color="#059669" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Closed Deals</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{clients.length}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>Ready for onboarding</div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Industry Distribution Chart */}
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Industry Performance</h3>
              <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                Last 30 Days <ChevronDown size={14} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {industryData.map((ind, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{ind.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{ind.count} Leads</span>
                  </div>
                  <div style={{ height: 8, width: '100%', background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${ind.percentage}%`, 
                      background: i === 0 ? '#2563eb' : i === 1 ? '#7c3aed' : '#94a3b8', 
                      borderRadius: 4,
                      transition: 'width 1s ease'
                    }} />
                  </div>
                </div>
              ))}
              {industryData.length === 0 && (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                  No industry data available. Start finding leads to see insights.
                </div>
              )}
            </div>
          </div>

          {/* Funnel Overview */}
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 32 }}>Sales Funnel</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Top - Leads */}
              <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px 12px 4px 4px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: 4 }}>Discovered</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1e40af' }}>{totalLeads}</div>
              </div>
              {/* Mid - Contacted */}
              <div style={{ width: '90%', margin: '0 auto', background: '#f5f3ff', padding: '18px', borderRadius: '4px', textAlign: 'center', border: '1px solid #ddd6fe' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', marginBottom: 4 }}>Contacted</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#5b21b6' }}>{contactedCount}</div>
              </div>
              {/* Bottom - Clients */}
              <div style={{ width: '75%', margin: '0 auto', background: '#ecfdf5', padding: '16px', borderRadius: '4px 4px 12px 12px', textAlign: 'center', border: '1px solid #d1fae5' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', marginBottom: 4 }}>Won</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#065f46' }}>{clients.length}</div>
              </div>
            </div>

            <div style={{ marginTop: 32, padding: 16, background: '#f8fafc', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Overall Efficiency</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>High Performance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

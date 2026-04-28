'use client';
import { useEffect, useState } from 'react';
import { getLeads, getClients, getTeam, fmtDate } from '@/lib/store';
import type { Lead } from '@/lib/store';
import Link from 'next/link';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp,
  Search,
  AlertCircle,
  UserCheck
} from 'lucide-react';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    setLeads(getLeads());
    setClientsCount(getClients().length);
    setTeamCount(getTeam().length);
  }, []);

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Target, color: 'var(--accent)', trend: '+12%', up: true },
    { label: 'Total Clients', value: clientsCount, icon: UserCheck, color: 'var(--green)', trend: '+5%', up: true },
    { label: 'Pending Analysing', value: 8, icon: Clock, color: 'var(--yellow)', trend: '-2%', up: false },
    { label: 'Team Members', value: teamCount, icon: Users, color: 'var(--purple)', trend: '0%', up: true },
  ];

  const recentLeads = leads.slice(0, 5);

  return (
    <div className="fade-in">
      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {stats.map((stat) => (
          <div key={stat.label} className="card stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div className={`stat-trend ${stat.up ? 'trend-up' : 'trend-down'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
        {/* Recent Leads */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>Recent Leads</h2>
            <Link href="/dashboard/leads" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Industry</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="font-bold">{lead.name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{lead.location}</div>
                    </td>
                    <td><span className="badge badge-blue">{lead.industry}</span></td>
                    <td><span className={`badge badge-${lead.status === 'client' ? 'green' : 'blue'}`}>{lead.status}</span></td>
                    <td>{fmtDate(lead.createdAt)}</td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No leads yet. Start by using the <Link href="/dashboard/finder" style={{ color: 'var(--accent)', fontWeight: 600 }}>Lead Finder</Link>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & AI Insight */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="card" style={{ background: 'var(--accent)', color: '#fff' }}>
             <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={20} /> AI Insight
             </h2>
             <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.9, marginBottom: 20 }}>
                Based on your recent activity, <b>Hotels in Srivilliputtur</b> have the highest conversion potential this week. 85% of them lack a digital booking system.
             </p>
             <Link href="/dashboard/pain-point" className="btn" style={{ background: '#fff', color: 'var(--accent)', width: '100%', justifyContent: 'center' }}>
                Analyze Hotels Now
             </Link>
          </div>

          <div className="card">
             <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Quick Actions</h2>
             <div style={{ display: 'grid', gap: 12 }}>
                <Link href="/dashboard/finder" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 12 }}>
                   <Search size={18} color="var(--accent)" /> Find New Leads
                </Link>
                <Link href="/dashboard/pain-point" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 12 }}>
                   <AlertCircle size={18} color="var(--yellow)" /> Analyze Pain Points
                </Link>
                <Link href="/dashboard/clients" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 12 }}>
                   <UserCheck size={18} color="var(--green)" /> Manage Clients
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

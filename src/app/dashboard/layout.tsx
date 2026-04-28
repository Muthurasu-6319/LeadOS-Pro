'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getLeads } from '@/lib/store';
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  Target, 
  Mail, 
  Users2, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3,
  AlertTriangle,
  FileText,
  Building2,
  ChevronDown,
  UserCheck,
  TrendingUp,
  Rocket,
  Shield
} from 'lucide-react';

const MENU_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'Team', icon: Users, href: '/dashboard/team' },
    ]
  },
  {
    title: 'FIND LEADS',
    items: [
      { label: 'Lead finder', icon: Search, href: '/dashboard/finder', badge: 'New' },
      { label: 'AI pain analysis', icon: AlertTriangle, href: '/dashboard/pain-point' },
      { label: 'Contact enrichment', icon: UserCheck, href: '/dashboard/contacts' },
    ]
  },
  {
    title: 'OUTREACH',
    items: [
      { label: 'My leads', icon: Target, href: '/dashboard/leads', showCount: true },
      { label: 'Email campaigns', icon: Mail, href: '/dashboard/campaigns' },
      { label: 'Templates', icon: FileText, href: '/dashboard/email-templates' },
    ]
  },
  {
    title: 'TRACK',
    items: [
      { label: 'Pipeline', icon: TrendingUp, href: '/dashboard/pipeline' },
      { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    ]
  },
  {
    title: 'SETTINGS',
    items: [
      { label: 'Integrations', icon: Rocket, href: '/dashboard/integrations' },
      { label: 'Roles', icon: Shield, href: '/dashboard/settings/roles' },
      { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [leadsCount, setLeadsCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCounts = () => {
      setLeadsCount(getLeads().length);
    };
    
    fetchCounts();
    // Listen for storage changes or internal updates if possible, 
    // but for now simple refresh on mount and path change is good
  }, [pathname]);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div className="sidebar-logo">
              <div className="logo-icon">LF</div>
              <div className="logo-text">LeadFinder</div>
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {MENU_SECTIONS.map((section) => (
            <div key={section.title} className="sidebar-section">
              {!collapsed && <div className="sidebar-section-label">{section.title}</div>}
              {section.items.map((item) => {
                const active = pathname === item.href;
                const count = (item as any).showCount ? leadsCount : null;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`sidebar-link ${active ? 'active' : ''}`}
                  >
                    <item.icon size={19} className="sidebar-icon" />
                    {!collapsed && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                        <span className="sidebar-label">{item.label}</span>
                        {(item as any).badge && <span className="sidebar-badge-new">{(item as any).badge}</span>}
                        {count !== null && <span className="sidebar-badge-count">{count}</span>}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar" style={{ background: '#dbeafe', color: '#1e40af' }}>YO</div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name" style={{ color: '#334155' }}>Your company</div>
                <div className="user-role" style={{ color: '#64748b' }}>Free plan</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="breadcrumb">
            <span className="text-muted">Lead Finder</span>
            <ChevronRight size={14} className="mx-8 text-muted" />
            <span className="font-bold">
              {MENU_SECTIONS.flatMap(s => s.items).find(i => pathname === i.href)?.label || 'Overview'}
            </span>
          </div>
          <div className="header-actions">
            <div className="notification-badge">
              <div className="badge-count">3</div>
              <Mail size={18} />
            </div>
            <div className="user-menu">
               <Settings size={18} />
            </div>
          </div>
        </header>
        <div className="content-inner">
          {children}
        </div>
      </main>
    </div>
  );
}

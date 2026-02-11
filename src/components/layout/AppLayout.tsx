import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, FolderKanban, Shield, AlertTriangle,
  FileText, Settings, ChevronLeft, ChevronRight, Users, DollarSign,
  Calendar, Plug, Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { currentUser } from '@/data/mockData';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Chat Copilot', icon: MessageSquare, path: '/chat' },
  { label: 'Portfólio', icon: FolderKanban, path: '/portfolio' },
  { label: 'Riscos & Issues', icon: AlertTriangle, path: '/risks' },
  { label: 'Governança', icon: Shield, path: '/governance' },
  { label: 'Recursos', icon: Users, path: '/resources' },
  { label: 'Financeiro', icon: DollarSign, path: '/financial' },
  { label: 'Templates', icon: FileText, path: '/templates' },
  { label: 'Integrações', icon: Plug, path: '/integrations' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r transition-all duration-200 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
        style={{
          background: 'hsl(var(--sidebar-background))',
          borderColor: 'hsl(var(--sidebar-border))',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-14 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shrink-0">
            <Bot size={18} className="text-accent-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <p className="text-sm font-bold" style={{ color: 'hsl(var(--sidebar-accent-foreground))' }}>PMbOt</p>
              <p className="text-[10px] font-medium" style={{ color: 'hsl(var(--sidebar-muted))' }}>INPASA · PMO Copilot</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn("sidebar-item w-full", active && "active")}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="animate-fade-in">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User + collapse */}
        <div className="border-t p-3" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2 animate-fade-in">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'hsl(var(--sidebar-accent-foreground))' }}>{currentUser.name}</p>
                <p className="text-[10px] truncate capitalize" style={{ color: 'hsl(var(--sidebar-muted))' }}>{currentUser.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-item w-full justify-center"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span className="text-xs">Recolher</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

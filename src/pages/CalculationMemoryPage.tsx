import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Calculator, Calendar, Settings, FileText, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';
import MemoriesListTab from '@/components/memorial/MemoriesListTab';
import ScheduleTab from '@/components/memorial/ScheduleTab';
import MemoryDetailPage from '@/components/memorial/MemoryDetailPage';

const subTabs = [
  { label: 'Memórias de Cálculo', icon: Calculator, path: '/memorial' },
  { label: 'Cronograma', icon: Calendar, path: '/memorial/cronograma' },
  { label: 'Configurações', icon: Settings, path: '/memorial/configuracoes' },
  { label: 'Templates', icon: FileText, path: '/memorial/templates' },
  { label: 'Ajuda', icon: HelpCircle, path: '/memorial/ajuda' },
];

export default function CalculationMemoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDetailPage = location.pathname.startsWith('/memorial/detalhe/');

  if (isDetailPage) {
    return (
      <Routes>
        <Route path="detalhe/:id" element={<MemoryDetailPage />} />
      </Routes>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Memorial de Cálculo de Avanço"
        subtitle="Integrado ao Cronograma MS Project"
      />

      {/* Sub-navigation */}
      <div className="flex gap-1 border-b border-border pb-0">
        {subTabs.map((tab) => {
          const isActive =
            tab.path === '/memorial'
              ? location.pathname === '/memorial'
              : location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <Routes>
        <Route index element={<MemoriesListTab />} />
        <Route path="cronograma" element={<ScheduleTab />} />
        <Route path="configuracoes" element={<PlaceholderTab title="Configurações" description="Gerencie critérios padrão, disciplinas e configurações do módulo." />} />
        <Route path="templates" element={<PlaceholderTab title="Templates" description="Baixe e gerencie templates de importação para memórias e cronogramas." />} />
        <Route path="ajuda" element={<PlaceholderTab title="Ajuda" description="Documentação e guia de uso do Memorial de Cálculo." />} />
      </Routes>
    </div>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">{description}</p>
    </div>
  );
}

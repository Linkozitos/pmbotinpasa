import { FileText, Download, Clock } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

const templates = [
  { id: '1', name: 'Status Report Semanal', category: 'Relatórios', version: 'v3.1', updatedAt: '2026-01-20', downloads: 142 },
  { id: '2', name: '1-Pager de Projeto', category: 'Planejamento', version: 'v2.0', updatedAt: '2025-12-15', downloads: 89 },
  { id: '3', name: 'Ata de Reunião', category: 'Governança', version: 'v1.4', updatedAt: '2026-02-01', downloads: 234 },
  { id: '4', name: 'Decision Log', category: 'Governança', version: 'v1.2', updatedAt: '2025-11-28', downloads: 67 },
  { id: '5', name: 'Risk Log', category: 'Riscos', version: 'v2.1', updatedAt: '2026-01-10', downloads: 98 },
  { id: '6', name: 'Plano de Ação (5W2H)', category: 'Planejamento', version: 'v1.3', updatedAt: '2025-12-22', downloads: 156 },
  { id: '7', name: 'Plano de Comunicação', category: 'Planejamento', version: 'v1.1', updatedAt: '2025-10-30', downloads: 45 },
  { id: '8', name: 'Deck de Comitê Executivo', category: 'Relatórios', version: 'v2.2', updatedAt: '2026-02-05', downloads: 78 },
];

const categories = [...new Set(templates.map(t => t.category))];

export default function TemplatesPage() {
  return (
    <div>
      <PageHeader title="Templates" subtitle="Biblioteca oficial versionada" />
      <div className="p-6 space-y-6">
        {categories.map((cat) => (
          <div key={cat}>
            <h2 className="text-sm font-semibold text-foreground mb-3">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.filter(t => t.category === cat).map((t) => (
                <div key={t.id} className="kpi-card animate-fade-in flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileText size={18} className="text-accent" />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{t.version}</span>
                    </div>
                    <h3 className="font-medium text-foreground mt-3 text-sm">{t.name}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={10} />{new Date(t.updatedAt).toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-1"><Download size={10} />{t.downloads}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

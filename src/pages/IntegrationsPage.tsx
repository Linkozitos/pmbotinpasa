import { Plug, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

const integrations = [
  { id: '1', name: 'monday.com', type: 'GraphQL', status: 'conectado', lastSync: '2026-02-11T08:30:00', errors: 0, description: 'Boards, items e updates de projetos' },
  { id: '2', name: 'Microsoft Teams', type: 'Graph API', status: 'conectado', lastSync: '2026-02-11T09:00:00', errors: 0, description: 'Notificações e alertas via canal de equipe' },
  { id: '3', name: 'Microsoft Outlook', type: 'Graph API', status: 'conectado', lastSync: '2026-02-11T07:45:00', errors: 1, description: 'Convites de reunião e emails automáticos' },
  { id: '4', name: 'CompuSoftware (CS)', type: 'REST API', status: 'mock', lastSync: null, errors: 0, description: 'Dados financeiros, ordens de compra, contratos e centro de custo' },
  { id: '5', name: 'WhatsApp Business', type: 'API Cloud', status: 'desconectado', lastSync: null, errors: 0, description: 'Notificações e alertas (feature flag)' },
  { id: '6', name: 'Power BI', type: 'REST', status: 'mock', lastSync: null, errors: 0, description: 'Embedding de dashboards operacionais' },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; className: string }> = {
  conectado: { icon: CheckCircle, label: 'Conectado', className: 'status-badge-green' },
  desconectado: { icon: XCircle, label: 'Desconectado', className: 'status-badge-red' },
  mock: { icon: Clock, label: 'Mock/Dev', className: 'status-badge-yellow' },
};

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader title="Integrações" subtitle="Catálogo de conectores e status de sync" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((int) => {
            const sc = statusConfig[int.status];
            const Icon = sc.icon;
            return (
              <div key={int.id} className="kpi-card animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{int.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{int.description}</p>
                  </div>
                  <span className={sc.className}><Icon size={10} className="mr-1 inline" />{sc.label}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tipo: <span className="font-mono">{int.type}</span></span>
                  {int.lastSync ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw size={10} />
                      Último sync: {new Date(int.lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60">Sem sync</span>
                  )}
                </div>
                {int.errors > 0 && (
                  <p className="text-xs text-destructive mt-2 font-medium">{int.errors} erro(s) no último run</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Plug, CheckCircle, XCircle, Clock, RefreshCw, Loader2, Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { translateSupabaseError } from '@/lib/supabaseErrors';

async function listConnectors() {
  const { data, error } = await supabase.from('integration_connectors').select('*').order('name');
  if (error) throw error;
  return data;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; className: string }> = {
  active: { icon: CheckCircle, label: 'Ativo', className: 'status-badge-green' },
  configured: { icon: Clock, label: 'Configurado', className: 'status-badge-yellow' },
  error: { icon: XCircle, label: 'Erro', className: 'status-badge-red' },
  disabled: { icon: XCircle, label: 'Desativado', className: 'status-badge-red' },
};

export default function IntegrationsPage() {
  const { data: connectors, isLoading, error, refetch } = useQuery({
    queryKey: ['connectors'],
    queryFn: listConnectors,
  });

  return (
    <div>
      <PageHeader title="Integrações" subtitle="Catálogo de conectores e status de sync" />
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-accent mr-2" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-destructive">{translateSupabaseError(error)}</p>
            <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-accent text-accent-foreground">
              <RefreshCw size={14} /> Tentar novamente
            </button>
          </div>
        ) : (connectors || []).length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
            <Plug size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum conector ativo</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Não há integrações configuradas com sistemas externos (ERP, CS, Power BI).
            </p>
            <button 
              disabled
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium opacity-50 cursor-not-allowed"
            >
              <Plus size={18} /> Configurar Integração
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(connectors || []).map((int: any) => {
              const sc = statusConfig[int.status] || statusConfig['configured'];
              const Icon = sc.icon;
              return (
                <div key={int.id} className="kpi-card animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{int.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{int.type}</p>
                    </div>
                    <span className={sc.className}><Icon size={10} className="mr-1 inline" />{sc.label}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tipo: <span className="font-mono">{int.type}</span></span>
                    <span className="text-muted-foreground/60">{new Date(int.updated_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

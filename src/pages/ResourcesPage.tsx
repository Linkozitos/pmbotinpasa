import { Loader2, RefreshCw, Users, Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { listResources, listAllocations } from '@/services/pmoService';
import { translateSupabaseError } from '@/lib/supabaseErrors';

export default function ResourcesPage() {
  const { data: resources, isLoading, error, refetch } = useQuery({
    queryKey: ['resources'],
    queryFn: listResources,
  });

  const { data: allocations } = useQuery({
    queryKey: ['allocations'],
    queryFn: () => listAllocations(),
  });

  return (
    <div>
      <PageHeader title="Recursos & Capacidade" subtitle={`${resources?.length ?? '...'} recursos cadastrados`} />
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-accent mr-2" />
            <span className="text-sm text-muted-foreground">Carregando recursos...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-destructive">{translateSupabaseError(error)}</p>
            <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-accent text-accent-foreground">
              <RefreshCw size={14} /> Tentar novamente
            </button>
          </div>
        ) : (resources || []).length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
            <Users size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum recurso cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              A base de recursos está vazia. Cadastre membros da equipe ou recursos materiais para gerenciar alocações.
            </p>
            <button 
              disabled
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium opacity-50 cursor-not-allowed"
            >
              <Plus size={18} /> Cadastrar Recurso
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cargo/Função</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Alocações</th>
                </tr>
              </thead>
              <tbody>
                {(resources || []).map((r: any) => {
                  const allocs = (allocations || []).filter((a: any) => a.resource_id === r.id);
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.role_title || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{r.type || '—'}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{allocs.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

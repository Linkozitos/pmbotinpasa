import { useState } from 'react';
import { Search, Loader2, RefreshCw, Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { listProjects } from '@/services/pmoService';
import { translateSupabaseError } from '@/lib/supabaseErrors';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const healthLabels: Record<string, { label: string; className: string }> = {
  verde: { label: 'Verde', className: 'status-badge-green' },
  amarelo: { label: 'Amarelo', className: 'status-badge-yellow' },
  vermelho: { label: 'Vermelho', className: 'status-badge-red' },
};

const statusLabels: Record<string, string> = {
  ideacao: 'Ideação',
  planejamento: 'Planejamento',
  execucao: 'Execução',
  encerrado: 'Encerrado',
  on_hold: 'Em Pausa',
};

export default function PortfolioPage() {
  const [search, setSearch] = useState('');

  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects', { search: search || undefined }],
    queryFn: () => listProjects({ search: search || undefined }),
  });

  return (
    <div>
      <PageHeader title="Portfólio" subtitle={`${projects?.length ?? '...'} projetos`}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
            <Search size={14} className="text-muted-foreground" />
            <input
              className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-48"
              placeholder="Buscar projeto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent text-accent-foreground opacity-50 cursor-not-allowed">
                <Plus size={14} /> Novo Projeto
              </button>
            </TooltipTrigger>
            <TooltipContent>Em desenvolvimento</TooltipContent>
          </Tooltip>
        </div>
      </PageHeader>

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-accent mr-2" />
            <span className="text-sm text-muted-foreground">Carregando projetos...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-destructive">{translateSupabaseError(error)}</p>
            <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-accent text-accent-foreground">
              <RefreshCw size={14} /> Tentar novamente
            </button>
          </div>
        ) : (projects || []).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">Nenhum projeto encontrado.</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Código</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Saúde</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Prioridade</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Progresso</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Início Plan.</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fim Plan.</th>
                  </tr>
                </thead>
                <tbody>
                  {(projects || []).map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.code}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{p.name}</p>
                        {p.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{p.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="status-badge">{statusLabels[p.status] || p.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {p.health ? (
                          <span className={healthLabels[p.health]?.className || 'status-badge'}>
                            {healthLabels[p.health]?.label || p.health}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{p.priority || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium">{p.progress_pct ?? 0}%</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {p.start_planned ? new Date(p.start_planned).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {p.finish_planned ? new Date(p.finish_planned).toLocaleDateString('pt-BR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

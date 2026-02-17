import { FolderKanban, AlertTriangle, TrendingUp, DollarSign, Calendar, Target, Loader2, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { KPICard } from '@/components/shared/StatusComponents';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/services/pmoService';
import { translateSupabaseError } from '@/lib/supabaseErrors';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-accent" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-destructive">{translateSupabaseError(error)}</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-accent text-accent-foreground">
          <RefreshCw size={14} /> Tentar novamente
        </button>
      </div>
    );
  }

  const { projects, risks, issues, contracts, budgetLines, meetings } = data!;

  const activeProjects = projects.filter(p => p.status !== 'encerrado');
  const greenProjects = projects.filter(p => p.health === 'verde').length;
  const criticalProjects = projects.filter(p => p.health === 'vermelho').length;
  const openRisks = risks.filter(r => r.status === 'aberto').length;

  const totalBaseline = budgetLines.reduce((s, b) => s + (b.baseline_amount || 0), 0);
  const totalActual = budgetLines.reduce((s, b) => s + (b.actual_amount || 0), 0);

  const fmt = (v: number) => `R$ ${(v / 1_000_000).toFixed(1)}M`;

  const nextMeeting = meetings[0];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Visão geral do portfólio — ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}>
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
        >
          <Target size={16} />
          Gerar Status Semanal
        </button>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <KPICard label="Projetos Ativos" value={activeProjects.length} icon={FolderKanban} />
          <KPICard label="Saúde Verde" value={greenProjects} icon={TrendingUp} />
          <KPICard label="Críticos" value={criticalProjects} icon={AlertTriangle} />
          <KPICard label="Riscos Abertos" value={openRisks} icon={AlertTriangle} />
          <KPICard label="Budget Baseline" value={totalBaseline > 0 ? fmt(totalBaseline) : '—'} icon={DollarSign} />
          <KPICard label="Realizado" value={totalActual > 0 ? fmt(totalActual) : '—'} icon={DollarSign} />
        </div>

        {/* Projects table + next meeting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Projetos do Portfólio</h3>
            </div>
            {activeProjects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Nenhum projeto cadastrado. <button onClick={() => navigate('/portfolio')} className="text-accent hover:underline">Criar projeto</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Projeto</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Saúde</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Progresso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProjects.slice(0, 8).map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate('/portfolio')}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.code}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="status-badge capitalize">{p.status?.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={
                            p.health === 'verde' ? 'status-badge-green' :
                            p.health === 'amarelo' ? 'status-badge-yellow' : 'status-badge-red'
                          }>
                            {p.health}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{p.progress_pct ?? 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {nextMeeting && (
              <div className="bg-card rounded-lg border border-border p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar size={14} /> Próxima Reunião
                </h3>
                <p className="font-medium text-foreground text-sm">{nextMeeting.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(nextMeeting.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                {Array.isArray(nextMeeting.agenda) && (
                  <div className="mt-3 space-y-1">
                    {(nextMeeting.agenda as string[]).slice(0, 3).map((a, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {a}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-card rounded-lg border border-border p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> Top Riscos
              </h3>
              {risks.filter(r => r.status === 'aberto').length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum risco aberto.</p>
              ) : (
                <div className="space-y-3">
                  {risks.filter(r => r.status === 'aberto').slice(0, 3).map(r => (
                    <div key={r.id} className="border-l-2 pl-3" style={{ borderColor: (r.score || 0) >= 6 ? 'hsl(var(--destructive))' : 'hsl(var(--warning))' }}>
                      <p className="text-xs font-medium text-foreground">Score: {r.score || '?'}</p>
                      <p className="text-[10px] text-muted-foreground">P:{r.probability} × I:{r.impact}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

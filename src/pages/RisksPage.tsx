import { useState } from 'react';
import { Loader2, RefreshCw, AlertTriangle, Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { listRisks, listIssues } from '@/services/pmoService';
import { translateSupabaseError } from '@/lib/supabaseErrors';
import { cn } from '@/lib/utils';

export default function RisksPage() {
  const [tab, setTab] = useState<'risks' | 'issues'>('risks');

  const { data: risks, isLoading: loadingRisks, error: errorRisks, refetch: refetchRisks } = useQuery({
    queryKey: ['risks'],
    queryFn: () => listRisks(),
  });

  const { data: issues, isLoading: loadingIssues, error: errorIssues, refetch: refetchIssues } = useQuery({
    queryKey: ['issues'],
    queryFn: () => listIssues(),
  });

  const isLoading = tab === 'risks' ? loadingRisks : loadingIssues;
  const error = tab === 'risks' ? errorRisks : errorIssues;
  const refetch = tab === 'risks' ? refetchRisks : refetchIssues;

  return (
    <div>
      <PageHeader title="Riscos & Issues" subtitle={`${risks?.length ?? '...'} riscos · ${issues?.length ?? '...'} issues`} />

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setTab('risks')}
            className={cn('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === 'risks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Riscos ({risks?.length ?? '...'})
          </button>
          <button
            onClick={() => setTab('issues')}
            className={cn('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === 'issues' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Issues ({issues?.length ?? '...'})
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-accent mr-2" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-destructive">{translateSupabaseError(error)}</p>
            <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-accent text-accent-foreground">
              <RefreshCw size={14} /> Tentar novamente
            </button>
          </div>
        ) : tab === 'risks' ? (
          <RisksTable risks={risks || []} />
        ) : (
          <IssuesTable issues={issues || []} />
        )}
      </div>
    </div>
  );
}

function RisksTable({ risks }: { risks: any[] }) {
  if (risks.length === 0) return (
    <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
      <AlertTriangle size={48} className="mx-auto text-muted-foreground/20 mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Nenhum risco registrado</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        Não há riscos abertos para os projetos do portfólio no momento.
      </p>
      <button 
        disabled
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium opacity-50 cursor-not-allowed"
      >
        <Plus size={18} /> Registrar Novo Risco
      </button>
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risco</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">P</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">I</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Score</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Resposta</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{r.title}</p>
                  {r.description && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{r.description}</p>}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{r.projects?.name || '—'}</td>
                <td className="px-4 py-3 text-center">{r.probability}</td>
                <td className="px-4 py-3 text-center">{r.impact}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn('font-bold', (r.score || 0) >= 6 ? 'text-destructive' : (r.score || 0) >= 3 ? 'text-warning' : 'text-success')}>
                    {r.score || '?'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={
                    r.status === 'aberto' ? 'status-badge-yellow' : r.status === 'mitigando' ? 'status-badge-blue' : 'status-badge-green'
                  }>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{r.response_strategy || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IssuesTable({ issues }: { issues: any[] }) {
  if (issues.length === 0) return (
    <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
      <AlertTriangle size={48} className="mx-auto text-muted-foreground/20 mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma issue registrada</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        Não há issues ou problemas pendentes registrados para os projetos.
      </p>
      <button 
        disabled
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium opacity-50 cursor-not-allowed"
      >
        <Plus size={18} /> Registrar Nova Issue
      </button>
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Issue</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Severidade</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">SLA</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((i) => (
              <tr key={i.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{i.title}</p>
                  {i.description && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{i.description}</p>}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{i.projects?.name || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn('font-bold', i.severity <= 2 ? 'text-destructive' : i.severity <= 3 ? 'text-warning' : 'text-muted-foreground')}>
                    {i.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={
                    i.status === 'aberto' ? 'status-badge-yellow' : i.status === 'em_andamento' ? 'status-badge-blue' : 'status-badge-green'
                  }>
                    {i.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {i.sla_due_date ? new Date(i.sla_due_date).toLocaleDateString('pt-BR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

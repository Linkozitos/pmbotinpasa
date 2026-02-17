import { useState } from 'react';
import { Calendar, CheckCircle, Clock, Users, Loader2, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { listMeetings, listDecisions } from '@/services/pmoService';
import { translateSupabaseError } from '@/lib/supabaseErrors';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, { label: string; className: string }> = {
  agendada: { label: 'Agendada', className: 'status-badge-blue' },
  realizada: { label: 'Realizada', className: 'status-badge-green' },
  cancelada: { label: 'Cancelada', className: 'status-badge-red' },
};

const decisionStatusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: 'Rascunho', className: 'status-badge' },
  pending_approval: { label: 'Pendente', className: 'status-badge-yellow' },
  approved: { label: 'Aprovada', className: 'status-badge-green' },
  rejected: { label: 'Rejeitada', className: 'status-badge-red' },
};

export default function GovernancePage() {
  const [tab, setTab] = useState<'meetings' | 'decisions'>('meetings');

  const { data: meetings, isLoading: loadingM, error: errorM, refetch: refetchM } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => listMeetings(),
  });

  const { data: decisions, isLoading: loadingD, error: errorD, refetch: refetchD } = useQuery({
    queryKey: ['decisions'],
    queryFn: () => listDecisions(),
  });

  const isLoading = tab === 'meetings' ? loadingM : loadingD;
  const error = tab === 'meetings' ? errorM : errorD;
  const refetch = tab === 'meetings' ? refetchM : refetchD;

  return (
    <div>
      <PageHeader title="Governança" subtitle="Ritos, decisões e follow-up" />

      <div className="p-6 space-y-6">
        <div className="flex gap-1 border-b border-border">
          <button onClick={() => setTab('meetings')} className={cn('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors', tab === 'meetings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            Reuniões ({meetings?.length ?? '...'})
          </button>
          <button onClick={() => setTab('decisions')} className={cn('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors', tab === 'decisions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            Decisões ({decisions?.length ?? '...'})
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
        ) : tab === 'meetings' ? (
          meetings && meetings.length === 0 ? (
            <p className="text-center py-12 text-sm text-muted-foreground">Nenhuma reunião cadastrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(meetings || []).map((m) => {
                const s = statusLabels[m.status] || { label: m.status, className: 'status-badge' };
                return (
                  <div key={m.id} className="kpi-card animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <span className="status-badge-blue text-[10px] capitalize">{m.type}</span>
                      <span className={cn("text-[10px] font-medium", s.className)}>{s.label}</span>
                    </div>
                    <h3 className="font-medium text-foreground text-sm">{m.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(m.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {Array.isArray(m.agenda) && (
                      <div className="mt-3 space-y-1">
                        {(m.agenda as string[]).slice(0, 2).map((a, i) => (
                          <p key={i} className="text-[11px] text-muted-foreground">• {a}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          decisions && decisions.length === 0 ? (
            <p className="text-center py-12 text-sm text-muted-foreground">Nenhuma decisão cadastrada.</p>
          ) : (
            <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Decisão</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {(decisions || []).map((d) => {
                    const s = decisionStatusLabels[d.status] || { label: d.status, className: 'status-badge' };
                    return (
                      <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{d.title}</p>
                          {d.context && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{d.context}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{d.projects?.name || '—'}</td>
                        <td className="px-4 py-3"><span className={s.className}>{s.label}</span></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

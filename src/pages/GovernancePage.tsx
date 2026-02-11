import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { mockMeetings, mockDecisions } from '@/data/mockData';
import { cn } from '@/lib/utils';

const typeLabels: Record<string, string> = {
  comite: 'Comitê',
  status: 'Status',
  kickoff: 'Kickoff',
  retrospectiva: 'Retro',
};

export default function GovernancePage() {
  return (
    <div>
      <PageHeader title="Governança" subtitle="Ritos, decisões e follow-up" />

      <div className="p-6 space-y-6">
        {/* Meetings */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar size={14} /> Reuniões & Ritos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockMeetings.map((m) => (
              <div key={m.id} className="kpi-card animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="status-badge-blue text-[10px]">{typeLabels[m.type]}</span>
                  <span className={cn(
                    "text-[10px] font-medium",
                    m.status === 'agendada' ? 'text-info' : m.status === 'realizada' ? 'text-success' : 'text-muted-foreground'
                  )}>
                    {m.status}
                  </span>
                </div>
                <h3 className="font-medium text-foreground text-sm">{m.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(m.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users size={12} />{m.participants.length}</span>
                  <span className="flex items-center gap-1"><CheckCircle size={12} />{m.actionItems} ações</span>
                  {m.pendingItems > 0 && (
                    <span className="flex items-center gap-1 text-warning"><Clock size={12} />{m.pendingItems} pendentes</span>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  {m.agenda.slice(0, 2).map((a, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground">• {a}</p>
                  ))}
                  {m.agenda.length > 2 && (
                    <p className="text-[10px] text-accent font-medium">+{m.agenda.length - 2} itens</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decisions */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle size={14} /> Decision Log
          </h2>
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Decisão</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Decidido por</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Impacto</th>
                </tr>
              </thead>
              <tbody>
                {mockDecisions.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{d.projectName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.decidedBy}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(d.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        d.status === 'aprovada' ? 'status-badge-green' :
                        d.status === 'pendente' ? 'status-badge-yellow' : 'status-badge-red'
                      }>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px]">{d.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

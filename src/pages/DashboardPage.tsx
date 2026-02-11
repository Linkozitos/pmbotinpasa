import { FolderKanban, AlertTriangle, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { KPICard, StatusBadge, HealthBar } from '@/components/shared/StatusComponents';
import { mockProjects, mockRisks, portfolioTrendData, curvaSData, mockMeetings } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line,
} from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const totalBudget = mockProjects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = mockProjects.reduce((s, p) => s + p.spent, 0);
  const openRisks = mockRisks.filter(r => r.status === 'aberto').length;
  const criticalProjects = mockProjects.filter(p => p.status === 'vermelho').length;
  const nextMeeting = mockMeetings.find(m => m.status === 'agendada');

  const fmt = (v: number) => `R$ ${(v / 1_000_000).toFixed(1)}M`;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral do portfólio — Fev/2026">
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
          <KPICard label="Projetos Ativos" value={mockProjects.length} icon={FolderKanban} change={0} />
          <KPICard label="Em Dia" value={mockProjects.filter(p => p.status === 'verde').length} icon={TrendingUp} change={0} />
          <KPICard label="Críticos" value={criticalProjects} icon={AlertTriangle} change={100} />
          <KPICard label="Riscos Abertos" value={openRisks} icon={AlertTriangle} change={-12} />
          <KPICard label="Budget Total" value={fmt(totalBudget)} icon={DollarSign} />
          <KPICard label="Realizado" value={fmt(totalSpent)} icon={DollarSign} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio trend */}
          <div className="bg-card rounded-lg border border-border p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Tendência do Portfólio</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={portfolioTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="verde" fill="hsl(var(--success))" name="Verde" radius={[2, 2, 0, 0]} />
                <Bar dataKey="amarelo" fill="hsl(var(--warning))" name="Amarelo" radius={[2, 2, 0, 0]} />
                <Bar dataKey="vermelho" fill="hsl(var(--destructive))" name="Vermelho" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Curva S */}
          <div className="bg-card rounded-lg border border-border p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Curva-S — Progresso Geral (%)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={curvaSData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="planned" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" name="Planejado" />
                <Area type="monotone" dataKey="actual" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.1)" name="Realizado" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects table + next meeting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Projetos do Portfólio</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Projeto</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Saúde</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Gerente</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Riscos</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProjects.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate(`/portfolio`)}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.code} · {p.area}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 w-32"><HealthBar value={p.health} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{p.gerente}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={p.riskCount > 4 ? "text-destructive font-semibold" : "text-muted-foreground"}>{p.riskCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Próximas reuniões + riscos */}
          <div className="space-y-6">
            {nextMeeting && (
              <div className="bg-card rounded-lg border border-border p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar size={14} /> Próxima Reunião
                </h3>
                <p className="font-medium text-foreground text-sm">{nextMeeting.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(nextMeeting.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <div className="mt-3 space-y-1">
                  {nextMeeting.agenda.map((a, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {a}</p>
                  ))}
                </div>
                <p className="text-xs text-warning mt-3 font-medium">{nextMeeting.pendingItems} pendências pré-reunião</p>
              </div>
            )}

            <div className="bg-card rounded-lg border border-border p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> Top Riscos
              </h3>
              <div className="space-y-3">
                {mockRisks.filter(r => r.status === 'aberto').slice(0, 3).map(r => (
                  <div key={r.id} className="border-l-2 pl-3" style={{ borderColor: r.probability === 'alto' ? 'hsl(var(--destructive))' : 'hsl(var(--warning))' }}>
                    <p className="text-xs font-medium text-foreground">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground">{r.projectName}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

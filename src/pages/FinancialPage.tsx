import PageHeader from '@/components/layout/PageHeader';
import { mockProjects, budgetData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const financialDetail = mockProjects.map(p => ({
  projeto: p.code,
  nome: p.name,
  baseline: p.budget,
  forecast: p.forecast,
  realizado: p.spent,
  desvio: ((p.forecast - p.budget) / p.budget * 100),
}));

export default function FinancialPage() {
  const totalBaseline = mockProjects.reduce((s, p) => s + p.budget, 0);
  const totalForecast = mockProjects.reduce((s, p) => s + p.forecast, 0);
  const totalSpent = mockProjects.reduce((s, p) => s + p.spent, 0);
  const fmt = (v: number) => `R$ ${(v / 1_000_000).toFixed(1)}M`;

  return (
    <div>
      <PageHeader title="Financeiro" subtitle="CAPEX/OPEX — Baseline, Forecast e Realizado" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="kpi-card"><span className="text-xs text-muted-foreground">Baseline Total</span><p className="text-xl font-bold text-foreground mt-1">{fmt(totalBaseline)}</p></div>
          <div className="kpi-card"><span className="text-xs text-muted-foreground">Forecast Total</span><p className="text-xl font-bold text-foreground mt-1">{fmt(totalForecast)}</p></div>
          <div className="kpi-card"><span className="text-xs text-muted-foreground">Realizado</span><p className="text-xl font-bold text-foreground mt-1">{fmt(totalSpent)}</p></div>
          <div className="kpi-card">
            <span className="text-xs text-muted-foreground">Desvio Forecast</span>
            <p className="text-xl font-bold mt-1" style={{ color: totalForecast > totalBaseline ? 'hsl(var(--destructive))' : 'hsl(var(--success))' }}>
              {((totalForecast - totalBaseline) / totalBaseline * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Comparativo Financeiro (R$ M)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="baseline" fill="hsl(var(--primary))" name="Baseline" radius={[2, 2, 0, 0]} />
              <Bar dataKey="forecast" fill="hsl(var(--warning))" name="Forecast" radius={[2, 2, 0, 0]} />
              <Bar dataKey="realizado" fill="hsl(var(--accent))" name="Realizado" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Baseline</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Forecast</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Realizado</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Desvio</th>
              </tr>
            </thead>
            <tbody>
              {financialDetail.map((f) => (
                <tr key={f.projeto} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><span className="font-mono text-xs text-muted-foreground mr-2">{f.projeto}</span><span className="font-medium text-foreground">{f.nome}</span></td>
                  <td className="px-4 py-3 text-right font-mono text-xs">R$ {(f.baseline / 1_000_000).toFixed(1)}M</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">R$ {(f.forecast / 1_000_000).toFixed(1)}M</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">R$ {(f.realizado / 1_000_000).toFixed(1)}M</td>
                  <td className="px-4 py-3 text-right font-medium text-xs" style={{ color: f.desvio > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))' }}>
                    {f.desvio > 0 ? '+' : ''}{f.desvio.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

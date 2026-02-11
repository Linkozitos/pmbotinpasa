import { useState } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { StatusBadge, HealthBar } from '@/components/shared/StatusComponents';
import { mockProjects, budgetData } from '@/data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';

const scatterData = mockProjects.map(p => ({
  name: p.name,
  valor: p.budget / 1_000_000,
  esforco: p.progress,
  status: p.status,
}));

const statusColors: Record<string, string> = {
  verde: 'hsl(152, 60%, 40%)',
  amarelo: 'hsl(38, 92%, 50%)',
  vermelho: 'hsl(0, 72%, 51%)',
};

export default function PortfolioPage() {
  const [search, setSearch] = useState('');
  const filtered = mockProjects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Portfólio" subtitle={`${mockProjects.length} projetos ativos`}>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
          <Search size={14} className="text-muted-foreground" />
          <input
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-48"
            placeholder="Buscar projeto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Orçamento por Projeto (R$ M)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={budgetData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={70} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="baseline" fill="hsl(var(--primary))" name="Baseline" radius={[0, 2, 2, 0]} />
                <Bar dataKey="forecast" fill="hsl(var(--warning))" name="Forecast" radius={[0, 2, 2, 0]} />
                <Bar dataKey="realizado" fill="hsl(var(--accent))" name="Realizado" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Valor × Progresso</h3>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="esforco" name="Progresso %" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="valor" name="Valor (R$M)" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <ZAxis range={[80, 300]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterData} name="Projetos">
                  {scatterData.map((entry, i) => (
                    <Cell key={i} fill={statusColors[entry.status] || 'hsl(var(--muted-foreground))'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Código</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Área</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-28">Saúde</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sponsor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Gerente</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Budget</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.code}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.area}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3"><HealthBar value={p.health} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.sponsor}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.gerente}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">R$ {(p.budget / 1_000_000).toFixed(1)}M</td>
                    <td className="px-4 py-3 text-right font-medium">{p.progress}%</td>
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

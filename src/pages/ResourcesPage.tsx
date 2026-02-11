import PageHeader from '@/components/layout/PageHeader';
import { Users, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const resourceData = [
  { area: 'TI', capacidade: 12, alocado: 14, disponivel: -2 },
  { area: 'Engenharia', capacidade: 20, alocado: 18, disponivel: 2 },
  { area: 'Operações', capacidade: 8, alocado: 6, disponivel: 2 },
  { area: 'Logística', capacidade: 6, alocado: 7, disponivel: -1 },
  { area: 'Jurídico', capacidade: 4, alocado: 3, disponivel: 1 },
  { area: 'PMO', capacidade: 3, alocado: 3, disponivel: 0 },
];

export default function ResourcesPage() {
  return (
    <div>
      <PageHeader title="Recursos & Capacidade" subtitle="Carga vs disponibilidade por área" />
      <div className="p-6 space-y-6">
        <div className="bg-card rounded-lg border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Capacidade vs Alocação por Área</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="capacidade" fill="hsl(var(--primary))" name="Capacidade" radius={[2, 2, 0, 0]} />
              <Bar dataKey="alocado" fill="hsl(var(--accent))" name="Alocado" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Área</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Capacidade</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Alocado</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Disponível</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {resourceData.map((r) => (
                <tr key={r.area} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{r.area}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{r.capacidade}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{r.alocado}</td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: r.disponivel < 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))' }}>
                    {r.disponivel > 0 ? `+${r.disponivel}` : r.disponivel}
                  </td>
                  <td className="px-4 py-3">
                    <span className={r.disponivel < 0 ? 'status-badge-red' : r.disponivel === 0 ? 'status-badge-yellow' : 'status-badge-green'}>
                      {r.disponivel < 0 ? 'Sobrecarregado' : r.disponivel === 0 ? 'Pleno' : 'Disponível'}
                    </span>
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

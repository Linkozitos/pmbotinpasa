import PageHeader from '@/components/layout/PageHeader';
import { mockRisks } from '@/data/mockData';
import { riskHeatmapData } from '@/data/mockData';
import { cn } from '@/lib/utils';

const probLabels = ['Alto', 'Médio', 'Baixo'];
const impLabels = ['Baixo', 'Médio', 'Alto'];

function getHeatColor(count: number) {
  if (count === 0) return 'bg-muted';
  if (count === 1) return 'bg-warning/20';
  return 'bg-destructive/20';
}

export default function RisksPage() {
  return (
    <div>
      <PageHeader title="Riscos & Issues" subtitle={`${mockRisks.length} riscos registrados`} />

      <div className="p-6 space-y-6">
        {/* Heatmap */}
        <div className="bg-card rounded-lg border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Heatmap de Riscos (Probabilidade × Impacto)</h3>
          <div className="flex gap-4">
            <div className="text-xs text-muted-foreground font-medium flex flex-col justify-around pr-2">
              {probLabels.map(l => <span key={l}>{l}</span>)}
            </div>
            <div className="grid grid-cols-3 gap-2 flex-1 max-w-md">
              {probLabels.map(prob =>
                impLabels.map(imp => {
                  const cell = riskHeatmapData.find(
                    d => d.probability === prob && d.impact === imp
                  );
                  const count = cell?.count ?? 0;
                  return (
                    <div
                      key={`${prob}-${imp}`}
                      className={cn("rounded-lg p-3 text-center transition-colors", getHeatColor(count))}
                    >
                      <p className="text-lg font-bold text-foreground">{count}</p>
                      {cell?.risks.slice(0, 1).map((r, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground mt-1 truncate">{r}</p>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-2">
            {impLabels.map(l => (
              <span key={l} className="text-xs text-muted-foreground font-medium">{l}</span>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1">Impacto →</p>
        </div>

        {/* Risk list */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risco</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Prob.</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Impacto</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Responsável</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Resposta</th>
                </tr>
              </thead>
              <tbody>
                {mockRisks.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{r.projectName}</td>
                    <td className="px-4 py-3">
                      <span className={r.probability === 'alto' ? 'status-badge-red' : r.probability === 'medio' ? 'status-badge-yellow' : 'status-badge-green'}>
                        {r.probability}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={r.impact === 'alto' ? 'status-badge-red' : r.impact === 'medio' ? 'status-badge-yellow' : 'status-badge-green'}>
                        {r.impact}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={r.status === 'aberto' ? 'status-badge-yellow' : r.status === 'mitigado' ? 'status-badge-green' : 'status-badge-blue'}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.owner}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{r.response}</td>
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

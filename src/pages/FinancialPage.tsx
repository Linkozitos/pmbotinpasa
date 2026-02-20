import { useState } from 'react';
import { Loader2, RefreshCw, DollarSign, FileText, Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { listBudgetLines, listContracts, listActualCosts, listForecastCosts } from '@/services/pmoService';
import { translateSupabaseError } from '@/lib/supabaseErrors';
import { cn } from '@/lib/utils';

export default function FinancialPage() {
  const [tab, setTab] = useState<'budget' | 'contracts'>('budget');

  const { data: budgetLines, isLoading: loadingB, error: errorB, refetch: refetchB } = useQuery({
    queryKey: ['budget_lines'],
    queryFn: () => listBudgetLines(),
  });

  const { data: contracts, isLoading: loadingC, error: errorC, refetch: refetchC } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => listContracts(),
  });

  const isLoading = tab === 'budget' ? loadingB : loadingC;
  const error = tab === 'budget' ? errorB : errorC;
  const refetch = tab === 'budget' ? refetchB : refetchC;

  const totalBaseline = (budgetLines || []).reduce((s, b) => s + (b.baseline_amount || 0), 0);
  const totalForecast = (budgetLines || []).reduce((s, b) => s + (b.forecast_amount || 0), 0);
  const totalActual = (budgetLines || []).reduce((s, b) => s + (b.actual_amount || 0), 0);
  const fmt = (v: number) => `R$ ${(v / 1_000_000).toFixed(1)}M`;

  return (
    <div>
      <PageHeader title="Financeiro" subtitle="CAPEX/OPEX — Baseline, Forecast e Realizado" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="kpi-card"><span className="text-xs text-muted-foreground">Baseline Total</span><p className="text-xl font-bold text-foreground mt-1">{totalBaseline > 0 ? fmt(totalBaseline) : '—'}</p></div>
          <div className="kpi-card"><span className="text-xs text-muted-foreground">Forecast Total</span><p className="text-xl font-bold text-foreground mt-1">{totalForecast > 0 ? fmt(totalForecast) : '—'}</p></div>
          <div className="kpi-card"><span className="text-xs text-muted-foreground">Realizado</span><p className="text-xl font-bold text-foreground mt-1">{totalActual > 0 ? fmt(totalActual) : '—'}</p></div>
          <div className="kpi-card">
            <span className="text-xs text-muted-foreground">Desvio Forecast</span>
            <p className="text-xl font-bold mt-1" style={{ color: totalBaseline > 0 && totalForecast > totalBaseline ? 'hsl(var(--destructive))' : 'hsl(var(--success))' }}>
              {totalBaseline > 0 ? `${((totalForecast - totalBaseline) / totalBaseline * 100).toFixed(1)}%` : '—'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          <button onClick={() => setTab('budget')} className={cn('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors', tab === 'budget' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground')}>
            Orçamento ({budgetLines?.length ?? '...'})
          </button>
          <button onClick={() => setTab('contracts')} className={cn('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors', tab === 'contracts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground')}>
            Contratos ({contracts?.length ?? '...'})
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-accent mr-2" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-destructive">{translateSupabaseError(error)}</p>
            <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-accent text-accent-foreground">
              <RefreshCw size={14} /> Tentar novamente
            </button>
          </div>
        ) : tab === 'budget' ? (
          (budgetLines || []).length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
              <DollarSign size={48} className="mx-auto text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum orçamento registrado</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Não há linhas orçamentárias (CAPEX/OPEX) cadastradas para os projetos.
              </p>
              <button 
                disabled
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium opacity-50 cursor-not-allowed"
              >
                <Plus size={18} /> Adicionar Linha Orçamentária
              </button>
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Categoria</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Baseline</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Forecast</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Realizado</th>
                  </tr>
                </thead>
                <tbody>
                  {(budgetLines || []).map((b: any) => (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-foreground">{b.projects?.name || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground uppercase text-xs">{b.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.category || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">R$ {((b.baseline_amount || 0) / 1_000).toFixed(0)}k</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">R$ {((b.forecast_amount || 0) / 1_000).toFixed(0)}k</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">R$ {((b.actual_amount || 0) / 1_000).toFixed(0)}k</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          (contracts || []).length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
              <FileText size={48} className="mx-auto text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum contrato registrado</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Não há contratos de fornecedores ou serviços vinculados aos projetos.
              </p>
              <button 
                disabled
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium opacity-50 cursor-not-allowed"
              >
                <Plus size={18} /> Registrar Contrato
              </button>
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Número</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fornecedor</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Início</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fim</th>
                  </tr>
                </thead>
                <tbody>
                  {(contracts || []).map((c: any) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.contract_number || '—'}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{c.vendor_name}</td>
                      <td className="px-4 py-3"><span className="status-badge capitalize">{c.status?.replace('_', ' ')}</span></td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{c.total_value ? `R$ ${(c.total_value / 1_000).toFixed(0)}k` : '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.start_date ? new Date(c.start_date).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.end_date ? new Date(c.end_date).toLocaleDateString('pt-BR') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

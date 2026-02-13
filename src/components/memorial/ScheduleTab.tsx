import React, { useState, useEffect } from 'react';
import { Upload, Download, FileDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleItem {
  id: string;
  uid: string;
  wbs: string | null;
  activity_name: string;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  completion_pct: number;
  observations: string | null;
}

interface ProgressResult {
  uid: string;
  activity_name: string;
  old_pct: number;
  new_pct: number;
  diff: number;
}

export default function ScheduleTab() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [progressResults, setProgressResults] = useState<ProgressResult[]>([]);
  const [fetching, setFetching] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('schedule_items')
      .select('*')
      .order('wbs');
    setItems((data as ScheduleItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleFetchProgress = async () => {
    setFetching(true);
    const results: ProgressResult[] = [];

    for (const item of items) {
      // Get all memory records with this UID
      const { data: records } = await supabase
        .from('memory_records')
        .select('weight_kg, advanced_weight_kg')
        .eq('uid', item.uid);

      if (!records || records.length === 0) continue;

      const totalWeight = records.reduce((s, r) => s + (r.weight_kg || 0), 0);
      const advancedWeight = records.reduce((s, r) => s + (r.advanced_weight_kg || 0), 0);
      const newPct = totalWeight > 0 ? (advancedWeight / totalWeight) * 100 : 0;

      if (Math.abs(newPct - item.completion_pct) > 0.01) {
        results.push({
          uid: item.uid,
          activity_name: item.activity_name,
          old_pct: item.completion_pct,
          new_pct: newPct,
          diff: newPct - item.completion_pct,
        });

        await supabase
          .from('schedule_items')
          .update({ completion_pct: Math.round(newPct * 100) / 100 })
          .eq('id', item.id);
      }
    }

    setProgressResults(results);
    setShowResults(true);
    setFetching(false);
    fetchItems();
  };

  const filtered = items.filter((i) => {
    const s = search.toLowerCase();
    return (
      i.uid.toLowerCase().includes(s) ||
      i.activity_name.toLowerCase().includes(s) ||
      (i.wbs || '').toLowerCase().includes(s)
    );
  });

  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar por UID, WBS ou atividade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload size={14} className="mr-1" /> Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download size={14} className="mr-1" /> Exportar
          </Button>
          <Button variant="outline" size="sm">
            <FileDown size={14} className="mr-1" /> Template
          </Button>
          <Button size="sm" onClick={handleFetchProgress} disabled={fetching || items.length === 0}>
            <RefreshCw size={14} className={`mr-1 ${fetching ? 'animate-spin' : ''}`} />
            Buscar Avanços
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="[&_th]:sticky [&_th]:top-0 [&_th]:bg-card [&_th]:z-10">
              <TableHead>UID</TableHead>
              <TableHead>WBS</TableHead>
              <TableHead>Nome da Atividade</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Término</TableHead>
              <TableHead className="text-right">Duração (dias)</TableHead>
              <TableHead className="text-right">% Concluído</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Nenhuma atividade no cronograma. Importe dados do MS Project para começar.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.uid}</TableCell>
                  <TableCell className="font-mono text-xs">{item.wbs || '—'}</TableCell>
                  <TableCell className="font-medium">{item.activity_name}</TableCell>
                  <TableCell className="text-xs">
                    {item.start_date ? new Date(item.start_date).toLocaleDateString('pt-BR') : '—'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.end_date ? new Date(item.end_date).toLocaleDateString('pt-BR') : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{item.duration_days ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={item.completion_pct >= 80 ? 'default' : item.completion_pct >= 40 ? 'secondary' : 'outline'}
                    >
                      {fmt(item.completion_pct)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-40 truncate">
                    {item.observations || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Progress Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resultado da Atualização de Avanços</DialogTitle>
          </DialogHeader>

          {progressResults.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma atividade foi atualizada. Os UIDs do cronograma não possuem registros correspondentes nas memórias.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">
                <strong>{progressResults.length}</strong> atividade(s) atualizada(s).
              </p>

              {/* Top increases */}
              {progressResults.filter((r) => r.diff > 0).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Maiores aumentos</p>
                  {progressResults
                    .filter((r) => r.diff > 0)
                    .sort((a, b) => b.diff - a.diff)
                    .slice(0, 10)
                    .map((r) => (
                      <div key={r.uid} className="flex justify-between text-xs py-1 border-b border-border last:border-0">
                        <span className="truncate max-w-60">{r.activity_name}</span>
                        <span className="text-primary font-mono">+{fmt(r.diff)}%</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Top decreases */}
              {progressResults.filter((r) => r.diff < 0).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Maiores reduções</p>
                  {progressResults
                    .filter((r) => r.diff < 0)
                    .sort((a, b) => a.diff - b.diff)
                    .slice(0, 10)
                    .map((r) => (
                      <div key={r.uid} className="flex justify-between text-xs py-1 border-b border-border last:border-0">
                        <span className="truncate max-w-60">{r.activity_name}</span>
                        <span className="text-destructive font-mono">{fmt(r.diff)}%</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowResults(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

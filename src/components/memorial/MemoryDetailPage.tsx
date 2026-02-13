import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, Download, FileDown, Group, Ungroup, Filter, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import RecordCriteriaModal from './RecordCriteriaModal';
import CriteriaConfigDialog from './CriteriaConfigDialog';
import PageHeader from '@/components/layout/PageHeader';

interface Memory {
  id: string;
  name: string;
  discipline: string | null;
  total_weight_kg: number;
  advanced_weight_kg: number;
  progress_pct: number;
}

interface Criterion {
  id: string;
  name: string;
  weight_pct: number;
  type: string;
  sort_order: number;
}

interface MemoryRecord {
  id: string;
  uid: string | null;
  area: string | null;
  line_tag: string | null;
  unit: string | null;
  quantity: number | null;
  gauge: string | null;
  main_material: string | null;
  code: string | null;
  weight_kg: number;
  advanced_weight_kg: number;
  progress_pct: number;
  company: string | null;
  front: string | null;
  observations: string | null;
  priority: string | null;
}

export default function MemoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [records, setRecords] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<string>('none');
  const [selectedRecord, setSelectedRecord] = useState<MemoryRecord | null>(null);
  const [showCriteriaConfig, setShowCriteriaConfig] = useState(false);
  const [showNewRecord, setShowNewRecord] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const [memRes, critRes, recRes] = await Promise.all([
      supabase.from('calculation_memories').select('*').eq('id', id).single(),
      supabase.from('memory_criteria').select('*').eq('memory_id', id).order('sort_order'),
      supabase.from('memory_records').select('*').eq('memory_id', id).order('created_at'),
    ]);

    setMemory(memRes.data as Memory | null);
    setCriteria((critRes.data as Criterion[]) || []);
    setRecords((recRes.data as MemoryRecord[]) || []);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddRecord = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('memory_records')
      .insert({ memory_id: id, weight_kg: 0 })
      .select()
      .single();
    if (data) {
      setRecords((prev) => [...prev, data as MemoryRecord]);
    }
  };

  const recalcMemoryTotals = async () => {
    if (!id) return;
    const { data: recs } = await supabase
      .from('memory_records')
      .select('weight_kg, advanced_weight_kg')
      .eq('memory_id', id);
    if (!recs) return;

    const totalWeight = recs.reduce((s, r) => s + (r.weight_kg || 0), 0);
    const advancedWeight = recs.reduce((s, r) => s + (r.advanced_weight_kg || 0), 0);
    const progressPct = totalWeight > 0 ? (advancedWeight / totalWeight) * 100 : 0;

    await supabase.from('calculation_memories').update({
      total_weight_kg: totalWeight,
      advanced_weight_kg: advancedWeight,
      progress_pct: progressPct,
    }).eq('id', id);

    setMemory((prev) => prev ? { ...prev, total_weight_kg: totalWeight, advanced_weight_kg: advancedWeight, progress_pct: progressPct } : prev);
  };

  const handleRecordSaved = () => {
    fetchData();
    recalcMemoryTotals();
    setSelectedRecord(null);
  };

  const filtered = records.filter((r) => {
    const s = search.toLowerCase();
    return (
      (r.uid || '').toLowerCase().includes(s) ||
      (r.area || '').toLowerCase().includes(s) ||
      (r.line_tag || '').toLowerCase().includes(s) ||
      (r.code || '').toLowerCase().includes(s) ||
      (r.main_material || '').toLowerCase().includes(s)
    );
  });

  const grouped = useMemo(() => {
    if (groupBy === 'none') return { '': filtered };
    const map: Record<string, MemoryRecord[]> = {};
    filtered.forEach((r) => {
      const key = (r as any)[groupBy] || 'Sem classificação';
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [filtered, groupBy]);

  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

  if (loading) {
    return <div className="p-6 text-muted-foreground">Carregando...</div>;
  }

  if (!memory) {
    return <div className="p-6 text-muted-foreground">Memória não encontrada.</div>;
  }

  const criteriaSumOk = criteria.reduce((s, c) => s + c.weight_pct, 0) === 100;

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/memorial')}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{memory.name}</h1>
          {memory.discipline && (
            <Badge variant="secondary" className="mt-1">{memory.discipline}</Badge>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Peso Total" value={`${fmt(memory.total_weight_kg)} kg`} />
        <KpiCard label="Peso Avançado" value={`${fmt(memory.advanced_weight_kg)} kg`} />
        <KpiCard label="Avanço Geral" value={`${fmt(memory.progress_pct)}%`} highlight />
      </div>

      {/* Criteria warning */}
      {criteria.length === 0 && (
        <div className="bg-accent/50 border border-accent rounded-lg p-4 text-sm text-accent-foreground">
          ⚠️ Nenhum critério configurado. <button className="underline font-medium" onClick={() => setShowCriteriaConfig(true)}>Configure os critérios</button> antes de adicionar registros.
        </div>
      )}

      {criteria.length > 0 && !criteriaSumOk && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive">
          ⚠️ A soma dos pesos dos critérios é {criteria.reduce((s, c) => s + c.weight_pct, 0)}%. Deve ser exatamente 100%.{' '}
          <button className="underline font-medium" onClick={() => setShowCriteriaConfig(true)}>Corrigir critérios</button>
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Buscar registros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Agrupar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem agrupamento</SelectItem>
              <SelectItem value="area">Área</SelectItem>
              <SelectItem value="company">Empresa</SelectItem>
              <SelectItem value="front">Frente</SelectItem>
              <SelectItem value="uid">UID</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCriteriaConfig(true)}>
            Critérios
          </Button>
          <Button variant="outline" size="sm">
            <Upload size={14} className="mr-1" /> Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download size={14} className="mr-1" /> Exportar
          </Button>
          <Button size="sm" onClick={handleAddRecord} disabled={criteria.length === 0 || !criteriaSumOk}>
            <Plus size={14} className="mr-1" /> Novo Registro
          </Button>
        </div>
      </div>

      {/* Records table */}
      <div className="rounded-lg border border-border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="[&_th]:sticky [&_th]:top-0 [&_th]:bg-card [&_th]:z-10">
              <TableHead>UID</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Tag / Linha</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="text-right">Peso (kg)</TableHead>
              <TableHead className="text-right">Avançado (kg)</TableHead>
              <TableHead className="text-right">Avanço</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Frente</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(grouped).map(([group, recs]) => (
              <React.Fragment key={group}>
                {group && groupBy !== 'none' && (
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={10} className="font-semibold text-xs uppercase tracking-wide py-2">
                      {group} — {fmt(recs.reduce((s, r) => s + r.weight_kg, 0))} kg total, {fmt(recs.reduce((s, r) => s + r.advanced_weight_kg, 0))} kg avançado (
                      {fmt(recs.reduce((s, r) => s + r.weight_kg, 0) > 0
                        ? (recs.reduce((s, r) => s + r.advanced_weight_kg, 0) / recs.reduce((s, r) => s + r.weight_kg, 0)) * 100
                        : 0
                      )}%)
                    </TableCell>
                  </TableRow>
                )}
                {recs.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedRecord(r)}
                  >
                    <TableCell className="font-mono text-xs">{r.uid || '—'}</TableCell>
                    <TableCell>{r.area || '—'}</TableCell>
                    <TableCell>{r.line_tag || '—'}</TableCell>
                    <TableCell>{r.main_material || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{r.code || '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(r.weight_kg)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(r.advanced_weight_kg)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={r.progress_pct >= 80 ? 'default' : r.progress_pct >= 40 ? 'secondary' : 'outline'}>
                        {fmt(r.progress_pct)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{r.company || '—'}</TableCell>
                    <TableCell className="text-xs">{r.front || '—'}</TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Criteria Modal */}
      {selectedRecord && (
        <RecordCriteriaModal
          record={selectedRecord}
          criteria={criteria}
          memoryId={memory.id}
          onClose={() => setSelectedRecord(null)}
          onSaved={handleRecordSaved}
        />
      )}

      {/* Criteria Config Dialog */}
      {showCriteriaConfig && (
        <CriteriaConfigDialog
          memoryId={memory.id}
          criteria={criteria}
          onClose={() => setShowCriteriaConfig(false)}
          onSaved={() => { fetchData(); setShowCriteriaConfig(false); }}
        />
      )}
    </div>
  );
}

function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}

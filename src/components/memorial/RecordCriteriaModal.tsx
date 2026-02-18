import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Criterion {
  id: string;
  name: string;
  weight_pct: number;
  type: string;
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

interface CriterionValue {
  criterion_id: string;
  completion_pct: number;
  observation: string;
}

interface Props {
  record: MemoryRecord;
  criteria: Criterion[];
  memoryId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function RecordCriteriaModal({ record, criteria, memoryId, onClose, onSaved }: Props) {
  const [recordData, setRecordData] = useState({ ...record });
  const [criteriaValues, setCriteriaValues] = useState<CriterionValue[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchValues = async () => {
      const { data } = await supabase
        .from('memory_record_criteria')
        .select('criterion_id, completion_pct, observation')
        .eq('record_id', record.id);

      const existing = (data || []) as CriterionValue[];
      const values = criteria.map((c) => {
        const found = existing.find((v) => v.criterion_id === c.id);
        return {
          criterion_id: c.id,
          completion_pct: found?.completion_pct || 0,
          observation: found?.observation || '',
        };
      });
      setCriteriaValues(values);
    };
    fetchValues();
  }, [record.id, criteria]);

  const updateCriterionValue = (criterionId: string, field: string, value: any) => {
    setCriteriaValues((prev) =>
      prev.map((v) => (v.criterion_id === criterionId ? { ...v, [field]: value } : v))
    );
  };

  const setAll = (pct: number) => {
    setCriteriaValues((prev) => prev.map((v) => ({ ...v, completion_pct: pct })));
  };

  const calcAdvanced = () => {
    let advancedKg = 0;
    for (const cv of criteriaValues) {
      const criterion = criteria.find((c) => c.id === cv.criterion_id);
      if (!criterion) continue;
      // Calcula a contribuição deste critério para o peso avançado
      const contribution = recordData.weight_kg * (criterion.weight_pct / 100) * (cv.completion_pct / 100);
      advancedKg += contribution;
    }
    // Arredonda para 4 casas decimais para evitar problemas de precisão de ponto flutuante
    return Math.round(advancedKg * 10000) / 10000;
  };

  const advancedKg = calcAdvanced();
  const progressPct = recordData.weight_kg > 0 ? (advancedKg / recordData.weight_kg) * 100 : 0;

  const handleSave = async () => {
    setSaving(true);

    // Update record data
    await supabase
      .from('memory_records')
      .update({
        uid: recordData.uid,
        area: recordData.area,
        line_tag: recordData.line_tag,
        unit: recordData.unit,
        quantity: recordData.quantity,
        gauge: recordData.gauge,
        main_material: recordData.main_material,
        code: recordData.code,
        weight_kg: recordData.weight_kg,
        advanced_weight_kg: advancedKg,
        progress_pct: progressPct,
        company: recordData.company,
        front: recordData.front,
        observations: recordData.observations,
        priority: recordData.priority,
      })
      .eq('id', record.id);

    // Upsert criteria values
    for (const cv of criteriaValues) {
      await supabase
        .from('memory_record_criteria')
        .upsert(
          {
            record_id: record.id,
            criterion_id: cv.criterion_id,
            completion_pct: cv.completion_pct,
            observation: cv.observation,
          },
          { onConflict: 'record_id,criterion_id' }
        );
    }

    setSaving(false);
    onSaved();
  };

  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atualizar Registro</DialogTitle>
        </DialogHeader>

        {/* Record fields */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="UID" value={recordData.uid || ''} onChange={(v) => setRecordData({ ...recordData, uid: v })} />
          <Field label="Área" value={recordData.area || ''} onChange={(v) => setRecordData({ ...recordData, area: v })} />
          <Field label="Tag / Linha" value={recordData.line_tag || ''} onChange={(v) => setRecordData({ ...recordData, line_tag: v })} />
          <Field label="Unidade" value={recordData.unit || ''} onChange={(v) => setRecordData({ ...recordData, unit: v })} />
          <Field label="Material Principal" value={recordData.main_material || ''} onChange={(v) => setRecordData({ ...recordData, main_material: v })} />
          <Field label="Código" value={recordData.code || ''} onChange={(v) => setRecordData({ ...recordData, code: v })} />
          <Field label="Bitola" value={recordData.gauge || ''} onChange={(v) => setRecordData({ ...recordData, gauge: v })} />
          <div className="space-y-1">
            <Label className="text-xs">Peso (kg)</Label>
            <Input
              type="number"
              value={recordData.weight_kg}
              onChange={(e) => setRecordData({ ...recordData, weight_kg: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <Field label="Empresa" value={recordData.company || ''} onChange={(v) => setRecordData({ ...recordData, company: v })} />
          <Field label="Frente" value={recordData.front || ''} onChange={(v) => setRecordData({ ...recordData, front: v })} />
        </div>

        {/* Criteria */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Critérios de Avanço</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAll(100)}>Marcar todos 100%</Button>
              <Button variant="outline" size="sm" onClick={() => setAll(0)}>Zerar</Button>
            </div>
          </div>

          {criteria.map((c) => {
            const cv = criteriaValues.find((v) => v.criterion_id === c.id);
            if (!cv) return null;
            const contribution = recordData.weight_kg * (c.weight_pct / 100) * (cv.completion_pct / 100);

            return (
              <div key={c.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.name}</span>
                    <Badge variant="outline" className="text-xs">{c.weight_pct}%</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{fmt(contribution)} kg</span>
                </div>

                {c.type === 'binary' ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={cv.completion_pct === 100}
                      onCheckedChange={(checked) => updateCriterionValue(c.id, 'completion_pct', checked ? 100 : 0)}
                    />
                    <span className="text-sm">{cv.completion_pct === 100 ? 'Concluído' : 'Pendente'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[cv.completion_pct]}
                      onValueChange={([v]) => updateCriterionValue(c.id, 'completion_pct', v)}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-right">{cv.completion_pct}%</span>
                  </div>
                )}

                <Input
                  placeholder="Observação do critério..."
                  value={cv.observation}
                  onChange={(e) => updateCriterionValue(c.id, 'observation', e.target.value)}
                  className="text-xs"
                />
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-muted/50 rounded-lg p-4 flex justify-between items-center mt-2">
          <div>
            <p className="text-xs text-muted-foreground">Peso Avançado</p>
            <p className="text-lg font-bold">{fmt(advancedKg)} kg</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Avanço do Registro</p>
            <p className="text-lg font-bold text-primary">{fmt(progressPct)}%</p>
          </div>
        </div>

        {/* Observations */}
        <div className="space-y-1">
          <Label className="text-xs">Observações gerais</Label>
          <Textarea
            value={recordData.observations || ''}
            onChange={(e) => setRecordData({ ...recordData, observations: e.target.value })}
            rows={2}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

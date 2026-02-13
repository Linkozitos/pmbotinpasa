import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Criterion {
  id: string;
  name: string;
  weight_pct: number;
  type: string;
  sort_order: number;
}

interface Props {
  memoryId: string;
  criteria: Criterion[];
  onClose: () => void;
  onSaved: () => void;
}

interface LocalCriterion {
  id?: string;
  name: string;
  weight_pct: number;
  type: string;
  sort_order: number;
  isNew?: boolean;
  toDelete?: boolean;
}

export default function CriteriaConfigDialog({ memoryId, criteria, onClose, onSaved }: Props) {
  const [items, setItems] = useState<LocalCriterion[]>(
    criteria.map((c) => ({ ...c }))
  );
  const [saving, setSaving] = useState(false);

  const totalWeight = items.filter((i) => !i.toDelete).reduce((s, i) => s + i.weight_pct, 0);
  const isValid = totalWeight === 100 && items.filter((i) => !i.toDelete).every((i) => i.name.trim());

  const addCriterion = () => {
    setItems((prev) => [
      ...prev,
      { name: '', weight_pct: 0, type: 'slider', sort_order: prev.length, isNew: true },
    ]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const toggleDelete = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, toDelete: !item.toDelete } : item))
    );
  };

  const handleSave = async () => {
    setSaving(true);

    // Delete removed
    const toDelete = items.filter((i) => i.toDelete && i.id);
    for (const item of toDelete) {
      await supabase.from('memory_criteria').delete().eq('id', item.id!);
    }

    // Upsert remaining
    const remaining = items.filter((i) => !i.toDelete);
    for (let idx = 0; idx < remaining.length; idx++) {
      const item = remaining[idx];
      if (item.id) {
        await supabase.from('memory_criteria').update({
          name: item.name,
          weight_pct: item.weight_pct,
          type: item.type,
          sort_order: idx,
        }).eq('id', item.id);
      } else {
        await supabase.from('memory_criteria').insert({
          memory_id: memoryId,
          name: item.name,
          weight_pct: item.weight_pct,
          type: item.type,
          sort_order: idx,
        });
      }
    }

    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Critérios de Avanço</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">
          A soma dos pesos deve ser exatamente 100%.
        </p>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 border rounded-lg p-2 ${item.toDelete ? 'opacity-40' : ''}`}
            >
              <GripVertical size={14} className="text-muted-foreground shrink-0" />
              <Input
                placeholder="Nome do critério"
                value={item.name}
                onChange={(e) => updateItem(idx, 'name', e.target.value)}
                className="flex-1 text-sm"
                disabled={item.toDelete}
              />
              <Input
                type="number"
                value={item.weight_pct}
                onChange={(e) => updateItem(idx, 'weight_pct', parseFloat(e.target.value) || 0)}
                className="w-20 text-sm text-right"
                disabled={item.toDelete}
              />
              <span className="text-xs text-muted-foreground">%</span>
              <Select value={item.type} onValueChange={(v) => updateItem(idx, 'type', v)} disabled={item.toDelete}>
                <SelectTrigger className="w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slider">Slider</SelectItem>
                  <SelectItem value="binary">Binário</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => toggleDelete(idx)}>
                <Trash2 size={14} className={item.toDelete ? 'text-muted-foreground' : 'text-destructive'} />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addCriterion} className="w-full">
          <Plus size={14} className="mr-1" /> Adicionar Critério
        </Button>

        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <span className="text-sm font-medium">Total</span>
          <Badge variant={totalWeight === 100 ? 'default' : 'destructive'}>
            {totalWeight}%
          </Badge>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!isValid || saving}>
            {saving ? 'Salvando...' : 'Salvar Critérios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  item?: any;
  type: 'budget' | 'contract';
}

export default function FinancialDialog({ open, onOpenChange, onSuccess, item, type }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('id, name').is('deleted_at', null);
      if (data) setProjects(data);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (item) {
      if (type === 'budget') {
        setFormData({
          project_id: item.project_id || '',
          type: item.type || 'capex',
          category: item.category || '',
          baseline_amount: item.baseline_amount || 0,
          forecast_amount: item.forecast_amount || 0,
          actual_amount: item.actual_amount || 0,
        });
      } else {
        setFormData({
          project_id: item.project_id || '',
          contract_number: item.contract_number || '',
          vendor_name: item.vendor_name || '',
          total_value: item.total_value || 0,
          status: item.status || 'active',
          start_date: item.start_date ? item.start_date.split('T')[0] : '',
          end_date: item.end_date ? item.end_date.split('T')[0] : '',
        });
      }
    } else {
      if (type === 'budget') {
        setFormData({
          project_id: '',
          type: 'capex',
          category: '',
          baseline_amount: 0,
          forecast_amount: 0,
          actual_amount: 0,
        });
      } else {
        setFormData({
          project_id: '',
          contract_number: '',
          vendor_name: '',
          total_value: 0,
          status: 'active',
          start_date: '',
          end_date: '',
        });
      }
    }
  }, [item, open, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id) return;

    setLoading(true);
    try {
      const table = type === 'budget' ? 'budget_lines' : 'contracts';
      let error;
      
      if (item) {
        const { error: updateError } = await supabase
          .from(table)
          .update(formData)
          .eq('id', item.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from(table)
          .insert([formData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Dados financeiros salvos com sucesso.',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !window.confirm('Tem certeza que deseja excluir este registro?')) return;

    setLoading(true);
    try {
      const table = type === 'budget' ? 'budget_lines' : 'contracts';
      // Budget lines não tem deleted_at no schema padrão, mas contracts tem. 
      // Vou tentar deletar fisicamente se não houver deleted_at.
      let error;
      if (type === 'contract') {
        const { error: delError } = await supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', item.id);
        error = delError;
      } else {
        const { error: delError } = await supabase.from(table).delete().eq('id', item.id);
        error = delError;
      }

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Excluído com sucesso.',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar' : 'Novo'} {type === 'budget' ? 'Orçamento' : 'Contrato'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Projeto</Label>
            <Select
              value={formData.project_id}
              onValueChange={(v) => setFormData({ ...formData, project_id: v })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === 'budget' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="capex">CAPEX</SelectItem>
                      <SelectItem value="opex">OPEX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="Ex: Equipamentos" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>Baseline</Label>
                  <Input type="number" value={formData.baseline_amount} onChange={(e) => setFormData({...formData, baseline_amount: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Forecast</Label>
                  <Input type="number" value={formData.forecast_amount} onChange={(e) => setFormData({...formData, forecast_amount: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Actual</Label>
                  <Input type="number" value={formData.actual_amount} onChange={(e) => setFormData({...formData, actual_amount: Number(e.target.value)})} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número do Contrato</Label>
                  <Input value={formData.contract_number} onChange={(e) => setFormData({...formData, contract_number: e.target.value})} placeholder="Ex: CT-2026-001" />
                </div>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Input value={formData.vendor_name} onChange={(e) => setFormData({...formData, vendor_name: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Total</Label>
                  <Input type="number" value={formData.total_value} onChange={(e) => setFormData({...formData, total_value: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="terminated">Rescindido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
            </>
          )}

          <DialogFooter className="flex justify-between items-center">
            {item && (
              <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={handleDelete} disabled={loading}>
                <Trash2 size={16} className="mr-2" /> Excluir
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

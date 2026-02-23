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
import { Trash2, Plus, X } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  resource?: any;
}

export default function ResourceDialog({ open, onOpenChange, onSuccess, resource }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    role_title: '',
    type: 'human',
    email: '',
  });
  const [allocations, setAllocations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pData } = await supabase.from('projects').select('id, name').is('deleted_at', null);
      if (pData) setProjects(pData);
      
      if (resource) {
        const { data: aData } = await supabase.from('allocations').select('*').eq('resource_id', resource.id);
        if (aData) setAllocations(aData);
      }
    };
    fetchData();
  }, [resource, open]);

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        role_title: resource.role_title || '',
        type: resource.type || 'human',
        email: resource.email || '',
      });
    } else {
      setFormData({
        name: '',
        role_title: '',
        type: 'human',
        email: '',
      });
      setAllocations([]);
    }
  }, [resource, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    try {
      let resId = resource?.id;
      
      if (resource) {
        const { error } = await supabase.from('resources').update(formData).eq('id', resource.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('resources').insert([formData]).select().single();
        if (error) throw error;
        resId = data.id;
      }

      // Sincronizar alocações (simplificado: deleta e reinsere)
      await supabase.from('allocations').delete().eq('resource_id', resId);
      if (allocations.length > 0) {
        const { error: allocError } = await supabase.from('allocations').insert(
          allocations.map(a => ({
            resource_id: resId,
            project_id: a.project_id,
            allocation_pct: a.allocation_pct || 100,
          }))
        );
        if (allocError) throw allocError;
      }

      toast({ title: 'Sucesso!', description: 'Recurso salvo com sucesso.' });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addAllocation = () => {
    if (projects.length > 0) {
      setAllocations([...allocations, { project_id: projects[0].id, allocation_pct: 100 }]);
    }
  };

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const updateAllocation = (index: number, field: string, value: any) => {
    const newAllocs = [...allocations];
    newAllocs[index] = { ...newAllocs[index], [field]: value };
    setAllocations(newAllocs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{resource ? 'Editar Recurso' : 'Novo Recurso'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Cargo/Função</Label>
              <Input value={formData.role_title} onChange={(e) => setFormData({...formData, role_title: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="human">Humano</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="equipment">Equipamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Alocações em Projetos</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addAllocation} className="h-7 text-xs">
                <Plus size={12} className="mr-1" /> Adicionar
              </Button>
            </div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
              {allocations.map((alloc, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                  <Select value={alloc.project_id} onValueChange={(v) => updateAllocation(i, 'project_id', v)}>
                    <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1 w-20">
                    <Input 
                      type="number" 
                      className="h-8 text-xs px-1" 
                      value={alloc.allocation_pct} 
                      onChange={(e) => updateAllocation(i, 'allocation_pct', Number(e.target.value))} 
                    />
                    <span className="text-[10px] text-muted-foreground">%</span>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeAllocation(i)}>
                    <X size={14} />
                  </Button>
                </div>
              ))}
              {allocations.length === 0 && <p className="text-[10px] text-center text-muted-foreground py-2">Nenhuma alocação definida.</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

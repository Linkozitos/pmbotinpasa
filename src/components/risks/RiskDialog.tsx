import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  item?: any; // Risco ou Issue para edição
  type: 'risk' | 'issue';
}

export default function RiskDialog({ open, onOpenChange, onSuccess, item, type }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    status: 'aberto',
    probability: 3,
    impact: 3,
    severity: 3,
    response_strategy: '',
    sla_due_date: '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('id, name').is('deleted_at', null);
      if (data) setProjects(data);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        project_id: item.project_id || '',
        status: item.status || 'aberto',
        probability: item.probability || 3,
        impact: item.impact || 3,
        severity: item.severity || 3,
        response_strategy: item.response_strategy || '',
        sla_due_date: item.sla_due_date ? item.sla_due_date.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        project_id: '',
        status: 'aberto',
        probability: 3,
        impact: 3,
        severity: 3,
        response_strategy: '',
        sla_due_date: '',
      });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.project_id) return;

    setLoading(true);
    try {
      const table = type === 'risk' ? 'risks' : 'issues';
      const payload: any = {
        title: formData.title,
        description: formData.description || null,
        project_id: formData.project_id,
        status: formData.status as any,
      };

      if (type === 'risk') {
        payload.probability = Number(formData.probability);
        payload.impact = Number(formData.impact);
        payload.score = payload.probability * payload.impact;
        payload.response_strategy = formData.response_strategy || null;
      } else {
        payload.severity = Number(formData.severity);
        payload.sla_due_date = formData.sla_due_date || null;
      }

      let error;
      if (item) {
        const { error: updateError } = await supabase
          .from(table)
          .update(payload)
          .eq('id', item.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from(table)
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: `${type === 'risk' ? 'Risco' : 'Issue'} salvo com sucesso.`,
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
    if (!item || !window.confirm(`Tem certeza que deseja excluir este ${type === 'risk' ? 'risco' : 'issue'}?`)) return;

    setLoading(true);
    try {
      const table = type === 'risk' ? 'risks' : 'issues';
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', item.id);

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
          <DialogTitle>{item ? `Editar ${type === 'risk' ? 'Risco' : 'Issue'}` : `Novo ${type === 'risk' ? 'Risco' : 'Issue'}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project">Projeto</Label>
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

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título curto e claro"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Detalhes sobre o item..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  {type === 'risk' ? (
                    <SelectItem value="mitigando">Mitigando</SelectItem>
                  ) : (
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  )}
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === 'risk' ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Prob. (1-5)</Label>
                  <Input 
                    type="number" min="1" max="5" 
                    value={formData.probability} 
                    onChange={(e) => setFormData({...formData, probability: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Imp. (1-5)</Label>
                  <Input 
                    type="number" min="1" max="5" 
                    value={formData.impact} 
                    onChange={(e) => setFormData({...formData, impact: Number(e.target.value)})} 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Severidade (1-5)</Label>
                <Input 
                  type="number" min="1" max="5" 
                  value={formData.severity} 
                  onChange={(e) => setFormData({...formData, severity: Number(e.target.value)})} 
                />
              </div>
            )}
          </div>

          {type === 'risk' ? (
            <div className="space-y-2">
              <Label htmlFor="strategy">Estratégia de Resposta</Label>
              <Input
                id="strategy"
                placeholder="Ex: Mitigar, Aceitar, Transferir"
                value={formData.response_strategy}
                onChange={(e) => setFormData({ ...formData, response_strategy: e.target.value })}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="sla">Data Limite (SLA)</Label>
              <Input
                id="sla"
                type="date"
                value={formData.sla_due_date}
                onChange={(e) => setFormData({ ...formData, sla_due_date: e.target.value })}
              />
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            {item && (
              <Button 
                type="button" 
                variant="ghost" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 size={16} className="mr-2" /> Excluir
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : item ? 'Salvar Alterações' : 'Criar'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

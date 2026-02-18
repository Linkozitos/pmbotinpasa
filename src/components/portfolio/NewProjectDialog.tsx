import React, { useState } from 'react';
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function NewProjectDialog({ open, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'ideacao',
    health: 'verde',
    priority: 'media',
    start_planned: '',
    finish_planned: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('projects').insert([
        {
          name: formData.name,
          code: formData.code,
          description: formData.description || null,
          status: formData.status as any,
          health: formData.health as any,
          priority: formData.priority as any,
          start_planned: formData.start_planned || null,
          finish_planned: formData.finish_planned || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Projeto criado com sucesso.',
      });
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        status: 'ideacao',
        health: 'verde',
        priority: 'media',
        start_planned: '',
        finish_planned: '',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar projeto',
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
          <DialogTitle>Novo Projeto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código do Projeto</Label>
              <Input
                id="code"
                placeholder="Ex: PRJ-001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                placeholder="Nome descritivo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Breve descrição do projeto..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
                  <SelectItem value="ideacao">Ideação</SelectItem>
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="execucao">Execução</SelectItem>
                  <SelectItem value="on_hold">Em Pausa</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Saúde</Label>
              <Select
                value={formData.health}
                onValueChange={(v) => setFormData({ ...formData, health: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verde">Verde</SelectItem>
                  <SelectItem value="amarelo">Amarelo</SelectItem>
                  <SelectItem value="vermelho">Vermelho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Início Planejado</Label>
              <Input
                id="start"
                type="date"
                value={formData.start_planned}
                onChange={(e) => setFormData({ ...formData, start_planned: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finish">Fim Planejado</Label>
              <Input
                id="finish"
                type="date"
                value={formData.finish_planned}
                onChange={(e) => setFormData({ ...formData, finish_planned: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

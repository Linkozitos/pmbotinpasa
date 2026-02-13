import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Download, FileDown, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Memory {
  id: string;
  name: string;
  discipline: string | null;
  project_id: string | null;
  total_weight_kg: number;
  advanced_weight_kg: number;
  progress_pct: number;
  updated_at: string;
}

export default function MemoriesListTab() {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDiscipline, setNewDiscipline] = useState('');

  const fetchMemories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('calculation_memories')
      .select('*')
      .order('updated_at', { ascending: false });
    setMemories((data as Memory[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchMemories(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const { data } = await supabase
      .from('calculation_memories')
      .insert({ name: newName.trim(), discipline: newDiscipline.trim() || null })
      .select()
      .single();
    if (data) {
      setShowNewDialog(false);
      setNewName('');
      setNewDiscipline('');
      navigate(`/memorial/detalhe/${data.id}`);
    }
  };

  const handleDuplicate = async (memory: Memory) => {
    const { data } = await supabase
      .from('calculation_memories')
      .insert({ name: `${memory.name} (cópia)`, discipline: memory.discipline })
      .select()
      .single();
    if (data) fetchMemories();
  };

  const filtered = memories.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.discipline || '').toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar memórias..."
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
          <Button size="sm" onClick={() => setShowNewDialog(true)}>
            <Plus size={14} className="mr-1" /> Nova Memória
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Memória</TableHead>
              <TableHead>Disciplina</TableHead>
              <TableHead className="text-right">Peso Total (kg)</TableHead>
              <TableHead className="text-right">Peso Avançado (kg)</TableHead>
              <TableHead className="text-right">Avanço Geral</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Nenhuma memória encontrada. Crie uma nova para começar.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow
                  key={m.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/memorial/detalhe/${m.id}`)}
                >
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    {m.discipline ? (
                      <Badge variant="secondary">{m.discipline}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(m.total_weight_kg)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(m.advanced_weight_kg)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={m.progress_pct >= 80 ? 'default' : m.progress_pct >= 40 ? 'secondary' : 'outline'}
                    >
                      {fmt(m.progress_pct)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(m.updated_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/memorial/detalhe/${m.id}`)}>
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDuplicate(m)}>
                        <Copy size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* New Memory Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Memória de Cálculo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Tubulação — Unidade 01"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Disciplina (opcional)</Label>
              <Input
                placeholder="Ex: Tubulação, Civil, Elétrica"
                value={newDiscipline}
                onChange={(e) => setNewDiscipline(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

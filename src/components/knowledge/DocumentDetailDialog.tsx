import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Download, ExternalLink, Copy, Pencil, Trash2, X } from 'lucide-react';
import { type KnowledgeDocument, getSignedUrl, formatFileSize } from '@/services/knowledgeBase';
import { useUpdateDocument, useDeleteDocument } from '@/hooks/useKnowledgeBase';
import { toast } from '@/hooks/use-toast';

interface DocumentDetailDialogProps {
  document: KnowledgeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: string[];
}

export default function DocumentDetailDialog({
  document, open, onOpenChange, folders,
}: DocumentDetailDialogProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('');
  const [confidentiality, setConfidentiality] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [downloading, setDownloading] = useState(false);

  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();

  const startEdit = () => {
    if (!document) return;
    setTitle(document.title);
    setFolder(document.folder || '');
    setConfidentiality(document.confidentiality_level);
    setTagsText(document.tags.map(t => t.name).join(', '));
    setEditing(true);
  };

  const handleSave = async () => {
    if (!document) return;
    try {
      await updateMutation.mutateAsync({
        id: document.id,
        patch: {
          title: title.trim() || undefined,
          folder: folder || undefined,
          confidentiality_level: confidentiality || undefined,
          tags: tagsText.split(',').map(t => t.trim()).filter(Boolean),
        },
      });
      toast({ title: 'Documento atualizado' });
      setEditing(false);
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    try {
      await deleteMutation.mutateAsync(document.id);
      toast({ title: 'Documento excluído' });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
    }
  };

  const handleDownload = async () => {
    if (!document?.latest_version?.storage_uri) return;
    setDownloading(true);
    try {
      const url = await getSignedUrl(document.latest_version.storage_uri);
      window.open(url, '_blank');
    } catch (err: any) {
      toast({ title: 'Erro ao gerar link', description: err.message, variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!document?.latest_version?.storage_uri) return;
    try {
      const url = await getSignedUrl(document.latest_version.storage_uri);
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copiado!' });
    } catch (err: any) {
      toast({ title: 'Erro ao copiar', description: err.message, variant: 'destructive' });
    }
  };

  if (!document) return null;

  const mimeIcon: Record<string, string> = {
    'application/pdf': '📄',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📑',
    'text/csv': '📋',
    'text/plain': '📋',
  };

  const icon = mimeIcon[document.latest_version?.mime_type || ''] || '📄';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            {editing ? (
              <Input value={title} onChange={e => setTitle(e.target.value)} className="text-lg font-semibold" />
            ) : (
              document.title
            )}
          </DialogTitle>
          <DialogDescription>
            Detalhes do documento na Base de Conhecimento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {editing ? (
            <>
              <div>
                <Label>Pasta</Label>
                <Select value={folder} onValueChange={setFolder}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {folders.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Confidencialidade</Label>
                <Select value={confidentiality} onValueChange={setConfidentiality}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publico">Público</SelectItem>
                    <SelectItem value="interno">Interno</SelectItem>
                    <SelectItem value="restrito">Restrito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tags (separar por vírgula)</Label>
                <Input value={tagsText} onChange={e => setTagsText(e.target.value)} className="mt-1" />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Pasta:</span>
                  <span className="ml-1 font-medium text-foreground">{document.folder || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="ml-1 font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {document.latest_version?.mime_type?.split('/').pop()?.toUpperCase() || document.type}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tamanho:</span>
                  <span className="ml-1 font-medium text-foreground">{formatFileSize(document.latest_version?.size_bytes)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidencialidade:</span>
                  <span className="ml-1 font-medium text-foreground capitalize">{document.confidentiality_level}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Atualizado:</span>
                  <span className="ml-1 font-medium text-foreground">
                    {new Date(document.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {document.tags.map(tag => (
                    <span key={tag.id} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2">
          {editing ? (
            <>
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={updateMutation.isPending}>Cancelar</Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 size={14} className="mr-1" />
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil size={14} className="mr-1" /> Editar
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy size={14} className="mr-1" /> Copiar Link
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={downloading || !document.latest_version?.storage_uri}>
                <Download size={14} className="mr-1" />
                {downloading ? 'Gerando...' : 'Baixar / Abrir'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

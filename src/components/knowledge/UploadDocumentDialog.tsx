import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Upload, X, Plus } from 'lucide-react';
import { useUploadDocument } from '@/hooks/useKnowledgeBase';
import { toast } from '@/hooks/use-toast';

const ACCEPTED_TYPES = '.pdf,.docx,.xlsx,.pptx,.csv,.txt';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: string[];
  existingTags: { id: string; name: string }[];
}

export default function UploadDocumentDialog({
  open, onOpenChange, folders, existingTags,
}: UploadDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [confidentiality, setConfidentiality] = useState<string>('interno');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocument();

  const reset = () => {
    setFile(null);
    setTitle('');
    setFolder('');
    setNewFolder('');
    setShowNewFolder(false);
    setConfidentiality('interno');
    setSelectedTags([]);
    setNewTag('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleAddTag = () => {
    const t = newTag.trim();
    if (t && !selectedTags.includes(t)) {
      setSelectedTags([...selectedTags, t]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({ title: 'Selecione um arquivo', variant: 'destructive' });
      return;
    }
    if (!title.trim()) {
      toast({ title: 'Informe um título', variant: 'destructive' });
      return;
    }

    const finalFolder = showNewFolder ? newFolder.trim() : folder;
    if (!finalFolder) {
      toast({ title: 'Selecione ou crie uma pasta', variant: 'destructive' });
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        file,
        metadata: {
          title: title.trim(),
          folder: finalFolder,
          confidentiality_level: confidentiality,
          tags: selectedTags,
        },
      });
      toast({ title: 'Upload concluído', description: `"${title}" salvo com sucesso.` });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Erro no upload',
        description: err.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
          <DialogDescription>
            Selecione um arquivo e preencha os metadados para adicionar à Base de Conhecimento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File input */}
          <div>
            <Label>Arquivo</Label>
            <div
              className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                  <Upload size={16} />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
                  Clique para selecionar (PDF, DOCX, XLSX, PPTX, CSV, TXT)
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="doc-title">Título</Label>
            <Input id="doc-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do documento" className="mt-1" />
          </div>

          {/* Folder */}
          <div>
            <Label>Pasta</Label>
            {showNewFolder ? (
              <div className="flex gap-2 mt-1">
                <Input value={newFolder} onChange={e => setNewFolder(e.target.value)} placeholder="Nome da nova pasta" />
                <Button variant="ghost" size="sm" onClick={() => setShowNewFolder(false)}>Cancelar</Button>
              </div>
            ) : (
              <div className="flex gap-2 mt-1">
                <Select value={folder} onValueChange={setFolder}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione uma pasta" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setShowNewFolder(true)} title="Nova pasta">
                  <Plus size={16} />
                </Button>
              </div>
            )}
          </div>

          {/* Confidentiality */}
          <div>
            <Label>Confidencialidade</Label>
            <Select value={confidentiality} onValueChange={setConfidentiality}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publico">Público</SelectItem>
                <SelectItem value="interno">Interno</SelectItem>
                <SelectItem value="restrito">Restrito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1 mt-1 mb-2">
              {selectedTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Adicionar tag..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                list="existing-tags"
              />
              <datalist id="existing-tags">
                {existingTags.filter(t => !selectedTags.includes(t.name)).map(t => (
                  <option key={t.id} value={t.name} />
                ))}
              </datalist>
              <Button variant="outline" size="sm" onClick={handleAddTag}>Adicionar</Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={uploadMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Enviando...' : 'Fazer Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

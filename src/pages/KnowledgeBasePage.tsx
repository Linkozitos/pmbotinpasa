import { useState, useMemo } from 'react';
import {
  BookOpen, Upload, Link2, Database, BarChart3, Globe, Tags,
  FolderOpen, FileText, Calendar, FileSpreadsheet, Shield,
  Lightbulb, Plug, Activity, Search, Grid3X3, List, X, Loader2,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import UploadDocumentDialog from '@/components/knowledge/UploadDocumentDialog';
import DocumentDetailDialog from '@/components/knowledge/DocumentDetailDialog';
import { cn } from '@/lib/utils';
import { useDocuments, useFolders, useAllTags } from '@/hooks/useKnowledgeBase';
import { formatFileSize, type KnowledgeDocument } from '@/services/knowledgeBase';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const folderIcons: Record<string, { icon: typeof Shield; color: string }> = {
  'Políticas e Procedimentos': { icon: Shield, color: 'text-blue-400' },
  'Templates PMO': { icon: FileText, color: 'text-teal-400' },
  'Cronogramas': { icon: Calendar, color: 'text-amber-400' },
  'Contratos': { icon: FileSpreadsheet, color: 'text-purple-400' },
  'Dados ERP (CS)': { icon: Database, color: 'text-emerald-400' },
  'Relatórios': { icon: BarChart3, color: 'text-orange-400' },
  'Lições Aprendidas': { icon: Lightbulb, color: 'text-yellow-400' },
  'Integrações e APIs': { icon: Plug, color: 'text-cyan-400' },
  'Indicadores e BI': { icon: Activity, color: 'text-rose-400' },
};

const defaultFolderIcon = { icon: FolderOpen, color: 'text-muted-foreground' };

const mimeToIcon: Record<string, string> = {
  'application/pdf': '📄',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📑',
  'text/csv': '📋',
  'text/plain': '📋',
};

const quickActions = [
  { label: 'Upload de Arquivo', icon: Upload, color: 'bg-accent/10 text-accent hover:bg-accent/20', action: 'upload' },
  { label: 'Conectar API', icon: Link2, color: 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20', action: 'soon' },
  { label: 'Conectar Banco de Dados', icon: Database, color: 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20', action: 'soon' },
  { label: 'Conectar Power BI', icon: BarChart3, color: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20', action: 'soon' },
  { label: 'Adicionar Website', icon: Globe, color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20', action: 'soon' },
  { label: 'Gerenciar Tags', icon: Tags, color: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20', action: 'soon' },
];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: documents, isLoading, error } = useDocuments({ search: search || undefined, folder: activeFolder || undefined });
  const { data: folders } = useFolders();
  const { data: allTags } = useAllTags();

  const folderNames = useMemo(() => (folders || []).map(f => f.name), [folders]);

  const handleQuickAction = (action: string) => {
    if (action === 'upload') setUploadOpen(true);
  };

  const handleDocClick = (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
    setDetailOpen(true);
  };

  const totalDocs = (documents || []).length;
  const totalFolders = (folders || []).length;
  const totalTags = (allTags || []).length;

  return (
    <div>
      <PageHeader title="Base de Conhecimento" subtitle="Documentos, dados e fontes do Assessor de Planejamento">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-accent w-56"
              placeholder="Buscar documentos, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'grid' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'list' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((qa) => (
            <Tooltip key={qa.label}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleQuickAction(qa.action)}
                  disabled={qa.action === 'soon'}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors border border-border",
                    qa.action === 'soon' ? "opacity-50 cursor-not-allowed" : "",
                    qa.color
                  )}
                >
                  <qa.icon size={14} />
                  {qa.label}
                </button>
              </TooltipTrigger>
              {qa.action === 'soon' && (
                <TooltipContent>Em desenvolvimento</TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>

        {/* Active folder filter chip */}
        {activeFolder && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtrado por:</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
              <FolderOpen size={12} /> {activeFolder}
              <button onClick={() => setActiveFolder(null)} className="ml-1 hover:text-destructive">
                <X size={12} />
              </button>
            </span>
          </div>
        )}

        {/* Folders */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FolderOpen size={16} />
            Pastas
          </h2>
          {folders ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {folders.map((folder) => {
                const iconInfo = folderIcons[folder.name] || defaultFolderIcon;
                const Icon = iconInfo.icon;
                return (
                  <button
                    key={folder.name}
                    onClick={() => setActiveFolder(activeFolder === folder.name ? null : folder.name)}
                    className={cn(
                      "kpi-card text-left hover:border-accent/40 transition-colors cursor-pointer group",
                      activeFolder === folder.name && "border-accent ring-1 ring-accent/30"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} className={iconInfo.color} />
                      <span className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                        {folder.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{folder.count} documentos</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          )}
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText size={16} />
            {activeFolder ? `Documentos em "${activeFolder}"` : 'Documentos Recentes'}
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 size={20} className="animate-spin mr-2" /> Carregando documentos...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive text-sm">
              Erro ao carregar documentos. Verifique sua conexão e tente novamente.
            </div>
          ) : (documents || []).length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? 'Nenhum documento encontrado para esta busca.' : 'Nenhum documento cadastrado ainda.'}
              </p>
              <button
                onClick={() => setUploadOpen(true)}
                className="mt-3 text-xs text-accent hover:underline"
              >
                Fazer upload do primeiro documento
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground">
                    <th className="text-left px-4 py-2.5 font-medium">Documento</th>
                    <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Pasta</th>
                    <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Tipo</th>
                    <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Tamanho</th>
                    <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Atualizado</th>
                    <th className="text-left px-4 py-2.5 font-medium hidden xl:table-cell">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {(documents || []).map((doc) => {
                    const icon = mimeToIcon[doc.latest_version?.mime_type || ''] || '📄';
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => handleDocClick(doc)}
                        className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{icon}</span>
                            <span className="font-medium text-foreground">{doc.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{doc.folder || '—'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">
                            {doc.latest_version?.mime_type?.split('/').pop()?.toUpperCase() || doc.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {formatFileSize(doc.latest_version?.size_bytes)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.map((tag) => (
                              <span key={tag.id} className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(documents || []).map((doc) => {
                const icon = mimeToIcon[doc.latest_version?.mime_type || ''] || '📄';
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleDocClick(doc)}
                    className="kpi-card hover:border-accent/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{doc.title}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.folder || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                      <span>{doc.latest_version?.mime_type?.split('/').pop()?.toUpperCase() || doc.type} · {formatFileSize(doc.latest_version?.size_bytes)}</span>
                      <span>{new Date(doc.updated_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag) => (
                        <span key={tag.id} className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="kpi-card text-center">
            <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Documentos Indexados</p>
          </div>
          <div className="kpi-card text-center">
            <p className="text-2xl font-bold text-foreground">{totalFolders}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Pastas</p>
          </div>
          <div className="kpi-card text-center">
            <p className="text-2xl font-bold text-foreground">{totalTags}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Tags Ativas</p>
          </div>
          <div className="kpi-card text-center">
            <p className="text-2xl font-bold text-foreground">—</p>
            <p className="text-[10px] text-muted-foreground mt-1">Indexação Completa</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadDocumentDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folders={folderNames}
        existingTags={allTags || []}
      />
      <DocumentDetailDialog
        document={selectedDoc}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        folders={folderNames}
      />
    </div>
  );
}

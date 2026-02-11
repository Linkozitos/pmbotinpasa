import { useState } from 'react';
import {
  BookOpen, Upload, Link2, Database, BarChart3, Globe, Tags,
  FolderOpen, FileText, Calendar, FileSpreadsheet, Shield,
  Lightbulb, Plug, Activity, Search, Filter, Grid3X3, List
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

const folders = [
  { name: 'Políticas e Procedimentos', icon: Shield, count: 12, color: 'text-blue-400' },
  { name: 'Templates PMO', icon: FileText, count: 24, color: 'text-teal-400' },
  { name: 'Cronogramas', icon: Calendar, count: 8, color: 'text-amber-400' },
  { name: 'Contratos', icon: FileSpreadsheet, count: 15, color: 'text-purple-400' },
  { name: 'Dados ERP (CS)', icon: Database, count: 6, color: 'text-emerald-400' },
  { name: 'Relatórios', icon: BarChart3, count: 31, color: 'text-orange-400' },
  { name: 'Lições Aprendidas', icon: Lightbulb, count: 9, color: 'text-yellow-400' },
  { name: 'Integrações e APIs', icon: Plug, count: 4, color: 'text-cyan-400' },
  { name: 'Indicadores e BI', icon: Activity, count: 7, color: 'text-rose-400' },
];

const recentDocs = [
  { id: '1', name: 'Política de Governança de Projetos v3.2', folder: 'Políticas e Procedimentos', type: 'PDF', size: '2.4 MB', updatedAt: '2026-02-10', author: 'Ana Rodrigues', tags: ['governança', 'política', 'obrigatório'] },
  { id: '2', name: 'Template Status Report Semanal', folder: 'Templates PMO', type: 'DOCX', size: '340 KB', updatedAt: '2026-02-09', author: 'Ana Rodrigues', tags: ['template', 'status', 'semanal'] },
  { id: '3', name: 'Cronograma Planta Dourados - Baseline', folder: 'Cronogramas', type: 'XLSX', size: '1.8 MB', updatedAt: '2026-02-08', author: 'Marcos Santos', tags: ['cronograma', 'planta', 'baseline'] },
  { id: '4', name: 'Contrato Zanini - Caldeiras', folder: 'Contratos', type: 'PDF', size: '5.1 MB', updatedAt: '2026-02-07', author: 'Ricardo Alves', tags: ['contrato', 'fornecedor', 'caldeiras'] },
  { id: '5', name: 'Snapshot Financeiro CS - Jan/2026', folder: 'Dados ERP (CS)', type: 'XLSX', size: '890 KB', updatedAt: '2026-02-05', author: 'Sistema CS', tags: ['erp', 'financeiro', 'snapshot'] },
  { id: '6', name: 'Ata Comitê Executivo - 31/Jan', folder: 'Relatórios', type: 'PDF', size: '420 KB', updatedAt: '2026-02-01', author: 'Ana Rodrigues', tags: ['ata', 'comitê', 'decisões'] },
  { id: '7', name: 'Lições Aprendidas - PRJ-003 Energia', folder: 'Lições Aprendidas', type: 'DOCX', size: '210 KB', updatedAt: '2026-01-28', author: 'André Oliveira', tags: ['lições', 'energia', 'boas práticas'] },
];

const quickActions = [
  { label: 'Upload de Arquivo', icon: Upload, color: 'bg-accent/10 text-accent hover:bg-accent/20' },
  { label: 'Conectar API', icon: Link2, color: 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20' },
  { label: 'Conectar Banco de Dados', icon: Database, color: 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' },
  { label: 'Conectar Power BI', icon: BarChart3, color: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' },
  { label: 'Adicionar Website', icon: Globe, color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' },
  { label: 'Gerenciar Tags', icon: Tags, color: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' },
];

const fileTypeIcon: Record<string, string> = {
  PDF: '📄',
  DOCX: '📝',
  XLSX: '📊',
  PPTX: '📑',
  CSV: '📋',
  JSON: '🔧',
};

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredDocs = recentDocs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

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
            <button
              key={qa.label}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors border border-border",
                qa.color
              )}
            >
              <qa.icon size={14} />
              {qa.label}
            </button>
          ))}
        </div>

        {/* Folders */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FolderOpen size={16} />
            Pastas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {folders.map((folder) => (
              <button
                key={folder.name}
                className="kpi-card text-left hover:border-accent/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <folder.icon size={16} className={folder.color} />
                  <span className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                    {folder.name}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{folder.count} documentos</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText size={16} />
            Documentos Recentes
          </h2>

          {viewMode === 'list' ? (
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
                  {filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{fileTypeIcon[doc.type] || '📄'}</span>
                          <span className="font-medium text-foreground">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{doc.folder}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{doc.size}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="kpi-card hover:border-accent/40 transition-colors cursor-pointer">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">{fileTypeIcon[doc.type] || '📄'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.folder}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                    <span>{doc.type} · {doc.size}</span>
                    <span>{new Date(doc.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="kpi-card text-center">
            <p className="text-2xl font-bold text-foreground">116</p>
            <p className="text-[10px] text-muted-foreground mt-1">Documentos Indexados</p>
          </div>
          <div className="kpi-card text-center">
            <p className="text-2xl font-bold text-foreground">9</p>
            <p className="text-[10px] text-muted-foreground mt-1">Pastas</p>
          </div>
          <div className="kpi-card text-center">
            <p className="text-2xl font-bold text-foreground">34</p>
            <p className="text-[10px] text-muted-foreground mt-1">Tags Ativas</p>
          </div>
          <div className="kpi-card text-center">
            <p className="text-2xl font-bold text-foreground">98%</p>
            <p className="text-[10px] text-muted-foreground mt-1">Indexação Completa</p>
          </div>
        </div>
      </div>
    </div>
  );
}

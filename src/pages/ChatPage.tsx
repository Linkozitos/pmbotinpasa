import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Sparkles, FileText, AlertTriangle, Calendar, CheckCircle, Lightbulb, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { ChatMessage, CopilotMode } from '@/types/pmo';
import { cn } from '@/lib/utils';
import { getDashboardData } from '@/services/pmoService';
import { useQuery } from '@tanstack/react-query';

const quickActions = [
  { label: 'Gerar status semanal', icon: FileText },
  { label: 'Preparar comitê', icon: Calendar },
  { label: 'Abrir risco/issue', icon: AlertTriangle },
  { label: 'Registrar decisão', icon: CheckCircle },
  { label: 'Criar plano de ação', icon: Lightbulb },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu Assessor de Planejamento. Como posso ajudar com o portfólio hoje?',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<CopilotMode>('executivo');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: pmoData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Resposta baseada em dados reais
    setTimeout(() => {
      const projects = pmoData?.projects || [];
      const risks = pmoData?.risks || [];
      const activeProjects = projects.filter(p => p.status !== 'encerrado');
      const criticalProjects = projects.filter(p => p.health === 'vermelho');
      const openRisks = risks.filter(r => r.status === 'aberto');

      let response = '';
      if (mode === 'executivo') {
        response = `Atualmente temos **${activeProjects.length} projetos ativos**. `;
        if (criticalProjects.length > 0) {
          response += `Atenção imediata necessária em **${criticalProjects.length} projetos críticos**: ${criticalProjects.map(p => p.name).join(', ')}. `;
        } else {
          response += `O portfólio segue saudável sem projetos críticos no momento. `;
        }
        response += `\n\nExistem **${openRisks.length} riscos abertos** que precisam de revisão.`;
      } else {
        response = `Análise detalhada do portfólio (${new Date().toLocaleDateString('pt-BR')}):\n\n`;
        response += `**Status Geral:** ${activeProjects.length} projetos em andamento. `;
        response += `A saúde do portfólio está com ${projects.filter(p => p.health === 'verde').length} itens em verde.\n\n`;
        
        if (criticalProjects.length > 0) {
          response += `**Pontos de Atenção:**\n`;
          criticalProjects.forEach(p => {
            response += `- ${p.name} (${p.code}): Status ${p.status}, Saúde ${p.health}. Progresso atual: ${p.progress_pct}%.\n`;
          });
        }

        response += `\n**Riscos Críticos:** Encontrados ${openRisks.filter(r => (r.score || 0) >= 15).length} riscos de alta severidade.`;
      }

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        sources: [
          { name: 'Banco de Dados Supabase', type: 'sistema' },
          { name: 'Dashboard Real-time', type: 'sistema' },
        ],
        confidence: 'Alto',
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (label: string) => {
    setInput(label);
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Chat Assessor" subtitle="Assessor de Planejamento com IA">
        {/* Mode toggle */}
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setMode('executivo')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              mode === 'executivo' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Executivo
          </button>
          <button
            onClick={() => setMode('analista')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              mode === 'analista' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            PMO/Analista
          </button>
        </div>
      </PageHeader>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex animate-fade-in", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn("max-w-2xl", msg.role === 'user' ? 'chat-bubble-user' : 'space-y-2')}>
              {msg.role === 'assistant' ? (
                <>
                  <div className="chat-bubble-bot whitespace-pre-wrap">
                    {msg.content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={i}>{part.slice(2, -2)}</strong>
                        : part.startsWith('_') && part.endsWith('_')
                          ? <em key={i} className="text-muted-foreground">{part.slice(1, -1)}</em>
                          : <span key={i}>{part}</span>
                    )}
                  </div>
                  {msg.sources && (
                    <div className="flex flex-wrap items-center gap-1.5 px-1">
                      <span className="text-[10px] text-muted-foreground font-medium">Fontes:</span>
                      {msg.sources.map((s, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.name}</span>
                      ))}
                      {msg.confidence && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium",
                          msg.confidence === 'Alto' ? 'status-badge-green' :
                          msg.confidence === 'Médio' ? 'status-badge-yellow' : 'status-badge-red'
                        )}>
                          Confiança: {msg.confidence}
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="chat-bubble-bot flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs">Assessor analisando dados...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick actions */}
      <div className="px-6 pb-2">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              onClick={() => handleQuickAction(qa.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent transition-colors shadow-card"
            >
              <qa.icon size={12} />
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-2">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-elevated">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Paperclip size={18} />
          </button>
          <input
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            placeholder={mode === 'executivo' ? 'Pergunte algo rápido ao copilot...' : 'Faça uma análise detalhada...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          <Sparkles size={10} className="inline mr-1" />
          Modo {mode} ativo · Respostas {mode === 'executivo' ? 'curtas e acionáveis' : 'completas com premissas e fontes'}
        </p>
      </div>
    </div>
  );
}

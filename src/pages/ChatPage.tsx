import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Sparkles, FileText, AlertTriangle, Calendar, CheckCircle, Lightbulb } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { mockChatHistory } from '@/data/mockData';
import { ChatMessage, CopilotMode } from '@/types/pmo';
import { cn } from '@/lib/utils';

const quickActions = [
  { label: 'Gerar status semanal', icon: FileText },
  { label: 'Preparar comitê', icon: Calendar },
  { label: 'Abrir risco/issue', icon: AlertTriangle },
  { label: 'Registrar decisão', icon: CheckCircle },
  { label: 'Criar plano de ação', icon: Lightbulb },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<CopilotMode>('executivo');
  const endRef = useRef<HTMLDivElement>(null);

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

    // Simulated response
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: mode === 'executivo'
          ? '• **Ação 1:** Reunir com Camila Rocha sobre PRJ-004 até sexta\n• **Ação 2:** Validar budget adicional com Paulo Ferreira\n• **Ação 3:** Atualizar risk register antes do comitê de 14/fev\n\n_Modo executivo — respostas curtas e acionáveis._'
          : 'Analisando os dados disponíveis no portfólio atual...\n\n**Premissas:**\n1. Base de custos atualizada até 10/fev/2026\n2. Risk register com 5 riscos abertos (2 críticos)\n3. Cronograma baseline aprovado em set/2025\n\n**Análise detalhada:**\nO projeto PRJ-004 apresenta desvio de +20.8% no forecast vs baseline (R$ 14.5M vs R$ 12M). As principais causas são:\n- Retrabalho na integração de sensores (40% do desvio)\n- Atraso de 45 dias na entrega de equipamentos importados (35%)\n- Escopo adicional não previsto (25%)\n\n**Recomendação:** Solicitar aprovação formal de R$ 2.5M no comitê de 14/fev com plano de recuperação de prazo.\n\n**Fontes:** Dashboard Portfólio (atualizado 10/fev), Risk Register v3.2, Forecast Financeiro jan/2026\n\n**Confiança:** Alto (dados atualizados < 48h)',
        timestamp: new Date().toISOString(),
        sources: [
          { name: 'Dashboard Portfólio', type: 'sistema' },
          { name: 'Risk Register v3.2', type: 'documento' },
        ],
        confidence: 'Alto',
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1200);
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

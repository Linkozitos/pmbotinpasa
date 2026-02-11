import { Project, Risk, Decision, Meeting, ChatMessage, User } from '@/types/pmo';

export const currentUser: User = {
  id: '1',
  name: 'Ana Rodrigues',
  email: 'ana.rodrigues@inpasa.com.br',
  role: 'pmo',
  area: 'PMO Corporativo',
};

export const mockProjects: Project[] = [
  {
    id: '1', name: 'ERP S/4HANA – Fase 2', code: 'PRJ-001', status: 'amarelo', health: 65,
    sponsor: 'Carlos Mendes', area: 'TI', gerente: 'Fernanda Lima', budget: 4200000, spent: 2850000,
    forecast: 4500000, startDate: '2025-03-01', endDate: '2026-06-30', progress: 62, riskCount: 5, issueCount: 3,
    description: 'Migração do ERP legado para SAP S/4HANA – módulos MM, FI, CO e PP.',
  },
  {
    id: '2', name: 'Nova Planta Dourados', code: 'PRJ-002', status: 'verde', health: 88,
    sponsor: 'Ricardo Alves', area: 'Engenharia', gerente: 'Marcos Santos', budget: 180000000, spent: 95000000,
    forecast: 175000000, startDate: '2024-09-01', endDate: '2026-12-31', progress: 48, riskCount: 8, issueCount: 2,
    description: 'Construção da nova planta de etanol de milho em Dourados/MS – capacidade 1.500 m³/dia.',
  },
  {
    id: '3', name: 'Programa de Eficiência Energética', code: 'PRJ-003', status: 'verde', health: 92,
    sponsor: 'Juliana Costa', area: 'Operações', gerente: 'André Oliveira', budget: 8500000, spent: 3200000,
    forecast: 8200000, startDate: '2025-01-15', endDate: '2025-12-31', progress: 38, riskCount: 2, issueCount: 0,
    description: 'Redução de 15% no consumo energético das plantas industriais via cogeração e otimização.',
  },
  {
    id: '4', name: 'Automação Logística Inbound', code: 'PRJ-004', status: 'vermelho', health: 35,
    sponsor: 'Paulo Ferreira', area: 'Logística', gerente: 'Camila Rocha', budget: 12000000, spent: 9800000,
    forecast: 14500000, startDate: '2025-02-01', endDate: '2025-11-30', progress: 71, riskCount: 6, issueCount: 5,
    description: 'Automação do recebimento de milho com pesagem, amostragem e classificação automáticas.',
  },
  {
    id: '5', name: 'Compliance LGPD & SOX', code: 'PRJ-005', status: 'verde', health: 80,
    sponsor: 'Maria Helena', area: 'Jurídico', gerente: 'Tiago Nascimento', budget: 2100000, spent: 1400000,
    forecast: 2050000, startDate: '2025-04-01', endDate: '2026-03-31', progress: 55, riskCount: 3, issueCount: 1,
    description: 'Adequação dos processos à LGPD e controles SOX para auditoria externa.',
  },
  {
    id: '6', name: 'BI & Analytics Corporativo', code: 'PRJ-006', status: 'amarelo', health: 58,
    sponsor: 'Carlos Mendes', area: 'TI', gerente: 'Luciana Martins', budget: 3500000, spent: 2100000,
    forecast: 3800000, startDate: '2025-05-01', endDate: '2026-02-28', progress: 45, riskCount: 4, issueCount: 2,
    description: 'Plataforma unificada de BI com dashboards operacionais e estratégicos (Power BI + Databricks).',
  },
];

export const mockRisks: Risk[] = [
  {
    id: '1', projectId: '1', projectName: 'ERP S/4HANA – Fase 2', title: 'Escassez de consultores SAP BASIS',
    description: 'Mercado aquecido pode impactar a contratação de especialistas.', probability: 'alto',
    impact: 'alto', status: 'aberto', owner: 'Fernanda Lima', response: 'Pré-contratar 2 consultores; backup com parceiro.',
    createdAt: '2025-11-15',
  },
  {
    id: '2', projectId: '4', projectName: 'Automação Logística Inbound', title: 'Atraso na entrega de equipamentos importados',
    description: 'Lead time de sensores de classificação excede 120 dias.', probability: 'alto',
    impact: 'alto', status: 'aberto', owner: 'Camila Rocha', response: 'Antecipar pedido e manter fornecedor alternativo nacional.',
    createdAt: '2025-10-22',
  },
  {
    id: '3', projectId: '2', projectName: 'Nova Planta Dourados', title: 'Variação cambial em contratos USD',
    description: 'Equipamentos importados com hedge parcial.', probability: 'medio',
    impact: 'alto', status: 'mitigado', owner: 'Marcos Santos', response: 'Hedge de 70% do contrato em USD.',
    createdAt: '2025-09-10',
  },
  {
    id: '4', projectId: '6', projectName: 'BI & Analytics Corporativo', title: 'Qualidade dos dados de origem',
    description: 'Dados do ERP legado com inconsistências históricas.', probability: 'alto',
    impact: 'medio', status: 'aberto', owner: 'Luciana Martins', response: 'Sprint de data cleansing antes da carga.',
    createdAt: '2025-12-01',
  },
  {
    id: '5', projectId: '1', projectName: 'ERP S/4HANA – Fase 2', title: 'Resistência à mudança nos usuários-chave',
    description: 'Áreas operacionais demonstram baixa adesão ao treinamento.', probability: 'medio',
    impact: 'medio', status: 'aberto', owner: 'Fernanda Lima', response: 'Programa de change management com sponsors locais.',
    createdAt: '2026-01-08',
  },
];

export const mockDecisions: Decision[] = [
  {
    id: '1', projectId: '1', projectName: 'ERP S/4HANA – Fase 2', title: 'Postergar módulo HR para Fase 3',
    description: 'Decidido não incluir módulo HR na Fase 2 para manter escopo e prazo.', decidedBy: 'Carlos Mendes',
    date: '2026-01-15', status: 'aprovada', impact: 'Redução de R$ 800k no escopo da Fase 2.',
  },
  {
    id: '2', projectId: '4', projectName: 'Automação Logística Inbound', title: 'Aprovar orçamento adicional de R$ 2.5M',
    description: 'Solicitação de budget incremental para cobrir atrasos e retrabalho.', decidedBy: 'Paulo Ferreira',
    date: '2026-02-03', status: 'pendente', impact: 'Necessário para conclusão até março/2026.',
  },
  {
    id: '3', projectId: '2', projectName: 'Nova Planta Dourados', title: 'Selecionar fornecedor de caldeiras',
    description: 'Aprovado fornecedor nacional (Zanini) em vez de importação.', decidedBy: 'Ricardo Alves',
    date: '2026-01-28', status: 'aprovada', impact: 'Redução de lead time em 60 dias; custo +5%.',
  },
];

export const mockMeetings: Meeting[] = [
  {
    id: '1', title: 'Comitê Executivo de Portfólio', type: 'comite', date: '2026-02-14',
    participants: ['Carlos Mendes', 'Ricardo Alves', 'Juliana Costa', 'Ana Rodrigues'],
    agenda: ['Revisão do status geral do portfólio', 'Aprovação de budget PRJ-004', 'Priorização Q2/2026'],
    status: 'agendada', actionItems: 0, pendingItems: 3,
  },
  {
    id: '2', title: 'Status Semanal – ERP S/4HANA', type: 'status', date: '2026-02-10',
    participants: ['Fernanda Lima', 'Ana Rodrigues', 'Time técnico SAP'],
    agenda: ['Progresso sprint atual', 'Bloqueios', 'Próximos marcos'],
    status: 'realizada', actionItems: 4, pendingItems: 2,
  },
  {
    id: '3', title: 'Status Semanal – Planta Dourados', type: 'status', date: '2026-02-10',
    participants: ['Marcos Santos', 'Ana Rodrigues', 'Engenharia Civil'],
    agenda: ['Fundação – bloco B', 'Recebimento de equipamentos', 'Licenças ambientais'],
    status: 'realizada', actionItems: 3, pendingItems: 1,
  },
];

export const mockChatHistory: ChatMessage[] = [
  {
    id: '1', role: 'user', content: 'Qual o status geral do portfólio esta semana?',
    timestamp: '2026-02-11T09:15:00',
  },
  {
    id: '2', role: 'assistant',
    content: `**Status do Portfólio — Semana 07/2026**\n\n• **4 de 6 projetos** no prazo (verde/amarelo)\n• **PRJ-004 (Automação Logística)** em vermelho — estouro de R$ 2.5M e 5 issues abertas\n• **3 riscos críticos** requerem atenção (SAP BASIS, equipamentos importados, qualidade de dados)\n• **Comitê Executivo** agendado para 14/fev — pauta inclui aprovação de budget adicional\n\n**Ação recomendada:** Priorizar reunião com Camila Rocha (PRJ-004) antes do comitê.`,
    timestamp: '2026-02-11T09:15:05',
    sources: [
      { name: 'Dashboard Portfólio', type: 'sistema' },
      { name: 'Risk Register', type: 'documento' },
    ],
    confidence: 'Alto',
  },
];

export const portfolioTrendData = [
  { month: 'Set/25', verde: 4, amarelo: 1, vermelho: 0, total: 5 },
  { month: 'Out/25', verde: 3, amarelo: 2, vermelho: 0, total: 5 },
  { month: 'Nov/25', verde: 3, amarelo: 1, vermelho: 1, total: 5 },
  { month: 'Dez/25', verde: 3, amarelo: 2, vermelho: 1, total: 6 },
  { month: 'Jan/26', verde: 3, amarelo: 2, vermelho: 1, total: 6 },
  { month: 'Fev/26', verde: 3, amarelo: 2, vermelho: 1, total: 6 },
];

export const budgetData = [
  { name: 'ERP S/4H', baseline: 4.2, forecast: 4.5, realizado: 2.85 },
  { name: 'Planta', baseline: 180, forecast: 175, realizado: 95 },
  { name: 'Energia', baseline: 8.5, forecast: 8.2, realizado: 3.2 },
  { name: 'Logística', baseline: 12, forecast: 14.5, realizado: 9.8 },
  { name: 'LGPD', baseline: 2.1, forecast: 2.05, realizado: 1.4 },
  { name: 'BI', baseline: 3.5, forecast: 3.8, realizado: 2.1 },
];

export const curvaSData = [
  { week: 'S1', planned: 2, actual: 1.5 },
  { week: 'S5', planned: 8, actual: 7 },
  { week: 'S10', planned: 18, actual: 16 },
  { week: 'S15', planned: 30, actual: 27 },
  { week: 'S20', planned: 45, actual: 40 },
  { week: 'S25', planned: 58, actual: 52 },
  { week: 'S30', planned: 72, actual: 65 },
  { week: 'S35', planned: 84, actual: 78 },
  { week: 'S40', planned: 92, actual: 85 },
  { week: 'S45', planned: 97, actual: 91 },
  { week: 'S50', planned: 100, actual: 95 },
];

export const riskHeatmapData = [
  { probability: 'Alto', impact: 'Alto', count: 2, risks: ['Escassez SAP BASIS', 'Atraso equipamentos'] },
  { probability: 'Alto', impact: 'Médio', count: 1, risks: ['Qualidade dados BI'] },
  { probability: 'Médio', impact: 'Alto', count: 1, risks: ['Variação cambial'] },
  { probability: 'Médio', impact: 'Médio', count: 2, risks: ['Resistência à mudança', 'Turnover equipe'] },
  { probability: 'Baixo', impact: 'Alto', count: 1, risks: ['Mudança regulatória'] },
  { probability: 'Baixo', impact: 'Médio', count: 1, risks: ['Atraso licenças'] },
  { probability: 'Baixo', impact: 'Baixo', count: 0, risks: [] },
];

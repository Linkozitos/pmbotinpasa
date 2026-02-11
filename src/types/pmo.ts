export type UserRole = 'diretoria' | 'gerente' | 'pmo' | 'analista' | 'leitura';
export type ProjectStatus = 'verde' | 'amarelo' | 'vermelho' | 'concluido' | 'pausado';
export type RiskLevel = 'alto' | 'medio' | 'baixo';
export type CopilotMode = 'executivo' | 'analista';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  status: ProjectStatus;
  health: number;
  sponsor: string;
  area: string;
  gerente: string;
  budget: number;
  spent: number;
  forecast: number;
  startDate: string;
  endDate: string;
  progress: number;
  riskCount: number;
  issueCount: number;
  description: string;
}

export interface Risk {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  probability: RiskLevel;
  impact: RiskLevel;
  status: 'aberto' | 'mitigado' | 'aceito' | 'fechado';
  owner: string;
  response: string;
  createdAt: string;
}

export interface Decision {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  decidedBy: string;
  date: string;
  status: 'aprovada' | 'pendente' | 'rejeitada';
  impact: string;
}

export interface Meeting {
  id: string;
  title: string;
  type: 'comite' | 'status' | 'kickoff' | 'retrospectiva';
  date: string;
  participants: string[];
  agenda: string[];
  status: 'agendada' | 'realizada' | 'cancelada';
  actionItems: number;
  pendingItems: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { name: string; type: string }[];
  confidence?: 'Alto' | 'Médio' | 'Baixo';
}

export interface KPI {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: string;
}

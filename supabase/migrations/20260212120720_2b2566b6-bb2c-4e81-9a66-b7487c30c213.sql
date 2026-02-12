
-- =============================================
-- PMbOt INPASA — Modelo de Dados Corporativo
-- Domínio 1: Segurança, Identidade & RBAC
-- Domínio 2: Core PMO
-- Domínio 3: Financeiro & Contratos
-- Domínio 4: Knowledge & Templates
-- Domínio 5: Integrações & Auditoria
-- =============================================

-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- =============================================
-- 1. ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('diretoria','gerencia','pmo','analista','financeiro','ti','leitura');
CREATE TYPE public.project_status AS ENUM ('ideacao','planejamento','execucao','encerrado','on_hold');
CREATE TYPE public.health_status AS ENUM ('verde','amarelo','vermelho');
CREATE TYPE public.risk_status AS ENUM ('aberto','mitigando','fechado');
CREATE TYPE public.issue_status AS ENUM ('aberto','em_andamento','escalado','fechado');
CREATE TYPE public.decision_status AS ENUM ('draft','pending_approval','approved','rejected');
CREATE TYPE public.approval_action AS ENUM ('approve','reject');
CREATE TYPE public.budget_type AS ENUM ('capex','opex');
CREATE TYPE public.contract_status AS ENUM ('draft','active','closed');
CREATE TYPE public.payment_status AS ENUM ('planned','approved','paid');
CREATE TYPE public.knowledge_type AS ENUM ('file','link','query','powerbi','dataset');
CREATE TYPE public.confidentiality AS ENUM ('publico','interno','restrito');
CREATE TYPE public.connector_type AS ENUM ('erp','pmo','comms','bi','storage');
CREATE TYPE public.sync_direction AS ENUM ('pull','push','bidirectional');
CREATE TYPE public.audit_action AS ENUM ('create','read','update','delete','export','approve','external_call');
CREATE TYPE public.report_type AS ENUM ('weekly_status','monthly_exec','committee_deck','meeting_minutes','risk_log','action_plan');
CREATE TYPE public.report_status AS ENUM ('draft','pending_approval','published');
CREATE TYPE public.scope_type AS ENUM ('org','unit','department','project');
CREATE TYPE public.meeting_type AS ENUM ('comite','status','kickoff','retrospectiva');
CREATE TYPE public.meeting_status AS ENUM ('agendada','realizada','cancelada');

-- =============================================
-- 2. NÚCLEO ORGANIZACIONAL
-- =============================================

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id UUID NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  business_unit_id UUID REFERENCES public.business_units(id),
  department_id UUID REFERENCES public.departments(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. RBAC
-- =============================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  scope_type public.scope_type NOT NULL DEFAULT 'org',
  scope_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, scope_type, scope_id)
);

-- Security definer function for role checks (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id ORDER BY 
    CASE role 
      WHEN 'diretoria' THEN 1 
      WHEN 'gerencia' THEN 2 
      WHEN 'pmo' THEN 3 
      WHEN 'analista' THEN 4 
      WHEN 'financeiro' THEN 5 
      WHEN 'ti' THEN 6 
      WHEN 'leitura' THEN 7 
    END
  LIMIT 1
$$;

-- =============================================
-- 4. PORTFÓLIO & PROJETOS
-- =============================================

CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_unit_id UUID REFERENCES public.business_units(id),
  owner_user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sponsor_user_id UUID REFERENCES auth.users(id),
  manager_user_id UUID REFERENCES auth.users(id),
  strategic_objectives JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  business_unit_id UUID REFERENCES public.business_units(id),
  department_id UUID REFERENCES public.departments(id),
  sponsor_user_id UUID REFERENCES auth.users(id),
  pm_user_id UUID REFERENCES auth.users(id),
  status public.project_status NOT NULL DEFAULT 'ideacao',
  priority TEXT,
  health public.health_status NOT NULL DEFAULT 'verde',
  description TEXT,
  start_planned DATE,
  finish_planned DATE,
  start_forecast DATE,
  finish_forecast DATE,
  progress_pct NUMERIC(5,2) DEFAULT 0,
  confidentiality_level public.confidentiality NOT NULL DEFAULT 'interno',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.project_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_role TEXT NOT NULL DEFAULT 'viewer',
  allocation_pct NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE public.work_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.work_packages(id),
  wbs_code TEXT NOT NULL,
  name TEXT NOT NULL,
  deliverable TEXT,
  acceptance_criteria TEXT,
  owner_user_id UUID REFERENCES auth.users(id),
  planned_start DATE,
  planned_finish DATE,
  forecast_start DATE,
  forecast_finish DATE,
  progress_pct NUMERIC(5,2) DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_package_id UUID NOT NULL REFERENCES public.work_packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  owner_user_id UUID REFERENCES auth.users(id),
  planned_start DATE,
  planned_finish DATE,
  forecast_start DATE,
  forecast_finish DATE,
  actual_start DATE,
  actual_finish DATE,
  effort_planned_hours NUMERIC(8,2),
  effort_actual_hours NUMERIC(8,2),
  dependency_type TEXT,
  predecessor_task_id UUID REFERENCES public.tasks(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'entrega',
  date_planned DATE,
  date_forecast DATE,
  date_actual DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.schedule_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'baseline',
  source TEXT NOT NULL DEFAULT 'manual',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload_ref TEXT,
  metrics_json JSONB
);

-- =============================================
-- 5. RISCOS, ISSUES, AÇÕES, DECISÕES
-- =============================================

CREATE TABLE public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  probability SMALLINT NOT NULL DEFAULT 3,
  impact SMALLINT NOT NULL DEFAULT 3,
  score SMALLINT GENERATED ALWAYS AS (probability * impact) STORED,
  category TEXT,
  trigger_description TEXT,
  response_strategy TEXT,
  owner_user_id UUID REFERENCES auth.users(id),
  status public.risk_status NOT NULL DEFAULT 'aberto',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity SMALLINT NOT NULL DEFAULT 3,
  sla_due_date DATE,
  owner_user_id UUID REFERENCES auth.users(id),
  status public.issue_status NOT NULL DEFAULT 'aberto',
  root_cause TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  objective TEXT,
  owner_user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'aberto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID NOT NULL REFERENCES public.action_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  owner_user_id UUID REFERENCES auth.users(id),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context TEXT,
  options_json JSONB,
  decision TEXT,
  impact_json JSONB,
  requested_by_user_id UUID REFERENCES auth.users(id),
  status public.decision_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.decision_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decision_log(id) ON DELETE CASCADE,
  approver_user_id UUID NOT NULL REFERENCES auth.users(id),
  action public.approval_action NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 6. RECURSOS & CAPACIDADE
-- =============================================

CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'person',
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  department_id UUID REFERENCES public.departments(id),
  business_unit_id UUID REFERENCES public.business_units(id),
  cost_rate NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.capacity_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  work_hours_per_day NUMERIC(4,2) NOT NULL DEFAULT 8,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  exceptions_json JSONB
);

CREATE TABLE public.allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  allocation_pct NUMERIC(5,2),
  hours_per_week NUMERIC(6,2),
  planned_hours NUMERIC(8,2),
  actual_hours NUMERIC(8,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 7. FINANCEIRO & CONTRATOS
-- =============================================

CREATE TABLE public.cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  business_unit_id UUID REFERENCES public.business_units(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_center_id UUID NOT NULL REFERENCES public.cost_centers(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  capex_total NUMERIC(15,2) DEFAULT 0,
  opex_total NUMERIC(15,2) DEFAULT 0,
  baseline_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  cost_center_id UUID REFERENCES public.cost_centers(id),
  type public.budget_type NOT NULL,
  category TEXT,
  baseline_amount NUMERIC(15,2) DEFAULT 0,
  forecast_amount NUMERIC(15,2) DEFAULT 0,
  actual_amount NUMERIC(15,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  vendor_name TEXT NOT NULL,
  contract_number TEXT,
  scope_summary TEXT,
  start_date DATE,
  end_date DATE,
  total_value NUMERIC(15,2),
  currency TEXT NOT NULL DEFAULT 'BRL',
  status public.contract_status NOT NULL DEFAULT 'draft',
  source TEXT NOT NULL DEFAULT 'manual',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  due_date DATE,
  amount NUMERIC(15,2),
  percent_val NUMERIC(5,2),
  status public.payment_status NOT NULL DEFAULT 'planned',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.actual_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_connector_id UUID,
  posting_date DATE NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  cost_center_id UUID REFERENCES public.cost_centers(id),
  gl_account TEXT,
  reference_doc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.forecast_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  method TEXT NOT NULL DEFAULT 'manual',
  assumptions_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 8. KNOWLEDGE BASE
-- =============================================

CREATE TABLE public.knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.knowledge_type NOT NULL DEFAULT 'file',
  title TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id),
  business_unit_id UUID REFERENCES public.business_units(id),
  project_id UUID REFERENCES public.projects(id),
  confidentiality_level public.confidentiality NOT NULL DEFAULT 'interno',
  status TEXT NOT NULL DEFAULT 'active',
  folder TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.knowledge_item_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_item_id UUID NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  storage_uri TEXT,
  content_text TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  checksum TEXT,
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.knowledge_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.knowledge_item_tags (
  knowledge_item_id UUID NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.knowledge_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (knowledge_item_id, tag_id)
);

CREATE TABLE public.index_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_item_version_id UUID NOT NULL REFERENCES public.knowledge_item_versions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.embedding_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_item_version_id UUID NOT NULL REFERENCES public.knowledge_item_versions(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  embedding extensions.vector(1536),
  metadata_json JSONB,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT,
  knowledge_item_version_id UUID NOT NULL REFERENCES public.knowledge_item_versions(id),
  chunk_id UUID REFERENCES public.embedding_chunks(id),
  quote TEXT,
  location_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 9. TEMPLATES & REPORTS
-- =============================================

CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'md',
  knowledge_item_id UUID REFERENCES public.knowledge_items(id),
  variables_schema_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  portfolio_id UUID REFERENCES public.portfolios(id),
  type public.report_type NOT NULL,
  period_start DATE,
  period_end DATE,
  status public.report_status NOT NULL DEFAULT 'draft',
  generated_by_user_id UUID REFERENCES auth.users(id),
  output_uri TEXT,
  summary_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 10. GOVERNANÇA (Meetings)
-- =============================================

CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  title TEXT NOT NULL,
  type public.meeting_type NOT NULL DEFAULT 'status',
  date TIMESTAMPTZ NOT NULL,
  agenda JSONB,
  status public.meeting_status NOT NULL DEFAULT 'agendada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  attended BOOLEAN DEFAULT false,
  UNIQUE(meeting_id, user_id)
);

CREATE TABLE public.meeting_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 11. COMUNICAÇÃO & NOTIFICAÇÕES
-- =============================================

CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables_schema_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id UUID,
  recipient_user_id UUID REFERENCES auth.users(id),
  channel TEXT NOT NULL,
  message_template_id UUID REFERENCES public.message_templates(id),
  payload_json JSONB,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  provider_message_id TEXT,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT
);

-- =============================================
-- 12. INTEGRAÇÕES
-- =============================================

CREATE TABLE public.integration_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.connector_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'configured',
  config_json JSONB,
  secret_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.integration_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id UUID NOT NULL REFERENCES public.integration_connectors(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  direction public.sync_direction NOT NULL DEFAULT 'pull',
  schedule_cron TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.integration_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.integration_sync_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  records_read INTEGER DEFAULT 0,
  records_written INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  error_summary TEXT
);

CREATE TABLE public.external_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_entity_type TEXT NOT NULL,
  internal_entity_id UUID NOT NULL,
  connector_id UUID NOT NULL REFERENCES public.integration_connectors(id),
  external_entity_type TEXT,
  external_id TEXT NOT NULL,
  external_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 13. AUDITORIA (IMUTÁVEL)
-- =============================================

CREATE TABLE public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_user_id UUID REFERENCES auth.users(id),
  action public.audit_action NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  before_json JSONB,
  after_json JSONB,
  reason TEXT,
  request_trace_id TEXT,
  system_source TEXT
);

-- =============================================
-- 14. ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actual_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_item_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.index_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embedding_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 15. RLS POLICIES
-- =============================================

-- Profiles: users see own, diretoria/pmo see all
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Privileged view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- User roles: only visible to self or privileged
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Privileged view all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo'));
CREATE POLICY "Privileged manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria'));

-- Org structure: authenticated can read
CREATE POLICY "Authenticated read orgs" ON public.organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read units" ON public.business_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read depts" ON public.departments FOR SELECT TO authenticated USING (true);

-- Projects: authenticated can read (non-deleted), write for privileged
CREATE POLICY "Authenticated read projects" ON public.projects FOR SELECT TO authenticated
  USING (deleted_at IS NULL);
CREATE POLICY "Privileged manage projects" ON public.projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));

-- Portfolio/Programs: authenticated read
CREATE POLICY "Authenticated read portfolios" ON public.portfolios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read programs" ON public.programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage portfolios" ON public.portfolios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo'));
CREATE POLICY "Privileged manage programs" ON public.programs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo'));

-- Project memberships
CREATE POLICY "Authenticated read memberships" ON public.project_memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage memberships" ON public.project_memberships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo'));

-- WBS, Tasks, Milestones: authenticated read, privileged + members write
CREATE POLICY "Authenticated read wp" ON public.work_packages FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Privileged manage wp" ON public.work_packages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));

CREATE POLICY "Authenticated read tasks" ON public.tasks FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Privileged manage tasks" ON public.tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));

CREATE POLICY "Authenticated read milestones" ON public.milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage milestones" ON public.milestones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));

CREATE POLICY "Authenticated read snapshots" ON public.schedule_snapshots FOR SELECT TO authenticated USING (true);

-- Risks, Issues, Actions, Decisions: authenticated read
CREATE POLICY "Authenticated read risks" ON public.risks FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Privileged manage risks" ON public.risks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));

CREATE POLICY "Authenticated read issues" ON public.issues FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Privileged manage issues" ON public.issues FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));

CREATE POLICY "Authenticated read action_plans" ON public.action_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage action_plans" ON public.action_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));

CREATE POLICY "Authenticated read action_items" ON public.action_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage action_items" ON public.action_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));

CREATE POLICY "Authenticated read decisions" ON public.decision_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage decisions" ON public.decision_log FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));

CREATE POLICY "Authenticated read approvals" ON public.decision_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Approvers manage approvals" ON public.decision_approvals FOR INSERT TO authenticated
  WITH CHECK (approver_user_id = auth.uid());

-- Resources, Capacity, Allocations
CREATE POLICY "Authenticated read resources" ON public.resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage resources" ON public.resources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo'));

CREATE POLICY "Authenticated read calendars" ON public.capacity_calendars FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read allocations" ON public.allocations FOR SELECT TO authenticated USING (true);

-- Financial
CREATE POLICY "Authenticated read cost_centers" ON public.cost_centers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read budgets" ON public.budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read budget_lines" ON public.budget_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage budget_lines" ON public.budget_lines FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'financeiro'));

CREATE POLICY "Authenticated read contracts" ON public.contracts FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Privileged manage contracts" ON public.contracts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'financeiro'));

CREATE POLICY "Authenticated read payments" ON public.payment_milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read actual_costs" ON public.actual_costs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read forecast_costs" ON public.forecast_costs FOR SELECT TO authenticated USING (true);

-- Knowledge
CREATE POLICY "Authenticated read knowledge" ON public.knowledge_items FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Privileged manage knowledge" ON public.knowledge_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR owner_user_id = auth.uid());

CREATE POLICY "Authenticated read versions" ON public.knowledge_item_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read tags" ON public.knowledge_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read item_tags" ON public.knowledge_item_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read index_jobs" ON public.index_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read chunks" ON public.embedding_chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read citations" ON public.citations FOR SELECT TO authenticated USING (true);

-- Templates & Reports
CREATE POLICY "Authenticated read templates" ON public.templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage templates" ON public.templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo'));

CREATE POLICY "Authenticated read reports" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage reports" ON public.reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));

CREATE POLICY "Authenticated read workflows" ON public.approval_workflows FOR SELECT TO authenticated USING (true);

-- Meetings
CREATE POLICY "Authenticated read meetings" ON public.meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged manage meetings" ON public.meetings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'gerencia'));
CREATE POLICY "Authenticated read participants" ON public.meeting_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read meeting_actions" ON public.meeting_action_items FOR SELECT TO authenticated USING (true);

-- Notifications
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (recipient_user_id = auth.uid());
CREATE POLICY "Authenticated read msg_templates" ON public.message_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users read own deliveries" ON public.notification_deliveries FOR SELECT TO authenticated USING (true);

-- Integrations (pmo/ti only)
CREATE POLICY "Privileged read connectors" ON public.integration_connectors FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'ti'));
CREATE POLICY "Privileged manage connectors" ON public.integration_connectors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'ti'));

CREATE POLICY "Privileged read sync_jobs" ON public.integration_sync_jobs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'ti'));
CREATE POLICY "Privileged read sync_runs" ON public.integration_sync_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'ti'));
CREATE POLICY "Authenticated read ext_refs" ON public.external_references FOR SELECT TO authenticated USING (true);

-- Audit: append-only, read for privileged
CREATE POLICY "Privileged read audit" ON public.audit_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'diretoria') OR public.has_role(auth.uid(), 'pmo'));
CREATE POLICY "System insert audit" ON public.audit_events FOR INSERT TO authenticated
  WITH CHECK (true);

-- =============================================
-- 16. TRIGGERS (updated_at)
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_work_packages_updated BEFORE UPDATE ON public.work_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_risks_updated BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_issues_updated BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_action_plans_updated BEFORE UPDATE ON public.action_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_action_items_updated BEFORE UPDATE ON public.action_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_decision_log_updated BEFORE UPDATE ON public.decision_log FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_budget_lines_updated BEFORE UPDATE ON public.budget_lines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_contracts_updated BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_knowledge_items_updated BEFORE UPDATE ON public.knowledge_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_meetings_updated BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_connectors_updated BEFORE UPDATE ON public.integration_connectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_approval_workflows_updated BEFORE UPDATE ON public.approval_workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_portfolios_updated BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- 17. AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 18. INDEXES
-- =============================================

CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_health ON public.projects(health);
CREATE INDEX idx_risks_project ON public.risks(project_id);
CREATE INDEX idx_issues_project ON public.issues(project_id);
CREATE INDEX idx_tasks_wp ON public.tasks(work_package_id);
CREATE INDEX idx_wp_project ON public.work_packages(project_id);
CREATE INDEX idx_budget_lines_project ON public.budget_lines(project_id);
CREATE INDEX idx_actual_costs_project ON public.actual_costs(project_id);
CREATE INDEX idx_knowledge_folder ON public.knowledge_items(folder);
CREATE INDEX idx_audit_resource ON public.audit_events(resource_type, resource_id);
CREATE INDEX idx_audit_actor ON public.audit_events(actor_user_id);
CREATE INDEX idx_audit_timestamp ON public.audit_events(timestamp DESC);
CREATE INDEX idx_ext_ref_internal ON public.external_references(internal_entity_type, internal_entity_id);
CREATE INDEX idx_allocations_project ON public.allocations(project_id);
CREATE INDEX idx_allocations_resource ON public.allocations(resource_id);

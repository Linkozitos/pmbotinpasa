
-- =============================================
-- MÓDULO: MEMORIAL DE CÁLCULO DE AVANÇO
-- =============================================

-- 1. Memórias de Cálculo
CREATE TABLE public.calculation_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  discipline TEXT,
  project_id UUID REFERENCES public.projects(id),
  total_weight_kg NUMERIC NOT NULL DEFAULT 0,
  advanced_weight_kg NUMERIC NOT NULL DEFAULT 0,
  progress_pct NUMERIC NOT NULL DEFAULT 0,
  created_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.calculation_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read calculation_memories"
  ON public.calculation_memories FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Privileged manage calculation_memories"
  ON public.calculation_memories FOR ALL
  USING (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR has_role(auth.uid(), 'gerencia'::app_role));

CREATE TRIGGER update_calculation_memories_updated_at
  BEFORE UPDATE ON public.calculation_memories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 2. Critérios por Memória
CREATE TABLE public.memory_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES public.calculation_memories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight_pct NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'slider',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memory_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read memory_criteria"
  ON public.memory_criteria FOR SELECT USING (true);

CREATE POLICY "Privileged manage memory_criteria"
  ON public.memory_criteria FOR ALL
  USING (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR has_role(auth.uid(), 'gerencia'::app_role));

-- 3. Registros da Memória (linhas físicas)
CREATE TABLE public.memory_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES public.calculation_memories(id) ON DELETE CASCADE,
  uid TEXT,
  area TEXT,
  line_tag TEXT,
  unit TEXT,
  quantity NUMERIC,
  gauge TEXT,
  main_material TEXT,
  code TEXT,
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  advanced_weight_kg NUMERIC NOT NULL DEFAULT 0,
  progress_pct NUMERIC NOT NULL DEFAULT 0,
  company TEXT,
  front TEXT,
  observations TEXT,
  priority TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.memory_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read memory_records"
  ON public.memory_records FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Privileged manage memory_records"
  ON public.memory_records FOR ALL
  USING (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR has_role(auth.uid(), 'gerencia'::app_role));

CREATE TRIGGER update_memory_records_updated_at
  BEFORE UPDATE ON public.memory_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. Valores dos Critérios por Registro
CREATE TABLE public.memory_record_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES public.memory_records(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES public.memory_criteria(id) ON DELETE CASCADE,
  completion_pct NUMERIC NOT NULL DEFAULT 0,
  observation TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_user_id UUID,
  UNIQUE(record_id, criterion_id)
);

ALTER TABLE public.memory_record_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read memory_record_criteria"
  ON public.memory_record_criteria FOR SELECT USING (true);

CREATE POLICY "Privileged manage memory_record_criteria"
  ON public.memory_record_criteria FOR ALL
  USING (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR has_role(auth.uid(), 'gerencia'::app_role));

CREATE TRIGGER update_memory_record_criteria_updated_at
  BEFORE UPDATE ON public.memory_record_criteria
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. Cronograma (integração MS Project)
CREATE TABLE public.schedule_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  uid TEXT NOT NULL,
  wbs TEXT,
  activity_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  duration_days NUMERIC,
  completion_pct NUMERIC NOT NULL DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read schedule_items"
  ON public.schedule_items FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Privileged manage schedule_items"
  ON public.schedule_items FOR ALL
  USING (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR has_role(auth.uid(), 'gerencia'::app_role));

CREATE TRIGGER update_schedule_items_updated_at
  BEFORE UPDATE ON public.schedule_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 6. Visões Salvas
CREATE TABLE public.memory_saved_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID REFERENCES public.calculation_memories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config_json JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memory_saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read memory_saved_views"
  ON public.memory_saved_views FOR SELECT USING (true);

CREATE POLICY "Privileged manage memory_saved_views"
  ON public.memory_saved_views FOR ALL
  USING (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR has_role(auth.uid(), 'gerencia'::app_role));

-- 7. Log de Importação
CREATE TABLE public.import_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  file_name TEXT,
  records_total INT DEFAULT 0,
  records_created INT DEFAULT 0,
  records_updated INT DEFAULT 0,
  records_failed INT DEFAULT 0,
  errors_json JSONB DEFAULT '[]',
  imported_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read import_logs"
  ON public.import_logs FOR SELECT USING (true);

CREATE POLICY "Privileged manage import_logs"
  ON public.import_logs FOR ALL
  USING (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR has_role(auth.uid(), 'gerencia'::app_role));

-- 8. Índices para performance
CREATE INDEX idx_memory_records_memory_id ON public.memory_records(memory_id);
CREATE INDEX idx_memory_records_uid ON public.memory_records(uid);
CREATE INDEX idx_memory_record_criteria_record_id ON public.memory_record_criteria(record_id);
CREATE INDEX idx_memory_criteria_memory_id ON public.memory_criteria(memory_id);
CREATE INDEX idx_schedule_items_uid ON public.schedule_items(uid);
CREATE INDEX idx_schedule_items_project_id ON public.schedule_items(project_id);
CREATE INDEX idx_calculation_memories_project_id ON public.calculation_memories(project_id);

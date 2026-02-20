import { supabase, assertSupabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type ProjectInsert = Tables['projects']['Insert'];
type RiskInsert = Tables['risks']['Insert'];
type IssueInsert = Tables['issues']['Insert'];
type MeetingInsert = Tables['meetings']['Insert'];
type DecisionInsert = Tables['decision_log']['Insert'];

type ProjectStatus = Database['public']['Enums']['project_status'];
type HealthStatus = Database['public']['Enums']['health_status'];
type RiskStatus = Database['public']['Enums']['risk_status'];
type IssueStatus = Database['public']['Enums']['issue_status'];
type MeetingStatus = Database['public']['Enums']['meeting_status'];
type DecisionStatus = Database['public']['Enums']['decision_status'];

// ===== PROJECTS =====
export async function listProjects(filters?: { status?: ProjectStatus; health?: HealthStatus; search?: string }) {
  try {
    const client = assertSupabase();
    let query = client
      .from('projects')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.health) query = query.eq('health', filters.health);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing projects:', error);
    return [];
  }
}

export async function getProject(id: string) {
  const client = assertSupabase();
  const { data, error } = await client.from('projects').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createProject(project: ProjectInsert) {
  const client = assertSupabase();
  const { data, error } = await client.from('projects').insert(project).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, patch: Partial<Tables['projects']['Update']>) {
  const client = assertSupabase();
  const { data, error } = await client.from('projects').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  const client = assertSupabase();
  const { error } = await client.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ===== RISKS =====
export async function listRisks(filters?: { projectId?: string; status?: RiskStatus }) {
  let query = supabase.from('risks').select('*, projects(name, code)').is('deleted_at', null).order('score', { ascending: false });
  if (filters?.projectId) query = query.eq('project_id', filters.projectId);
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createRisk(risk: RiskInsert) {
  const { data, error } = await supabase.from('risks').insert(risk).select().single();
  if (error) throw error;
  return data;
}

export async function updateRisk(id: string, patch: Partial<Tables['risks']['Update']>) {
  const { data, error } = await supabase.from('risks').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRisk(id: string) {
  const { error } = await supabase.from('risks').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ===== ISSUES =====
export async function listIssues(filters?: { projectId?: string; status?: IssueStatus }) {
  let query = supabase.from('issues').select('*, projects(name, code)').is('deleted_at', null).order('severity', { ascending: false });
  if (filters?.projectId) query = query.eq('project_id', filters.projectId);
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createIssue(issue: IssueInsert) {
  const { data, error } = await supabase.from('issues').insert(issue).select().single();
  if (error) throw error;
  return data;
}

export async function updateIssue(id: string, patch: Partial<Tables['issues']['Update']>) {
  const { data, error } = await supabase.from('issues').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ===== CONTRACTS =====
export async function listContracts(filters?: { projectId?: string }) {
  let query = supabase.from('contracts').select('*').is('deleted_at', null);
  if (filters?.projectId) query = query.eq('project_id', filters.projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ===== BUDGET =====
export async function listBudgetLines(filters?: { projectId?: string }) {
  let query = supabase.from('budget_lines').select('*, projects(name, code)');
  if (filters?.projectId) query = query.eq('project_id', filters.projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ===== MEETINGS =====
export async function listMeetings(filters?: { status?: MeetingStatus }) {
  let query = supabase.from('meetings').select('*').order('date', { ascending: true });
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createMeeting(meeting: MeetingInsert) {
  const { data, error } = await supabase.from('meetings').insert(meeting).select().single();
  if (error) throw error;
  return data;
}

export async function updateMeeting(id: string, patch: Partial<Tables['meetings']['Update']>) {
  const { data, error } = await supabase.from('meetings').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ===== DECISIONS =====
export async function listDecisions(filters?: { projectId?: string; status?: DecisionStatus }) {
  let query = supabase.from('decision_log').select('*, projects(name, code)');
  if (filters?.projectId) query = query.eq('project_id', filters.projectId);
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createDecision(decision: DecisionInsert) {
  const { data, error } = await supabase.from('decision_log').insert(decision).select().single();
  if (error) throw error;
  return data;
}

export async function updateDecision(id: string, patch: Partial<Tables['decision_log']['Update']>) {
  const { data, error } = await supabase.from('decision_log').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ===== RESOURCES =====
export async function listResources() {
  const { data, error } = await supabase.from('resources').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function listAllocations(filters?: { projectId?: string; resourceId?: string }) {
  let query = supabase.from('allocations').select('*, resources(name, role_title), projects(name, code)');
  if (filters?.projectId) query = query.eq('project_id', filters.projectId);
  if (filters?.resourceId) query = query.eq('resource_id', filters.resourceId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ===== WORK PACKAGES =====
export async function listWorkPackages(projectId: string) {
  const { data, error } = await supabase.from('work_packages').select('*').eq('project_id', projectId).is('deleted_at', null).order('wbs_code');
  if (error) throw error;
  return data;
}

// ===== TASKS =====
export async function listTasks(workPackageId: string) {
  const { data, error } = await supabase.from('tasks').select('*').eq('work_package_id', workPackageId).is('deleted_at', null).order('planned_start');
  if (error) throw error;
  return data;
}

// ===== MILESTONES =====
export async function listMilestones(projectId: string) {
  const { data, error } = await supabase.from('milestones').select('*').eq('project_id', projectId).order('date_planned');
  if (error) throw error;
  return data;
}

// ===== ACTUAL COSTS =====
export async function listActualCosts(projectId?: string) {
  let query = supabase.from('actual_costs').select('*');
  if (projectId) query = query.eq('project_id', projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ===== FORECAST COSTS =====
export async function listForecastCosts(projectId?: string) {
  let query = supabase.from('forecast_costs').select('*');
  if (projectId) query = query.eq('project_id', projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ===== DASHBOARD AGGREGATES =====
export async function getDashboardData() {
  try {
    const client = assertSupabase();
    const results = await Promise.allSettled([
      client.from('projects').select('id, name, code, status, health, progress_pct, priority').is('deleted_at', null),
      client.from('risks').select('id, status, probability, impact, score, project_id').is('deleted_at', null),
      client.from('issues').select('id, status, severity, project_id').is('deleted_at', null),
      client.from('contracts').select('id, status, total_value').is('deleted_at', null),
      client.from('budget_lines').select('id, project_id, type, baseline_amount, forecast_amount, actual_amount'),
      client.from('meetings').select('id, title, date, status, agenda').eq('status', 'agendada').order('date', { ascending: true }).limit(3),
    ]);

    const getValue = (res: PromiseSettledResult<any>, defaultValue: any = []) => {
      if (res.status === 'fulfilled' && !res.value.error) {
        return res.value.data || defaultValue;
      }
      return defaultValue;
    };

    return {
      projects: getValue(results[0]),
      risks: getValue(results[1]),
      issues: getValue(results[2]),
      contracts: getValue(results[3]),
      budgetLines: getValue(results[4]),
      meetings: getValue(results[5]),
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      projects: [],
      risks: [],
      issues: [],
      contracts: [],
      budgetLines: [],
      meetings: [],
    };
  }
}

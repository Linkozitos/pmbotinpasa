export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          action_plan_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          owner_user_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          action_plan_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          owner_user_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          action_plan_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          owner_user_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plans: {
        Row: {
          created_at: string
          id: string
          objective: string | null
          owner_user_id: string | null
          project_id: string
          source_id: string
          source_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          objective?: string | null
          owner_user_id?: string | null
          project_id: string
          source_id: string
          source_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          objective?: string | null
          owner_user_id?: string | null
          project_id?: string
          source_id?: string
          source_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      actual_costs: {
        Row: {
          amount: number
          cost_center_id: string | null
          created_at: string
          currency: string
          gl_account: string | null
          id: string
          posting_date: string
          project_id: string
          reference_doc: string | null
          source_connector_id: string | null
        }
        Insert: {
          amount: number
          cost_center_id?: string | null
          created_at?: string
          currency?: string
          gl_account?: string | null
          id?: string
          posting_date: string
          project_id: string
          reference_doc?: string | null
          source_connector_id?: string | null
        }
        Update: {
          amount?: number
          cost_center_id?: string | null
          created_at?: string
          currency?: string
          gl_account?: string | null
          id?: string
          posting_date?: string
          project_id?: string
          reference_doc?: string | null
          source_connector_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actual_costs_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actual_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      allocations: {
        Row: {
          actual_hours: number | null
          allocation_pct: number | null
          created_at: string
          from_date: string
          hours_per_week: number | null
          id: string
          planned_hours: number | null
          project_id: string
          resource_id: string
          to_date: string
        }
        Insert: {
          actual_hours?: number | null
          allocation_pct?: number | null
          created_at?: string
          from_date: string
          hours_per_week?: number | null
          id?: string
          planned_hours?: number | null
          project_id: string
          resource_id: string
          to_date: string
        }
        Update: {
          actual_hours?: number | null
          allocation_pct?: number | null
          created_at?: string
          from_date?: string
          hours_per_week?: number | null
          id?: string
          planned_hours?: number | null
          project_id?: string
          resource_id?: string
          to_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          created_at: string
          id: string
          requested_by_user_id: string | null
          resource_id: string
          resource_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          requested_by_user_id?: string | null
          resource_id: string
          resource_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          requested_by_user_id?: string | null
          resource_id?: string
          resource_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_user_id: string | null
          after_json: Json | null
          before_json: Json | null
          id: string
          reason: string | null
          request_trace_id: string | null
          resource_id: string | null
          resource_type: string
          system_source: string | null
          timestamp: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_user_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          id?: string
          reason?: string | null
          request_trace_id?: string | null
          resource_id?: string | null
          resource_type: string
          system_source?: string | null
          timestamp?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_user_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          id?: string
          reason?: string | null
          request_trace_id?: string | null
          resource_id?: string | null
          resource_type?: string
          system_source?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      budget_lines: {
        Row: {
          actual_amount: number | null
          baseline_amount: number | null
          category: string | null
          cost_center_id: string | null
          created_at: string
          currency: string
          forecast_amount: number | null
          id: string
          project_id: string
          type: Database["public"]["Enums"]["budget_type"]
          updated_at: string
        }
        Insert: {
          actual_amount?: number | null
          baseline_amount?: number | null
          category?: string | null
          cost_center_id?: string | null
          created_at?: string
          currency?: string
          forecast_amount?: number | null
          id?: string
          project_id: string
          type: Database["public"]["Enums"]["budget_type"]
          updated_at?: string
        }
        Update: {
          actual_amount?: number | null
          baseline_amount?: number | null
          category?: string | null
          cost_center_id?: string | null
          created_at?: string
          currency?: string
          forecast_amount?: number | null
          id?: string
          project_id?: string
          type?: Database["public"]["Enums"]["budget_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_lines_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          baseline_date: string | null
          capex_total: number | null
          cost_center_id: string
          created_at: string
          fiscal_year: number
          id: string
          opex_total: number | null
        }
        Insert: {
          baseline_date?: string | null
          capex_total?: number | null
          cost_center_id: string
          created_at?: string
          fiscal_year: number
          id?: string
          opex_total?: number | null
        }
        Update: {
          baseline_date?: string | null
          capex_total?: number | null
          cost_center_id?: string
          created_at?: string
          fiscal_year?: number
          id?: string
          opex_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      business_units: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calculation_memories: {
        Row: {
          advanced_weight_kg: number
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          discipline: string | null
          id: string
          name: string
          progress_pct: number
          project_id: string | null
          total_weight_kg: number
          updated_at: string
        }
        Insert: {
          advanced_weight_kg?: number
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          discipline?: string | null
          id?: string
          name: string
          progress_pct?: number
          project_id?: string | null
          total_weight_kg?: number
          updated_at?: string
        }
        Update: {
          advanced_weight_kg?: number
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          discipline?: string | null
          id?: string
          name?: string
          progress_pct?: number
          project_id?: string | null
          total_weight_kg?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calculation_memories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      capacity_calendars: {
        Row: {
          exceptions_json: Json | null
          id: string
          resource_id: string
          timezone: string
          work_hours_per_day: number
        }
        Insert: {
          exceptions_json?: Json | null
          id?: string
          resource_id: string
          timezone?: string
          work_hours_per_day?: number
        }
        Update: {
          exceptions_json?: Json | null
          id?: string
          resource_id?: string
          timezone?: string
          work_hours_per_day?: number
        }
        Relationships: [
          {
            foreignKeyName: "capacity_calendars_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      citations: {
        Row: {
          chunk_id: string | null
          created_at: string
          id: string
          knowledge_item_version_id: string
          location_json: Json | null
          quote: string | null
          request_id: string | null
        }
        Insert: {
          chunk_id?: string | null
          created_at?: string
          id?: string
          knowledge_item_version_id: string
          location_json?: Json | null
          quote?: string | null
          request_id?: string | null
        }
        Update: {
          chunk_id?: string | null
          created_at?: string
          id?: string
          knowledge_item_version_id?: string
          location_json?: Json | null
          quote?: string | null
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citations_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "embedding_chunks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citations_knowledge_item_version_id_fkey"
            columns: ["knowledge_item_version_id"]
            isOneToOne: false
            referencedRelation: "knowledge_item_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_number: string | null
          created_at: string
          currency: string
          deleted_at: string | null
          end_date: string | null
          id: string
          project_id: string | null
          scope_summary: string | null
          source: string
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"]
          total_value: number | null
          updated_at: string
          vendor_name: string
        }
        Insert: {
          contract_number?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          project_id?: string | null
          scope_summary?: string | null
          source?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          total_value?: number | null
          updated_at?: string
          vendor_name: string
        }
        Update: {
          contract_number?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          project_id?: string | null
          scope_summary?: string | null
          source?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          total_value?: number | null
          updated_at?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          business_unit_id: string | null
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          business_unit_id?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          business_unit_id?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_approvals: {
        Row: {
          action: Database["public"]["Enums"]["approval_action"]
          approver_user_id: string
          comment: string | null
          created_at: string
          decision_id: string
          id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["approval_action"]
          approver_user_id: string
          comment?: string | null
          created_at?: string
          decision_id: string
          id?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["approval_action"]
          approver_user_id?: string
          comment?: string | null
          created_at?: string
          decision_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_approvals_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decision_log"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_log: {
        Row: {
          context: string | null
          created_at: string
          decision: string | null
          id: string
          impact_json: Json | null
          options_json: Json | null
          project_id: string
          requested_by_user_id: string | null
          status: Database["public"]["Enums"]["decision_status"]
          title: string
          updated_at: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          decision?: string | null
          id?: string
          impact_json?: Json | null
          options_json?: Json | null
          project_id: string
          requested_by_user_id?: string | null
          status?: Database["public"]["Enums"]["decision_status"]
          title: string
          updated_at?: string
        }
        Update: {
          context?: string | null
          created_at?: string
          decision?: string | null
          id?: string
          impact_json?: Json | null
          options_json?: Json | null
          project_id?: string
          requested_by_user_id?: string | null
          status?: Database["public"]["Enums"]["decision_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          business_unit_id: string
          code: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          business_unit_id: string
          code?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          business_unit_id?: string
          code?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      embedding_chunks: {
        Row: {
          chunk_index: number
          created_at: string
          embedding: string | null
          id: string
          knowledge_item_version_id: string
          metadata_json: Json | null
          text: string
          token_count: number | null
        }
        Insert: {
          chunk_index: number
          created_at?: string
          embedding?: string | null
          id?: string
          knowledge_item_version_id: string
          metadata_json?: Json | null
          text: string
          token_count?: number | null
        }
        Update: {
          chunk_index?: number
          created_at?: string
          embedding?: string | null
          id?: string
          knowledge_item_version_id?: string
          metadata_json?: Json | null
          text?: string
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "embedding_chunks_knowledge_item_version_id_fkey"
            columns: ["knowledge_item_version_id"]
            isOneToOne: false
            referencedRelation: "knowledge_item_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      external_references: {
        Row: {
          connector_id: string
          created_at: string
          external_entity_type: string | null
          external_id: string
          external_url: string | null
          id: string
          internal_entity_id: string
          internal_entity_type: string
        }
        Insert: {
          connector_id: string
          created_at?: string
          external_entity_type?: string | null
          external_id: string
          external_url?: string | null
          id?: string
          internal_entity_id: string
          internal_entity_type: string
        }
        Update: {
          connector_id?: string
          created_at?: string
          external_entity_type?: string | null
          external_id?: string
          external_url?: string | null
          id?: string
          internal_entity_id?: string
          internal_entity_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_references_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_costs: {
        Row: {
          amount: number
          assumptions_json: Json | null
          created_at: string
          id: string
          method: string
          period: string
          project_id: string
        }
        Insert: {
          amount: number
          assumptions_json?: Json | null
          created_at?: string
          id?: string
          method?: string
          period: string
          project_id: string
        }
        Update: {
          amount?: number
          assumptions_json?: Json | null
          created_at?: string
          id?: string
          method?: string
          period?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forecast_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      import_logs: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          errors_json: Json | null
          file_name: string | null
          id: string
          imported_by_user_id: string | null
          records_created: number | null
          records_failed: number | null
          records_total: number | null
          records_updated: number | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          errors_json?: Json | null
          file_name?: string | null
          id?: string
          imported_by_user_id?: string | null
          records_created?: number | null
          records_failed?: number | null
          records_total?: number | null
          records_updated?: number | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          errors_json?: Json | null
          file_name?: string | null
          id?: string
          imported_by_user_id?: string | null
          records_created?: number | null
          records_failed?: number | null
          records_total?: number | null
          records_updated?: number | null
        }
        Relationships: []
      }
      index_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          finished_at: string | null
          id: string
          knowledge_item_version_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          knowledge_item_version_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          knowledge_item_version_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "index_jobs_knowledge_item_version_id_fkey"
            columns: ["knowledge_item_version_id"]
            isOneToOne: false
            referencedRelation: "knowledge_item_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connectors: {
        Row: {
          config_json: Json | null
          created_at: string
          id: string
          name: string
          secret_name: string | null
          status: string
          type: Database["public"]["Enums"]["connector_type"]
          updated_at: string
        }
        Insert: {
          config_json?: Json | null
          created_at?: string
          id?: string
          name: string
          secret_name?: string | null
          status?: string
          type: Database["public"]["Enums"]["connector_type"]
          updated_at?: string
        }
        Update: {
          config_json?: Json | null
          created_at?: string
          id?: string
          name?: string
          secret_name?: string | null
          status?: string
          type?: Database["public"]["Enums"]["connector_type"]
          updated_at?: string
        }
        Relationships: []
      }
      integration_sync_jobs: {
        Row: {
          connector_id: string
          created_at: string
          direction: Database["public"]["Enums"]["sync_direction"]
          enabled: boolean
          entity_type: string
          id: string
          schedule_cron: string | null
        }
        Insert: {
          connector_id: string
          created_at?: string
          direction?: Database["public"]["Enums"]["sync_direction"]
          enabled?: boolean
          entity_type: string
          id?: string
          schedule_cron?: string | null
        }
        Update: {
          connector_id?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["sync_direction"]
          enabled?: boolean
          entity_type?: string
          id?: string
          schedule_cron?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_jobs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_runs: {
        Row: {
          error_summary: string | null
          finished_at: string | null
          id: string
          job_id: string
          records_read: number | null
          records_written: number | null
          started_at: string
          status: string
        }
        Insert: {
          error_summary?: string | null
          finished_at?: string | null
          id?: string
          job_id: string
          records_read?: number | null
          records_written?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          error_summary?: string | null
          finished_at?: string | null
          id?: string
          job_id?: string
          records_read?: number | null
          records_written?: number | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_runs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "integration_sync_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          owner_user_id: string | null
          project_id: string
          root_cause: string | null
          severity: number
          sla_due_date: string | null
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          owner_user_id?: string | null
          project_id: string
          root_cause?: string | null
          severity?: number
          sla_due_date?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          owner_user_id?: string | null
          project_id?: string
          root_cause?: string | null
          severity?: number
          sla_due_date?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_item_tags: {
        Row: {
          knowledge_item_id: string
          tag_id: string
        }
        Insert: {
          knowledge_item_id: string
          tag_id: string
        }
        Update: {
          knowledge_item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_item_tags_knowledge_item_id_fkey"
            columns: ["knowledge_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "knowledge_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_item_versions: {
        Row: {
          checksum: string | null
          content_text: string | null
          created_at: string
          created_by_user_id: string | null
          id: string
          knowledge_item_id: string
          mime_type: string | null
          size_bytes: number | null
          storage_uri: string | null
          version_number: number
        }
        Insert: {
          checksum?: string | null
          content_text?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          knowledge_item_id: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_uri?: string | null
          version_number?: number
        }
        Update: {
          checksum?: string | null
          content_text?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          knowledge_item_id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_uri?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_item_versions_knowledge_item_id_fkey"
            columns: ["knowledge_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          business_unit_id: string | null
          confidentiality_level: Database["public"]["Enums"]["confidentiality"]
          created_at: string
          deleted_at: string | null
          folder: string | null
          id: string
          owner_user_id: string | null
          project_id: string | null
          status: string
          title: string
          type: Database["public"]["Enums"]["knowledge_type"]
          updated_at: string
        }
        Insert: {
          business_unit_id?: string | null
          confidentiality_level?: Database["public"]["Enums"]["confidentiality"]
          created_at?: string
          deleted_at?: string | null
          folder?: string | null
          id?: string
          owner_user_id?: string | null
          project_id?: string | null
          status?: string
          title: string
          type?: Database["public"]["Enums"]["knowledge_type"]
          updated_at?: string
        }
        Update: {
          business_unit_id?: string | null
          confidentiality_level?: Database["public"]["Enums"]["confidentiality"]
          created_at?: string
          deleted_at?: string | null
          folder?: string | null
          id?: string
          owner_user_id?: string | null
          project_id?: string | null
          status?: string
          title?: string
          type?: Database["public"]["Enums"]["knowledge_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_items_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      meeting_action_items: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          meeting_id: string
          owner_user_id: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          meeting_id: string
          owner_user_id?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          meeting_id?: string
          owner_user_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          attended: boolean | null
          id: string
          meeting_id: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          id?: string
          meeting_id: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          id?: string
          meeting_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: Json | null
          created_at: string
          date: string
          id: string
          project_id: string | null
          status: Database["public"]["Enums"]["meeting_status"]
          title: string
          type: Database["public"]["Enums"]["meeting_type"]
          updated_at: string
        }
        Insert: {
          agenda?: Json | null
          created_at?: string
          date: string
          id?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          title: string
          type?: Database["public"]["Enums"]["meeting_type"]
          updated_at?: string
        }
        Update: {
          agenda?: Json | null
          created_at?: string
          date?: string
          id?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          title?: string
          type?: Database["public"]["Enums"]["meeting_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_criteria: {
        Row: {
          created_at: string
          id: string
          memory_id: string
          name: string
          sort_order: number
          type: string
          weight_pct: number
        }
        Insert: {
          created_at?: string
          id?: string
          memory_id: string
          name: string
          sort_order?: number
          type?: string
          weight_pct?: number
        }
        Update: {
          created_at?: string
          id?: string
          memory_id?: string
          name?: string
          sort_order?: number
          type?: string
          weight_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "memory_criteria_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "calculation_memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_record_criteria: {
        Row: {
          completion_pct: number
          criterion_id: string
          id: string
          observation: string | null
          record_id: string
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          completion_pct?: number
          criterion_id: string
          id?: string
          observation?: string | null
          record_id: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          completion_pct?: number
          criterion_id?: string
          id?: string
          observation?: string | null
          record_id?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_record_criteria_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "memory_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_record_criteria_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "memory_records"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_records: {
        Row: {
          advanced_weight_kg: number
          area: string | null
          code: string | null
          company: string | null
          created_at: string
          custom_fields: Json | null
          deleted_at: string | null
          front: string | null
          gauge: string | null
          id: string
          line_tag: string | null
          main_material: string | null
          memory_id: string
          observations: string | null
          priority: string | null
          progress_pct: number
          quantity: number | null
          uid: string | null
          unit: string | null
          updated_at: string
          weight_kg: number
        }
        Insert: {
          advanced_weight_kg?: number
          area?: string | null
          code?: string | null
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          deleted_at?: string | null
          front?: string | null
          gauge?: string | null
          id?: string
          line_tag?: string | null
          main_material?: string | null
          memory_id: string
          observations?: string | null
          priority?: string | null
          progress_pct?: number
          quantity?: number | null
          uid?: string | null
          unit?: string | null
          updated_at?: string
          weight_kg?: number
        }
        Update: {
          advanced_weight_kg?: number
          area?: string | null
          code?: string | null
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          deleted_at?: string | null
          front?: string | null
          gauge?: string | null
          id?: string
          line_tag?: string | null
          main_material?: string | null
          memory_id?: string
          observations?: string | null
          priority?: string | null
          progress_pct?: number
          quantity?: number | null
          uid?: string | null
          unit?: string | null
          updated_at?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "memory_records_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "calculation_memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_saved_views: {
        Row: {
          config_json: Json
          created_at: string
          created_by_user_id: string | null
          id: string
          is_default: boolean
          memory_id: string | null
          name: string
        }
        Insert: {
          config_json?: Json
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_default?: boolean
          memory_id?: string | null
          name: string
        }
        Update: {
          config_json?: Json
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_default?: boolean
          memory_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_saved_views_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "calculation_memories"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body_template: string
          channel: string
          created_at: string
          id: string
          name: string
          subject_template: string | null
          variables_schema_json: Json | null
        }
        Insert: {
          body_template: string
          channel: string
          created_at?: string
          id?: string
          name: string
          subject_template?: string | null
          variables_schema_json?: Json | null
        }
        Update: {
          body_template?: string
          channel?: string
          created_at?: string
          id?: string
          name?: string
          subject_template?: string | null
          variables_schema_json?: Json | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string
          date_actual: string | null
          date_forecast: string | null
          date_planned: string | null
          id: string
          name: string
          project_id: string
          type: string
        }
        Insert: {
          created_at?: string
          date_actual?: string | null
          date_forecast?: string | null
          date_planned?: string | null
          id?: string
          name: string
          project_id: string
          type?: string
        }
        Update: {
          created_at?: string
          date_actual?: string | null
          date_forecast?: string | null
          date_planned?: string | null
          id?: string
          name?: string
          project_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          error_message: string | null
          id: string
          notification_id: string
          provider_message_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          notification_id: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          error_message?: string | null
          id?: string
          notification_id?: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string
          created_at: string
          id: string
          message_template_id: string | null
          payload_json: Json | null
          recipient_user_id: string | null
          source_id: string | null
          source_type: string
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          message_template_id?: string | null
          payload_json?: Json | null
          recipient_user_id?: string | null
          source_id?: string | null
          source_type: string
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          message_template_id?: string | null
          payload_json?: Json | null
          recipient_user_id?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_message_template_id_fkey"
            columns: ["message_template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_milestones: {
        Row: {
          amount: number | null
          contract_id: string
          created_at: string
          due_date: string | null
          id: string
          name: string
          paid_at: string | null
          percent_val: number | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount?: number | null
          contract_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          paid_at?: string | null
          percent_val?: number | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number | null
          contract_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          paid_at?: string | null
          percent_val?: number | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_milestones_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          business_unit_id: string | null
          created_at: string
          id: string
          name: string
          owner_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_unit_id?: string | null
          created_at?: string
          id?: string
          name: string
          owner_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_unit_id?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_unit_id: string | null
          created_at: string
          department_id: string | null
          email: string
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          business_unit_id?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          business_unit_id?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          id: string
          manager_user_id: string | null
          name: string
          portfolio_id: string
          sponsor_user_id: string | null
          strategic_objectives: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          manager_user_id?: string | null
          name: string
          portfolio_id: string
          sponsor_user_id?: string | null
          strategic_objectives?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          manager_user_id?: string | null
          name?: string
          portfolio_id?: string
          sponsor_user_id?: string | null
          strategic_objectives?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      project_memberships: {
        Row: {
          allocation_pct: number | null
          created_at: string
          id: string
          project_id: string
          project_role: string
          user_id: string
        }
        Insert: {
          allocation_pct?: number | null
          created_at?: string
          id?: string
          project_id: string
          project_role?: string
          user_id: string
        }
        Update: {
          allocation_pct?: number | null
          created_at?: string
          id?: string
          project_id?: string
          project_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_memberships_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          business_unit_id: string | null
          code: string
          confidentiality_level: Database["public"]["Enums"]["confidentiality"]
          created_at: string
          deleted_at: string | null
          department_id: string | null
          description: string | null
          finish_forecast: string | null
          finish_planned: string | null
          health: Database["public"]["Enums"]["health_status"]
          id: string
          name: string
          pm_user_id: string | null
          priority: string | null
          program_id: string | null
          progress_pct: number | null
          sponsor_user_id: string | null
          start_forecast: string | null
          start_planned: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          business_unit_id?: string | null
          code: string
          confidentiality_level?: Database["public"]["Enums"]["confidentiality"]
          created_at?: string
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          finish_forecast?: string | null
          finish_planned?: string | null
          health?: Database["public"]["Enums"]["health_status"]
          id?: string
          name: string
          pm_user_id?: string | null
          priority?: string | null
          program_id?: string | null
          progress_pct?: number | null
          sponsor_user_id?: string | null
          start_forecast?: string | null
          start_planned?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          business_unit_id?: string | null
          code?: string
          confidentiality_level?: Database["public"]["Enums"]["confidentiality"]
          created_at?: string
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          finish_forecast?: string | null
          finish_planned?: string | null
          health?: Database["public"]["Enums"]["health_status"]
          id?: string
          name?: string
          pm_user_id?: string | null
          priority?: string | null
          program_id?: string | null
          progress_pct?: number | null
          sponsor_user_id?: string | null
          start_forecast?: string | null
          start_planned?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          generated_by_user_id: string | null
          id: string
          output_uri: string | null
          period_end: string | null
          period_start: string | null
          portfolio_id: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["report_status"]
          summary_json: Json | null
          type: Database["public"]["Enums"]["report_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          generated_by_user_id?: string | null
          id?: string
          output_uri?: string | null
          period_end?: string | null
          period_start?: string | null
          portfolio_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          summary_json?: Json | null
          type: Database["public"]["Enums"]["report_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          generated_by_user_id?: string | null
          id?: string
          output_uri?: string | null
          period_end?: string | null
          period_start?: string | null
          portfolio_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          summary_json?: Json | null
          type?: Database["public"]["Enums"]["report_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          business_unit_id: string | null
          cost_rate: number | null
          created_at: string
          department_id: string | null
          id: string
          name: string
          type: string
          user_id: string | null
        }
        Insert: {
          business_unit_id?: string | null
          cost_rate?: number | null
          created_at?: string
          department_id?: string | null
          id?: string
          name: string
          type?: string
          user_id?: string | null
        }
        Update: {
          business_unit_id?: string | null
          cost_rate?: number | null
          created_at?: string
          department_id?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          category: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          impact: number
          owner_user_id: string | null
          probability: number
          project_id: string
          response_strategy: string | null
          score: number | null
          status: Database["public"]["Enums"]["risk_status"]
          title: string
          trigger_description: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          impact?: number
          owner_user_id?: string | null
          probability?: number
          project_id: string
          response_strategy?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["risk_status"]
          title: string
          trigger_description?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          impact?: number
          owner_user_id?: string | null
          probability?: number
          project_id?: string
          response_strategy?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["risk_status"]
          title?: string
          trigger_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_items: {
        Row: {
          activity_name: string
          completion_pct: number
          created_at: string
          deleted_at: string | null
          duration_days: number | null
          end_date: string | null
          id: string
          observations: string | null
          project_id: string | null
          start_date: string | null
          uid: string
          updated_at: string
          wbs: string | null
        }
        Insert: {
          activity_name: string
          completion_pct?: number
          created_at?: string
          deleted_at?: string | null
          duration_days?: number | null
          end_date?: string | null
          id?: string
          observations?: string | null
          project_id?: string | null
          start_date?: string | null
          uid: string
          updated_at?: string
          wbs?: string | null
        }
        Update: {
          activity_name?: string
          completion_pct?: number
          created_at?: string
          deleted_at?: string | null
          duration_days?: number | null
          end_date?: string | null
          id?: string
          observations?: string | null
          project_id?: string | null
          start_date?: string | null
          uid?: string
          updated_at?: string
          wbs?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_snapshots: {
        Row: {
          captured_at: string
          id: string
          metrics_json: Json | null
          payload_ref: string | null
          project_id: string
          source: string
          type: string
        }
        Insert: {
          captured_at?: string
          id?: string
          metrics_json?: Json | null
          payload_ref?: string | null
          project_id: string
          source?: string
          type?: string
        }
        Update: {
          captured_at?: string
          id?: string
          metrics_json?: Json | null
          payload_ref?: string | null
          project_id?: string
          source?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_snapshots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_finish: string | null
          actual_start: string | null
          created_at: string
          deleted_at: string | null
          dependency_type: string | null
          effort_actual_hours: number | null
          effort_planned_hours: number | null
          forecast_finish: string | null
          forecast_start: string | null
          id: string
          name: string
          owner_user_id: string | null
          planned_finish: string | null
          planned_start: string | null
          predecessor_task_id: string | null
          status: string
          updated_at: string
          work_package_id: string
        }
        Insert: {
          actual_finish?: string | null
          actual_start?: string | null
          created_at?: string
          deleted_at?: string | null
          dependency_type?: string | null
          effort_actual_hours?: number | null
          effort_planned_hours?: number | null
          forecast_finish?: string | null
          forecast_start?: string | null
          id?: string
          name: string
          owner_user_id?: string | null
          planned_finish?: string | null
          planned_start?: string | null
          predecessor_task_id?: string | null
          status?: string
          updated_at?: string
          work_package_id: string
        }
        Update: {
          actual_finish?: string | null
          actual_start?: string | null
          created_at?: string
          deleted_at?: string | null
          dependency_type?: string | null
          effort_actual_hours?: number | null
          effort_planned_hours?: number | null
          forecast_finish?: string | null
          forecast_start?: string | null
          id?: string
          name?: string
          owner_user_id?: string | null
          planned_finish?: string | null
          planned_start?: string | null
          predecessor_task_id?: string | null
          status?: string
          updated_at?: string
          work_package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_predecessor_task_id_fkey"
            columns: ["predecessor_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_work_package_id_fkey"
            columns: ["work_package_id"]
            isOneToOne: false
            referencedRelation: "work_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: string
          created_at: string
          format: string
          id: string
          knowledge_item_id: string | null
          name: string
          updated_at: string
          variables_schema_json: Json | null
        }
        Insert: {
          category: string
          created_at?: string
          format?: string
          id?: string
          knowledge_item_id?: string | null
          name: string
          updated_at?: string
          variables_schema_json?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          format?: string
          id?: string
          knowledge_item_id?: string | null
          name?: string
          updated_at?: string
          variables_schema_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_knowledge_item_id_fkey"
            columns: ["knowledge_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          scope_id: string | null
          scope_type: Database["public"]["Enums"]["scope_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          scope_id?: string | null
          scope_type?: Database["public"]["Enums"]["scope_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          scope_id?: string | null
          scope_type?: Database["public"]["Enums"]["scope_type"]
          user_id?: string
        }
        Relationships: []
      }
      work_packages: {
        Row: {
          acceptance_criteria: string | null
          created_at: string
          deleted_at: string | null
          deliverable: string | null
          forecast_finish: string | null
          forecast_start: string | null
          id: string
          name: string
          owner_user_id: string | null
          parent_id: string | null
          planned_finish: string | null
          planned_start: string | null
          progress_pct: number | null
          project_id: string
          updated_at: string
          wbs_code: string
        }
        Insert: {
          acceptance_criteria?: string | null
          created_at?: string
          deleted_at?: string | null
          deliverable?: string | null
          forecast_finish?: string | null
          forecast_start?: string | null
          id?: string
          name: string
          owner_user_id?: string | null
          parent_id?: string | null
          planned_finish?: string | null
          planned_start?: string | null
          progress_pct?: number | null
          project_id: string
          updated_at?: string
          wbs_code: string
        }
        Update: {
          acceptance_criteria?: string | null
          created_at?: string
          deleted_at?: string | null
          deliverable?: string | null
          forecast_finish?: string | null
          forecast_start?: string | null
          id?: string
          name?: string
          owner_user_id?: string | null
          parent_id?: string | null
          planned_finish?: string | null
          planned_start?: string | null
          progress_pct?: number | null
          project_id?: string
          updated_at?: string
          wbs_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_packages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "work_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_packages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "diretoria"
        | "gerencia"
        | "pmo"
        | "analista"
        | "financeiro"
        | "ti"
        | "leitura"
      approval_action: "approve" | "reject"
      audit_action:
        | "create"
        | "read"
        | "update"
        | "delete"
        | "export"
        | "approve"
        | "external_call"
      budget_type: "capex" | "opex"
      confidentiality: "publico" | "interno" | "restrito"
      connector_type: "erp" | "pmo" | "comms" | "bi" | "storage"
      contract_status: "draft" | "active" | "closed"
      decision_status: "draft" | "pending_approval" | "approved" | "rejected"
      health_status: "verde" | "amarelo" | "vermelho"
      issue_status: "aberto" | "em_andamento" | "escalado" | "fechado"
      knowledge_type: "file" | "link" | "query" | "powerbi" | "dataset"
      meeting_status: "agendada" | "realizada" | "cancelada"
      meeting_type: "comite" | "status" | "kickoff" | "retrospectiva"
      payment_status: "planned" | "approved" | "paid"
      project_status:
        | "ideacao"
        | "planejamento"
        | "execucao"
        | "encerrado"
        | "on_hold"
      report_status: "draft" | "pending_approval" | "published"
      report_type:
        | "weekly_status"
        | "monthly_exec"
        | "committee_deck"
        | "meeting_minutes"
        | "risk_log"
        | "action_plan"
      risk_status: "aberto" | "mitigando" | "fechado"
      scope_type: "org" | "unit" | "department" | "project"
      sync_direction: "pull" | "push" | "bidirectional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "diretoria",
        "gerencia",
        "pmo",
        "analista",
        "financeiro",
        "ti",
        "leitura",
      ],
      approval_action: ["approve", "reject"],
      audit_action: [
        "create",
        "read",
        "update",
        "delete",
        "export",
        "approve",
        "external_call",
      ],
      budget_type: ["capex", "opex"],
      confidentiality: ["publico", "interno", "restrito"],
      connector_type: ["erp", "pmo", "comms", "bi", "storage"],
      contract_status: ["draft", "active", "closed"],
      decision_status: ["draft", "pending_approval", "approved", "rejected"],
      health_status: ["verde", "amarelo", "vermelho"],
      issue_status: ["aberto", "em_andamento", "escalado", "fechado"],
      knowledge_type: ["file", "link", "query", "powerbi", "dataset"],
      meeting_status: ["agendada", "realizada", "cancelada"],
      meeting_type: ["comite", "status", "kickoff", "retrospectiva"],
      payment_status: ["planned", "approved", "paid"],
      project_status: [
        "ideacao",
        "planejamento",
        "execucao",
        "encerrado",
        "on_hold",
      ],
      report_status: ["draft", "pending_approval", "published"],
      report_type: [
        "weekly_status",
        "monthly_exec",
        "committee_deck",
        "meeting_minutes",
        "risk_log",
        "action_plan",
      ],
      risk_status: ["aberto", "mitigando", "fechado"],
      scope_type: ["org", "unit", "department", "project"],
      sync_direction: ["pull", "push", "bidirectional"],
    },
  },
} as const

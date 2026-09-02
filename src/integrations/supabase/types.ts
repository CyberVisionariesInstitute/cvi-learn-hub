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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          scenario_code: string
          scenario_package_id: string
          scenario_version: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          scenario_code: string
          scenario_package_id: string
          scenario_version: string
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          scenario_code?: string
          scenario_package_id?: string
          scenario_version?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_scenario_package_id_fkey"
            columns: ["scenario_package_id"]
            isOneToOne: false
            referencedRelation: "scenario_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          assignment_id: string | null
          created_at: string
          detail: Json
          id: string
          project_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          assignment_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          project_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          assignment_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      checkpoints: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          owner_id: string
          project_id: string
          review_state: string
          reviewer_id: string | null
          reviewer_notes: string | null
          rubric: Json
          stage: string
          student_state: string
          updated_at: string
          week: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          owner_id: string
          project_id: string
          review_state?: string
          reviewer_id?: string | null
          reviewer_notes?: string | null
          rubric?: Json
          stage: string
          student_state?: string
          updated_at?: string
          week: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          project_id?: string
          review_state?: string
          reviewer_id?: string | null
          reviewer_notes?: string | null
          rubric?: Json
          stage?: string
          student_state?: string
          updated_at?: string
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "checkpoints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_items: {
        Row: {
          body: string | null
          created_at: string
          id: string
          owner_id: string
          payload: Json
          project_id: string
          stage: string
          title: string
          week: number | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          owner_id: string
          payload?: Json
          project_id: string
          stage: string
          title: string
          week?: number | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          payload?: Json
          project_id?: string
          stage?: string
          title?: string
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hidden_events: {
        Row: {
          acknowledged_at: string | null
          activated_at: string | null
          activated_by: string | null
          assignment_id: string
          created_at: string
          event_key: string
          id: string
          instructor_notes: string | null
          student_brief: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          activated_at?: string | null
          activated_by?: string | null
          assignment_id: string
          created_at?: string
          event_key: string
          id?: string
          instructor_notes?: string | null
          student_brief: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          activated_at?: string | null
          activated_by?: string | null
          assignment_id?: string
          created_at?: string
          event_key?: string
          id?: string
          instructor_notes?: string | null
          student_brief?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "hidden_events_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_revisions: {
        Row: {
          created_at: string
          id: string
          note: string | null
          owner_id: string
          project_id: string
          revision: number
          state: Json
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          owner_id: string
          project_id: string
          revision: number
          state: Json
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          owner_id?: string
          project_id?: string
          revision?: number
          state?: Json
        }
        Relationships: [
          {
            foreignKeyName: "project_revisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assignment_id: string
          created_at: string
          id: string
          owner_id: string
          revision: number
          scenario_code: string
          scenario_version: string
          state: Json
          updated_at: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          id?: string
          owner_id: string
          revision?: number
          scenario_code: string
          scenario_version: string
          state?: Json
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          revision?: number
          scenario_code?: string
          scenario_version?: string
          state?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: true
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_packages: {
        Row: {
          answer_guidance: Json
          calibration: Json
          code: string
          created_at: string
          created_by: string | null
          difficulty_score: number | null
          id: string
          package: Json
          status: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          answer_guidance?: Json
          calibration?: Json
          code: string
          created_at?: string
          created_by?: string | null
          difficulty_score?: number | null
          id?: string
          package?: Json
          status?: string
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          answer_guidance?: Json
          calibration?: Json
          code?: string
          created_at?: string
          created_by?: string | null
          difficulty_score?: number | null
          id?: string
          package?: Json
          status?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      scenario_student_views: {
        Row: {
          brief: string
          constraints: Json
          created_at: string
          id: string
          organization: string
          requirements: Json
          scenario_code: string
          scenario_package_id: string
          scenario_version: string
          updated_at: string
          workloads: Json
        }
        Insert: {
          brief: string
          constraints?: Json
          created_at?: string
          id?: string
          organization: string
          requirements?: Json
          scenario_code: string
          scenario_package_id: string
          scenario_version: string
          updated_at?: string
          workloads?: Json
        }
        Update: {
          brief?: string
          constraints?: Json
          created_at?: string
          id?: string
          organization?: string
          requirements?: Json
          scenario_code?: string
          scenario_package_id?: string
          scenario_version?: string
          updated_at?: string
          workloads?: Json
        }
        Relationships: [
          {
            foreignKeyName: "scenario_student_views_scenario_package_id_fkey"
            columns: ["scenario_package_id"]
            isOneToOne: false
            referencedRelation: "scenario_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          defense_notes: string | null
          id: string
          owner_id: string
          project_id: string
          review_state: string
          reviewer_id: string | null
          reviewer_notes: string | null
          rubric: Json
          snapshot: Json
          submitted_at: string
        }
        Insert: {
          defense_notes?: string | null
          id?: string
          owner_id: string
          project_id: string
          review_state?: string
          reviewer_id?: string | null
          reviewer_notes?: string | null
          rubric?: Json
          snapshot: Json
          submitted_at?: string
        }
        Update: {
          defense_notes?: string | null
          id?: string
          owner_id?: string
          project_id?: string
          review_state?: string
          reviewer_id?: string | null
          reviewer_notes?: string | null
          rubric?: Json
          snapshot?: Json
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      owns_assignment: {
        Args: { _assignment_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "instructor" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["student", "instructor", "admin"],
    },
  },
} as const

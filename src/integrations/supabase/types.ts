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
      applications: {
        Row: {
          applicant_id: string
          cover_message: string | null
          created_at: string
          cv_filename: string | null
          cv_path: string | null
          id: string
          institution_id: string
          job_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_message?: string | null
          created_at?: string
          cv_filename?: string | null
          cv_path?: string | null
          id?: string
          institution_id: string
          job_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_message?: string | null
          created_at?: string
          cv_filename?: string | null
          cv_path?: string | null
          id?: string
          institution_id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          job_id: string | null
          last_message_at: string
          seeker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          job_id?: string | null
          last_message_at?: string
          seeker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          job_id?: string | null
          last_message_at?: string
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          commune: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_public: boolean
          created_at: string
          department: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          sector: string
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          commune?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_public?: boolean
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          sector: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          commune?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_public?: boolean
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          sector?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      job_alerts: {
        Row: {
          commune: string | null
          created_at: string
          department: string | null
          email_enabled: boolean
          id: string
          is_active: boolean
          sector: string | null
          user_id: string
        }
        Insert: {
          commune?: string | null
          created_at?: string
          department?: string | null
          email_enabled?: boolean
          id?: string
          is_active?: boolean
          sector?: string | null
          user_id: string
        }
        Update: {
          commune?: string | null
          created_at?: string
          department?: string | null
          email_enabled?: boolean
          id?: string
          is_active?: boolean
          sector?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_seeker_profiles: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string
          cv_filename: string | null
          cv_path: string | null
          cv_updated_at: string | null
          educations: Json
          experiences: Json
          headline: string | null
          is_searchable: boolean
          languages: string[]
          sector: string | null
          skills: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          cv_filename?: string | null
          cv_path?: string | null
          cv_updated_at?: string | null
          educations?: Json
          experiences?: Json
          headline?: string | null
          is_searchable?: boolean
          languages?: string[]
          sector?: string | null
          skills?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          cv_filename?: string | null
          cv_path?: string | null
          cv_updated_at?: string | null
          educations?: Json
          experiences?: Json
          headline?: string | null
          is_searchable?: boolean
          languages?: string[]
          sector?: string | null
          skills?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          commune: string | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          deadline: string | null
          department: string
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          id: string
          institution_id: string
          salary_range: string | null
          sector: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          commune?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          deadline?: string | null
          department: string
          description: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          institution_id: string
          salary_range?: string | null
          sector: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          commune?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          deadline?: string | null
          department?: string
          description?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          institution_id?: string
          salary_range?: string | null
          sector?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          commune: string | null
          created_at: string
          department: string | null
          full_name: string
          id: string
          phone: string | null
          preferred_language: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          commune?: string | null
          created_at?: string
          department?: string | null
          full_name?: string
          id: string
          phone?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          commune?: string | null
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          relationship: string | null
          subject_institution_id: string | null
          subject_user_id: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          relationship?: string | null
          subject_institution_id?: string | null
          subject_user_id?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          relationship?: string | null
          subject_institution_id?: string | null
          subject_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_subject_institution_id_fkey"
            columns: ["subject_institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
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
      in_conversation: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      increment_job_view: { Args: { _job_id: string }; Returns: undefined }
      owns_institution: {
        Args: { _institution_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "job_seeker" | "institution" | "admin"
      application_status:
        | "received"
        | "reviewing"
        | "interview"
        | "accepted"
        | "rejected"
      contract_type:
        | "full_time"
        | "part_time"
        | "internship"
        | "temporary"
        | "freelance"
        | "volunteer"
      experience_level: "none" | "junior" | "mid" | "senior"
      job_status: "open" | "closed"
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
      app_role: ["job_seeker", "institution", "admin"],
      application_status: [
        "received",
        "reviewing",
        "interview",
        "accepted",
        "rejected",
      ],
      contract_type: [
        "full_time",
        "part_time",
        "internship",
        "temporary",
        "freelance",
        "volunteer",
      ],
      experience_level: ["none", "junior", "mid", "senior"],
      job_status: ["open", "closed"],
    },
  },
} as const

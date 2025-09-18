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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_questions: {
        Row: {
          created_at: string
          id: string
          question: string
          rationale: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question: string
          rationale?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question?: string
          rationale?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_searches: {
        Row: {
          created_at: string
          data: Json | null
          id: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: number
        }
        Relationships: []
      }
      company_question_answers: {
        Row: {
          answer: string | null
          company_search_id: string
          created_at: string
          id: string
          question_id: string
          updated_at: string
        }
        Insert: {
          answer?: string | null
          company_search_id: string
          created_at?: string
          id?: string
          question_id: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          company_search_id?: string
          created_at?: string
          id?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_question_answers_company_search_id_fkey"
            columns: ["company_search_id"]
            isOneToOne: false
            referencedRelation: "company_searches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "agent_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      company_searches: {
        Row: {
          advice: string | null
          company_name: string
          contact: string | null
          contact_info: Json | null
          created_at: string
          email: string | null
          id: string
          introduction: string | null
          phone: string | null
          result: Json | null
          role: string | null
          score: number | null
          sent_email_at: string | null
          subject: string | null
          updated_at: string | null
          user_id: string
          www: string | null
        }
        Insert: {
          advice?: string | null
          company_name: string
          contact?: string | null
          contact_info?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          introduction?: string | null
          phone?: string | null
          result?: Json | null
          role?: string | null
          score?: number | null
          sent_email_at?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id: string
          www?: string | null
        }
        Update: {
          advice?: string | null
          company_name?: string
          contact?: string | null
          contact_info?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          introduction?: string | null
          phone?: string | null
          result?: Json | null
          role?: string | null
          score?: number | null
          sent_email_at?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string
          www?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_data: Json | null
          credits: number
          first_name: string | null
          id: string
          is_admin: boolean
          last_name: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_data?: Json | null
          credits?: number
          first_name?: string | null
          id: string
          is_admin?: boolean
          last_name?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_data?: Json | null
          credits?: number
          first_name?: string | null
          id?: string
          is_admin?: boolean
          last_name?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      prompt_evaluations: {
        Row: {
          company_name: string | null
          company_size: string | null
          created_at: string
          evaluation_results: Json | null
          id: string
          industry: string | null
          master_prompt: string
          status: string | null
          target_audience: string | null
          updated_at: string
          user_id: string | null
          user_prompt: string
          webhook_url: string
        }
        Insert: {
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          evaluation_results?: Json | null
          id?: string
          industry?: string | null
          master_prompt: string
          status?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string | null
          user_prompt: string
          webhook_url: string
        }
        Update: {
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          evaluation_results?: Json | null
          id?: string
          industry?: string | null
          master_prompt?: string
          status?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string | null
          user_prompt?: string
          webhook_url?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          created_at: string
          id: string
          master_prompt: string
          name: string
          updated_at: string
          user_prompt: string
        }
        Insert: {
          created_at?: string
          id?: string
          master_prompt: string
          name: string
          updated_at?: string
          user_prompt: string
        }
        Update: {
          created_at?: string
          id?: string
          master_prompt?: string
          name?: string
          updated_at?: string
          user_prompt?: string
        }
        Relationships: []
      }
      user_email_settings: {
        Row: {
          app_password: string | null
          created_at: string | null
          email_address: string
          email_provider: string
          hubspot_bcc_address: string | null
          id: string
          is_active: boolean | null
          oauth2_client_id: string | null
          oauth2_client_secret: string | null
          oauth2_refresh_token: string | null
          smtp_host: string
          smtp_port: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_password?: string | null
          created_at?: string | null
          email_address: string
          email_provider: string
          hubspot_bcc_address?: string | null
          id?: string
          is_active?: boolean | null
          oauth2_client_id?: string | null
          oauth2_client_secret?: string | null
          oauth2_refresh_token?: string | null
          smtp_host: string
          smtp_port: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_password?: string | null
          created_at?: string | null
          email_address?: string
          email_provider?: string
          hubspot_bcc_address?: string | null
          id?: string
          is_active?: boolean | null
          oauth2_client_id?: string | null
          oauth2_client_secret?: string | null
          oauth2_refresh_token?: string | null
          smtp_host?: string
          smtp_port?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          session_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          session_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          session_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_settings: {
        Row: {
          created_at: string | null
          default_signup_credits: number | null
          id: string
          mybusiness_url: string | null
          questions_url: string | null
          updated_at: string | null
          url: string
          value_proposition_url: string | null
        }
        Insert: {
          created_at?: string | null
          default_signup_credits?: number | null
          id?: string
          mybusiness_url?: string | null
          questions_url?: string | null
          updated_at?: string | null
          url?: string
          value_proposition_url?: string | null
        }
        Update: {
          created_at?: string | null
          default_signup_credits?: number | null
          id?: string
          mybusiness_url?: string | null
          questions_url?: string | null
          updated_at?: string | null
          url?: string
          value_proposition_url?: string | null
        }
        Relationships: []
      }
      webhook_testing: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_user_email_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          app_password: string | null
          created_at: string | null
          email_address: string
          email_provider: string
          hubspot_bcc_address: string | null
          id: string
          is_active: boolean | null
          oauth2_client_id: string | null
          oauth2_client_secret: string | null
          oauth2_refresh_token: string | null
          smtp_host: string
          smtp_port: number
          updated_at: string | null
          user_id: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_knowledge: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

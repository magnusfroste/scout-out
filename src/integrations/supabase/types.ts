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
      app_integrations: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          integration_name: string
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          integration_name: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          integration_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
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
      keep_alive: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      lab_company_profiles: {
        Row: {
          business_registration: string | null
          communication_style: string
          company_name: string
          company_size: string
          created_at: string
          credentials: string[]
          delivery_model: string[]
          geographic_markets: string[]
          id: string
          ideal_client_size: string[]
          industry: string
          is_complete: boolean | null
          known_clients: boolean | null
          known_clients_list: string | null
          linkedin_url: string | null
          main_offerings: string[]
          mission: string
          offering_type: string[]
          organizational_personality: string[]
          pricing_positioning: string
          project_scope: string
          success_story: string | null
          target_industries: string[]
          typical_results: string[]
          unique_differentiators: string[]
          updated_at: string
          user_id: string
          values: string[]
          vision: string | null
          website_url: string
          years_active: string | null
        }
        Insert: {
          business_registration?: string | null
          communication_style: string
          company_name: string
          company_size: string
          created_at?: string
          credentials?: string[]
          delivery_model?: string[]
          geographic_markets?: string[]
          id?: string
          ideal_client_size?: string[]
          industry: string
          is_complete?: boolean | null
          known_clients?: boolean | null
          known_clients_list?: string | null
          linkedin_url?: string | null
          main_offerings?: string[]
          mission: string
          offering_type?: string[]
          organizational_personality?: string[]
          pricing_positioning: string
          project_scope: string
          success_story?: string | null
          target_industries?: string[]
          typical_results?: string[]
          unique_differentiators?: string[]
          updated_at?: string
          user_id: string
          values?: string[]
          vision?: string | null
          website_url: string
          years_active?: string | null
        }
        Update: {
          business_registration?: string | null
          communication_style?: string
          company_name?: string
          company_size?: string
          created_at?: string
          credentials?: string[]
          delivery_model?: string[]
          geographic_markets?: string[]
          id?: string
          ideal_client_size?: string[]
          industry?: string
          is_complete?: boolean | null
          known_clients?: boolean | null
          known_clients_list?: string | null
          linkedin_url?: string | null
          main_offerings?: string[]
          mission?: string
          offering_type?: string[]
          organizational_personality?: string[]
          pricing_positioning?: string
          project_scope?: string
          success_story?: string | null
          target_industries?: string[]
          typical_results?: string[]
          unique_differentiators?: string[]
          updated_at?: string
          user_id?: string
          values?: string[]
          vision?: string | null
          website_url?: string
          years_active?: string | null
        }
        Relationships: []
      }
      lab_credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          research_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          research_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          research_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_credit_transactions_research_id_fkey"
            columns: ["research_id"]
            isOneToOne: false
            referencedRelation: "lab_prospect_research"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_prospect_research: {
        Row: {
          company_profile_id: string
          completed_at: string | null
          contact_strategy: Json | null
          created_at: string
          decision_makers: Json | null
          error_message: string | null
          exported_at: string | null
          fit_score: number | null
          id: string
          is_starred: boolean | null
          notes: string | null
          prospect_company_name: string
          prospect_linkedin_url: string | null
          prospect_website_url: string
          research_results: Json | null
          research_type: string
          started_at: string | null
          status: string
          tags: string[] | null
          updated_at: string
          user_id: string
          user_profile_id: string
          value_proposition: Json | null
          webhook_url: string
        }
        Insert: {
          company_profile_id: string
          completed_at?: string | null
          contact_strategy?: Json | null
          created_at?: string
          decision_makers?: Json | null
          error_message?: string | null
          exported_at?: string | null
          fit_score?: number | null
          id?: string
          is_starred?: boolean | null
          notes?: string | null
          prospect_company_name: string
          prospect_linkedin_url?: string | null
          prospect_website_url: string
          research_results?: Json | null
          research_type?: string
          started_at?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
          user_profile_id: string
          value_proposition?: Json | null
          webhook_url: string
        }
        Update: {
          company_profile_id?: string
          completed_at?: string | null
          contact_strategy?: Json | null
          created_at?: string
          decision_makers?: Json | null
          error_message?: string | null
          exported_at?: string | null
          fit_score?: number | null
          id?: string
          is_starred?: boolean | null
          notes?: string | null
          prospect_company_name?: string
          prospect_linkedin_url?: string | null
          prospect_website_url?: string
          research_results?: Json | null
          research_type?: string
          started_at?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          user_profile_id?: string
          value_proposition?: Json | null
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_prospect_research_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "lab_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_prospect_research_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "lab_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_research_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          master_prompt: string
          name: string
          research_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          master_prompt: string
          name: string
          research_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          master_prompt?: string
          name?: string
          research_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lab_user_profiles: {
        Row: {
          birthplace: string | null
          communication_style: string
          created_at: string
          credibility_preference: string[]
          credits: number
          current_location: string | null
          date_of_birth: string | null
          expertise_positioning: string
          followup_timing: string
          full_name: string
          id: string
          introduction_style: string
          is_complete: boolean | null
          linkedin_profile: string | null
          meeting_duration: string
          meeting_format: string[]
          nonresponse_handling: string
          objection_handling: string[]
          outreach_experience: string
          pain_points_focus: string[]
          preferred_contact_channel: string[]
          prospects_per_week: string
          role_in_organization: string
          success_metrics: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          birthplace?: string | null
          communication_style: string
          created_at?: string
          credibility_preference?: string[]
          credits?: number
          current_location?: string | null
          date_of_birth?: string | null
          expertise_positioning: string
          followup_timing: string
          full_name: string
          id?: string
          introduction_style: string
          is_complete?: boolean | null
          linkedin_profile?: string | null
          meeting_duration: string
          meeting_format?: string[]
          nonresponse_handling: string
          objection_handling?: string[]
          outreach_experience: string
          pain_points_focus?: string[]
          preferred_contact_channel?: string[]
          prospects_per_week: string
          role_in_organization: string
          success_metrics?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          birthplace?: string | null
          communication_style?: string
          created_at?: string
          credibility_preference?: string[]
          credits?: number
          current_location?: string | null
          date_of_birth?: string | null
          expertise_positioning?: string
          followup_timing?: string
          full_name?: string
          id?: string
          introduction_style?: string
          is_complete?: boolean | null
          linkedin_profile?: string | null
          meeting_duration?: string
          meeting_format?: string[]
          nonresponse_handling?: string
          objection_handling?: string[]
          outreach_experience?: string
          pain_points_focus?: string[]
          preferred_contact_channel?: string[]
          prospects_per_week?: string
          role_in_organization?: string
          success_metrics?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_connections: {
        Row: {
          auth_config_id: string | null
          connected_at: string | null
          connection_type: string
          created_at: string
          email_address: string
          id: string
          mcp_server_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_config_id?: string | null
          connected_at?: string | null
          connection_type?: string
          created_at?: string
          email_address: string
          id?: string
          mcp_server_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_config_id?: string | null
          connected_at?: string | null
          connection_type?: string
          created_at?: string
          email_address?: string
          id?: string
          mcp_server_id?: string | null
          status?: string
          updated_at?: string
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
      user_email_settings: {
        Row: {
          app_password: string | null
          connection_type: string | null
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
          connection_type?: string | null
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
          connection_type?: string | null
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
      get_user_email_settings: {
        Args: never
        Returns: {
          app_password: string | null
          connection_type: string | null
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
        SetofOptions: {
          from: "*"
          to: "user_email_settings"
          isOneToOne: false
          isSetofReturn: true
        }
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

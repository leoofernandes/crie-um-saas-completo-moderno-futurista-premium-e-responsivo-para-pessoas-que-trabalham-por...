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
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          amount_cents?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenances: {
        Row: {
          cost_cents: number
          created_at: string
          date: string
          description: string | null
          id: string
          mileage: number | null
          next_date: string | null
          next_mileage: number | null
          notes: string | null
          type: string
          updated_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          cost_cents?: number
          created_at?: string
          date: string
          description?: string | null
          id?: string
          mileage?: number | null
          next_date?: string | null
          next_mileage?: number | null
          notes?: string | null
          type: string
          updated_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          cost_cents?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          mileage?: number | null
          next_date?: string | null
          next_mileage?: number | null
          notes?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenances_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          customer_id: string | null
          due_date: string
          id: string
          method: string | null
          notes: string | null
          paid_at: string | null
          rental_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          customer_id?: string | null
          due_date: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          rental_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          customer_id?: string | null
          due_date?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          rental_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          code: string
          created_at: string
          features: Json
          id: string
          is_active: boolean
          is_custom: boolean
          name: string
          price_monthly_cents: number | null
          price_yearly_cents: number | null
          sort_order: number
          tagline: string | null
          updated_at: string
          vehicle_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_custom?: boolean
          name: string
          price_monthly_cents?: number | null
          price_yearly_cents?: number | null
          sort_order?: number
          tagline?: string | null
          updated_at?: string
          vehicle_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_custom?: boolean
          name?: string
          price_monthly_cents?: number | null
          price_yearly_cents?: number | null
          sort_order?: number
          tagline?: string | null
          updated_at?: string
          vehicle_limit?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          fleet_size_range: string | null
          full_name: string | null
          id: string
          onboarding_done: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          fleet_size_range?: string | null
          full_name?: string | null
          id: string
          onboarding_done?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          fleet_size_range?: string | null
          full_name?: string | null
          id?: string
          onboarding_done?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      public_sites: {
        Row: {
          banner_position: number
          banner_url: string | null
          created_at: string
          description: string | null
          display_name: string
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          instagram: string | null
          is_published: boolean
          logo_url: string | null
          slug: string
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          banner_position?: number
          banner_url?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          instagram?: string | null
          is_published?: boolean
          logo_url?: string | null
          slug: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          banner_position?: number
          banner_url?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          instagram?: string | null
          is_published?: boolean
          logo_url?: string | null
          slug?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      rentals: {
        Row: {
          amount_cents: number
          created_at: string
          custom_interval_days: number | null
          customer_id: string
          end_date: string | null
          id: string
          notes: string | null
          payment_day: number | null
          periodicity: Database["public"]["Enums"]["rental_periodicity"]
          start_date: string
          status: Database["public"]["Enums"]["rental_status"]
          updated_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          custom_interval_days?: number | null
          customer_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          payment_day?: number | null
          periodicity?: Database["public"]["Enums"]["rental_periodicity"]
          start_date: string
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          custom_interval_days?: number | null
          customer_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          payment_day?: number | null
          periodicity?: Database["public"]["Enums"]["rental_periodicity"]
          start_date?: string
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_leads: {
        Row: {
          created_at: string
          id: string
          message: string | null
          name: string
          site_id: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_id: string
          vehicle_id: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          name: string
          site_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          name?: string
          site_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_leads_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "public_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_period: string
          created_at: string
          id: string
          plan_id: string | null
          provider: string | null
          provider_ref: string | null
          renews_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          vehicle_limit: number | null
        }
        Insert: {
          billing_period?: string
          created_at?: string
          id?: string
          plan_id?: string | null
          provider?: string | null
          provider_ref?: string | null
          renews_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
          vehicle_limit?: number | null
        }
        Update: {
          billing_period?: string
          created_at?: string
          id?: string
          plan_id?: string | null
          provider?: string | null
          provider_ref?: string | null
          renews_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
          vehicle_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
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
      vehicle_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          position: number
          storage_path: string | null
          url: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          storage_path?: string | null
          url: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          storage_path?: string | null
          url?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_photos_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          category: string | null
          color: string | null
          created_at: string
          description: string | null
          features: string[]
          id: string
          mileage: number | null
          model: string
          plate: string | null
          rental_periodicity: Database["public"]["Enums"]["rental_periodicity"]
          rental_price_cents: number
          show_in_catalog: boolean
          status: Database["public"]["Enums"]["vehicle_status"]
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          brand: string
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          features?: string[]
          id?: string
          mileage?: number | null
          model: string
          plate?: string | null
          rental_periodicity?: Database["public"]["Enums"]["rental_periodicity"]
          rental_price_cents?: number
          show_in_catalog?: boolean
          status?: Database["public"]["Enums"]["vehicle_status"]
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          brand?: string
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          features?: string[]
          id?: string
          mileage?: number | null
          model?: string
          plate?: string | null
          rental_periodicity?: Database["public"]["Enums"]["rental_periodicity"]
          rental_price_cents?: number
          show_in_catalog?: boolean
          status?: Database["public"]["Enums"]["vehicle_status"]
          updated_at?: string
          user_id?: string
          year?: number | null
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
    }
    Enums: {
      app_role: "user" | "admin"
      lead_status: "novo" | "em_atendimento" | "alugado" | "sem_interesse"
      payment_status: "pago" | "pendente" | "atrasado" | "cancelado"
      rental_periodicity: "semanal" | "quinzenal" | "mensal" | "personalizada"
      rental_status: "ativo" | "encerrado" | "cancelado"
      subscription_status:
        | "trial"
        | "ativo"
        | "pagamento_pendente"
        | "cancelado"
        | "expirado"
      vehicle_status:
        | "disponivel"
        | "alugado"
        | "reservado"
        | "manutencao"
        | "inativo"
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
      app_role: ["user", "admin"],
      lead_status: ["novo", "em_atendimento", "alugado", "sem_interesse"],
      payment_status: ["pago", "pendente", "atrasado", "cancelado"],
      rental_periodicity: ["semanal", "quinzenal", "mensal", "personalizada"],
      rental_status: ["ativo", "encerrado", "cancelado"],
      subscription_status: [
        "trial",
        "ativo",
        "pagamento_pendente",
        "cancelado",
        "expirado",
      ],
      vehicle_status: [
        "disponivel",
        "alugado",
        "reservado",
        "manutencao",
        "inativo",
      ],
    },
  },
} as const

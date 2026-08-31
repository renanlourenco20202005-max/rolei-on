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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      places: {
        Row: {
          address: string
          category: string
          city: string
          created_at: string
          description: string
          id: string
          image_url: string
          instagram: string
          is_published: boolean
          is_sponsored: boolean
          latitude: number
          longitude: number
          name: string
          neighborhood: string
          partner_id: string | null
          photos: Json
          price: string
          promo_text: string | null
          rating: number
          reviews_count: number
          tags: string[]
          updated_at: string
          vibes: string[]
          whatsapp: string
          hours: string
        }
        Insert: {
          address?: string
          category: string
          city?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          instagram?: string
          is_published?: boolean
          is_sponsored?: boolean
          latitude: number
          longitude: number
          name: string
          neighborhood?: string
          partner_id?: string | null
          photos?: Json
          price?: string
          promo_text?: string | null
          rating?: number
          reviews_count?: number
          tags?: string[]
          updated_at?: string
          vibes?: string[]
          whatsapp?: string
          hours?: string
        }
        Update: {
          address?: string
          category?: string
          city?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          instagram?: string
          is_published?: boolean
          is_sponsored?: boolean
          latitude?: number
          longitude?: number
          name?: string
          neighborhood?: string
          partner_id?: string | null
          photos?: Json
          price?: string
          promo_text?: string | null
          rating?: number
          reviews_count?: number
          tags?: string[]
          updated_at?: string
          vibes?: string[]
          whatsapp?: string
          hours?: string
        }
        Relationships: [
          {
            foreignKeyName: "places_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          created_at: string
          description: string
          ends_at: string | null
          id: string
          image_url: string
          is_free: boolean
          is_published: boolean
          is_sponsored: boolean
          latitude: number | null
          longitude: number | null
          partner_id: string | null
          place_id: string | null
          price_text: string | null
          starts_at: string
          title: string
          updated_at: string
          venue_name: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          ends_at?: string | null
          id?: string
          image_url?: string
          is_free?: boolean
          is_published?: boolean
          is_sponsored?: boolean
          latitude?: number | null
          longitude?: number | null
          partner_id?: string | null
          place_id?: string | null
          price_text?: string | null
          starts_at: string
          title: string
          updated_at?: string
          venue_name?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          ends_at?: string | null
          id?: string
          image_url?: string
          is_free?: boolean
          is_published?: boolean
          is_sponsored?: boolean
          latitude?: number | null
          longitude?: number | null
          partner_id?: string | null
          place_id?: string | null
          price_text?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          kind: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          kind: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_profiles: {
        Row: {
          address: string
          category: string
          cover: string
          created_at: string
          description: string
          events: Json
          hours: string
          id: string
          instagram: string
          name: string
          photos: Json
          promos: Json
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          address?: string
          category?: string
          cover?: string
          created_at?: string
          description?: string
          events?: Json
          hours?: string
          id?: string
          instagram?: string
          name?: string
          photos?: Json
          promos?: Json
          updated_at?: string
          user_id: string
          whatsapp?: string
        }
        Update: {
          address?: string
          category?: string
          cover?: string
          created_at?: string
          description?: string
          events?: Json
          hours?: string
          id?: string
          instagram?: string
          name?: string
          photos?: Json
          promos?: Json
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          onboarded: boolean
          prefs: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id?: string
          onboarded?: boolean
          prefs?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          onboarded?: boolean
          prefs?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      visit_history: {
        Row: {
          id: string
          item_id: string
          kind: string
          user_id: string
          visited_at: string
        }
        Insert: {
          id?: string
          item_id: string
          kind: string
          user_id: string
          visited_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          kind?: string
          user_id?: string
          visited_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

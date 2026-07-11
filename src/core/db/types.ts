export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          website: string | null;
          instagram: string | null;
          facebook: string | null;
          twitter: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          default_hourly_rate: number | null;
          minimum_booking_hours: number;
          service_area: string | null;
          service_radius: number | null;
          zones_of_operation: string | null;
          regulations: string | null;
          is_marketplace_listed: boolean;
          stripe_account_id: string | null;
          stripe_account_status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_subscription_status: string;
          stripe_subscription_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          website?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          twitter?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          default_hourly_rate?: number | null;
          minimum_booking_hours?: number;
          service_area?: string | null;
          service_radius?: number | null;
          zones_of_operation?: string | null;
          regulations?: string | null;
          is_marketplace_listed?: boolean;
          stripe_account_id?: string | null;
          stripe_account_status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string;
          stripe_subscription_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          description?: string | null;
          website?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          twitter?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          default_hourly_rate?: number | null;
          minimum_booking_hours?: number;
          service_area?: string | null;
          service_radius?: number | null;
          zones_of_operation?: string | null;
          regulations?: string | null;
          is_marketplace_listed?: boolean;
          stripe_account_id?: string | null;
          stripe_account_status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string;
          stripe_subscription_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          org_id: string;
          clerk_id: string;
          email: string;
          name: string | null;
          role: "owner" | "admin" | "member";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          clerk_id: string;
          email: string;
          name?: string | null;
          role?: "owner" | "admin" | "member";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          clerk_id?: string;
          email?: string;
          name?: string | null;
          role?: "owner" | "admin" | "member";
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          role: string | null;
          source: string | null;
          notes: string | null;
          tags: string[];
          stage_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          role?: string | null;
          source?: string | null;
          notes?: string | null;
          tags?: string[];
          stage_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          role?: string | null;
          source?: string | null;
          notes?: string | null;
          tags?: string[];
          stage_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pipeline_stages: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          order: number;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          order?: number;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          order?: number;
          color?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          org_id: string;
          contact_id: string;
          name: string;
          type: string;
          date: string;
          start_time: string | null;
          end_time: string | null;
          venue_name: string | null;
          venue_address: string | null;
          guest_count: number;
          status:
            | "new_inquiry"
            | "quoted"
            | "tentative"
            | "booked"
            | "deposit_paid"
            | "completed"
            | "cancelled";
          total_price: number;
          deposit_amount: number | null;
          balance_due: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          contact_id: string;
          name: string;
          type: string;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          guest_count?: number;
          status?:
            | "new_inquiry"
            | "quoted"
            | "tentative"
            | "booked"
            | "deposit_paid"
            | "completed"
            | "cancelled";
          total_price?: number;
          deposit_amount?: number | null;
          balance_due?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          contact_id?: string;
          name?: string;
          type?: string;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          guest_count?: number;
          status?:
            | "new_inquiry"
            | "quoted"
            | "tentative"
            | "booked"
            | "deposit_paid"
            | "completed"
            | "cancelled";
          total_price?: number;
          deposit_amount?: number | null;
          balance_due?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      packages: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          base_price: number;
          pricing_type: "per_guest" | "flat" | "hourly";
          min_guests: number | null;
          max_guests: number | null;
          includes_bartenders: number;
          includes_glassware: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          base_price: number;
          pricing_type?: "per_guest" | "flat" | "hourly";
          min_guests?: number | null;
          max_guests?: number | null;
          includes_bartenders?: number;
          includes_glassware?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          base_price?: number;
          pricing_type?: "per_guest" | "flat" | "hourly";
          min_guests?: number | null;
          max_guests?: number | null;
          includes_bartenders?: number;
          includes_glassware?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          org_id: string;
          contact_id: string;
          event_id: string | null;
          package_id: string | null;
          guest_count: number;
          add_ons: Json;
          subtotal: number;
          tax: number;
          total: number;
          status: "draft" | "sent" | "accepted" | "rejected" | "expired";
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          contact_id: string;
          event_id?: string | null;
          package_id?: string | null;
          guest_count: number;
          add_ons?: Json;
          subtotal: number;
          tax?: number;
          total: number;
          status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          contact_id?: string;
          event_id?: string | null;
          package_id?: string | null;
          guest_count?: number;
          add_ons?: Json;
          subtotal?: number;
          tax?: number;
          total?: number;
          status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          org_id: string;
          event_id: string;
          quote_id: string | null;
          amount: number;
          deposit_amount: number | null;
          balance_due: number;
          status: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
          due_date: string | null;
          paid_at: string | null;
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
          stripe_payment_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          event_id: string;
          quote_id?: string | null;
          amount: number;
          deposit_amount?: number | null;
          balance_due?: number;
          status?: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
          due_date?: string | null;
          paid_at?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          event_id?: string;
          quote_id?: string | null;
          amount?: number;
          deposit_amount?: number | null;
          balance_due?: number;
          status?: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
          due_date?: string | null;
          paid_at?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          org_id: string;
          contact_id: string;
          type: "email" | "sms";
          subject: string;
          body: string;
          status: string;
          recipient: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          contact_id: string;
          type: "email" | "sms";
          subject?: string;
          body: string;
          status?: string;
          recipient: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          contact_id?: string;
          type?: "email" | "sms";
          subject?: string;
          body?: string;
          status?: string;
          recipient?: string;
          created_at?: string;
        };
      };
      staff_assignments: {
        Row: {
          id: string;
          org_id: string;
          event_id: string;
          user_id: string;
          role: string;
          rate: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          event_id: string;
          user_id: string;
          role?: string;
          rate?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          event_id?: string;
          user_id?: string;
          role?: string;
          rate?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

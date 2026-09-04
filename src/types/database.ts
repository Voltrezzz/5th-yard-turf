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
      profiles: {
        Row: {
          id: string;
          phone: string;
          full_name: string | null;
          role: "customer" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          full_name?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          phone?: string;
          full_name?: string | null;
          role?: "customer" | "admin";
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          booking_date: string;
          start_chunk: number;
          end_chunk: number;
          duration_mins: number;
          total_price: number;
          advance_paid: number;
          balance_due: number;
          status:
            | "pending"
            | "confirmed"
            | "expired"
            | "payment_failed"
            | "cancelled"
            | "refunded";
          customer_name: string;
          customer_phone: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
          cancelled_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          booking_date: string;
          start_chunk: number;
          end_chunk: number;
          duration_mins: number;
          total_price: number;
          advance_paid: number;
          balance_due: number;
          status?: Database["public"]["Tables"]["bookings"]["Row"]["status"];
          customer_name: string;
          customer_phone: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          expires_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      slot_locks: {
        Row: {
          booking_date: string;
          chunk_index: number;
          booking_id: string;
          locked_at: string;
        };
        Insert: {
          booking_date: string;
          chunk_index: number;
          booking_id: string;
          locked_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "slot_locks_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_booking_with_lock: {
        Args: {
          p_user_id: string;
          p_booking_date: string;
          p_start_chunk: number;
          p_end_chunk: number;
          p_customer_name: string;
          p_customer_phone: string;
        };
        Returns: string;
      };
      confirm_payment: {
        Args: { p_booking_id: string; p_payment_id: string };
        Returns: Database["public"]["Tables"]["bookings"]["Row"][];
      };
      cancel_booking: {
        Args: { p_booking_id: string; p_user_id: string; p_is_admin: boolean };
        Returns: boolean;
      };
      expire_stale_bookings: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      current_user_is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

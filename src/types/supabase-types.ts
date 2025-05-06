
import { Database } from '../integrations/supabase/types';

// These types help us work with the Supabase database types
export type DbRoom = Database['public']['Tables']['rooms']['Row'];
export type DbBooking = Database['public']['Tables']['bookings']['Row'];
export type DbProfile = Database['public']['Tables']['profiles']['Row'];

// Create insert types for when we're adding new records
export type DbInsertRoom = Database['public']['Tables']['rooms']['Insert'];
export type DbInsertBooking = Database['public']['Tables']['bookings']['Insert'];
export type DbInsertProfile = Database['public']['Tables']['profiles']['Insert'];

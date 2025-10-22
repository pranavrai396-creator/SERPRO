import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'consumer' | 'provider';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number;
  hourly_rate: number;
  pincode: string;
  address: string | null;
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  user_profiles?: UserProfile;
}

export interface ProviderService {
  id: string;
  provider_id: string;
  category_id: string;
  created_at: string;
  service_categories?: ServiceCategory;
}

export interface Review {
  id: string;
  provider_id: string;
  consumer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_profiles?: UserProfile;
}

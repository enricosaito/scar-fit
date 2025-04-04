// app/models/user.ts
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  plan: 'free' | 'premium';
  macros?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export async function createUserProfile(userId: string, email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        email,
        plan: 'free',
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data && data.length > 0 ? data[0] : null;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();

  if (error) {
    throw error;
  }

  return data && data.length > 0 ? data[0] : null;
}

export async function updateUserMacros(userId: string, macros: UserProfile['macros']) {
  return updateUserProfile(userId, { macros });
}
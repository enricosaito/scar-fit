// app/models/user.ts
import { supabase } from "../lib/supabase";

export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: "lose" | "maintain" | "gain";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "extreme";
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  plan: "free" | "premium";
  macros?: MacroData;
}

export async function createUserProfile(userId: string, email: string) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        id: userId,
        email,
        plan: "free",
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
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select();

  if (error) {
    throw error;
  }

  return data && data.length > 0 ? data[0] : null;
}

export async function saveUserMacros(userId: string, macroData: Omit<MacroData, "updatedAt">) {
  try {
    const macros: MacroData = {
      ...macroData,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("profiles").update({ macros }).eq("id", userId).select();

    if (error) {
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error saving user macros:", error);
    throw error;
  }
}

export async function updateUserMacros(userId: string, macros: MacroData) {
  return updateUserProfile(userId, { macros });
}

export async function resetUserMacros(userId: string) {
  try {
    const { data, error } = await supabase.from("profiles").update({ macros: null }).eq("id", userId).select();

    if (error) {
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error resetting user macros:", error);
    throw error;
  }
}

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserMacros,
  saveUserMacros,
  resetUserMacros,
};

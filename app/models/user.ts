// app/models/user.ts
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadProfileImage } from "../utils/imageUpload";

const ONBOARDING_COMPLETED_KEY = "onboardingCompleted";

export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: "lose" | "maintain" | "gain";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "extreme";
  updatedAt: string;
  isCustom?: boolean;
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

/**
 * Updates the user's profile avatar
 */
export async function updateUserAvatar(userId: string, imageUri: string): Promise<UserProfile | null> {
  try {
    // Upload the image to storage
    const uploadResult = await uploadProfileImage(userId, imageUri);
    
    if (!uploadResult) {
      throw new Error("Failed to upload avatar image");
    }

    // Update the user profile with the new avatar URL
    return await updateUserProfile(userId, { avatar_url: uploadResult.url });
  } catch (error) {
    console.error("Error updating user avatar:", error);
    throw error;
  }
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

    // Mark onboarding as completed in AsyncStorage
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    } catch (storageError) {
      console.error("Error saving onboarding status:", storageError);
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

    // Reset onboarding completed flag in AsyncStorage
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "false");
    } catch (storageError) {
      console.error("Error resetting onboarding status:", storageError);
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
  updateUserAvatar,
};

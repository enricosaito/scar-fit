import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { Alert } from "react-native";

const { supabaseUrl, supabaseAnonKey, appVersion } = Constants.expoConfig?.extra ?? {};

// Validation
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase credentials!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-app-version": appVersion,
    },
  },
});

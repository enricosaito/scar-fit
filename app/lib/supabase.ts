// Modify app/lib/supabase.ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Alert } from "react-native";
import Constants from "expo-constants";
import customStorageAdapter from "./secureStorage";

// Get Supabase URL and anon key from Expo constants
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || "";
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || "";

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase credentials. Please check your app.config.js and environment variables.");
}

// Initialize the Supabase client with additional configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: customStorageAdapter,
  },
  db: {
    schema: "public",
  },
  global: {
    // Set global headers if needed
    headers: {
      "x-app-version": "1.0.0",
    },
  },
});

// Error handler helper
export const handleSupabaseError = (error: Error) => {
  console.error("Supabase error:", error);
  Alert.alert("Erro", error.message || "Ocorreu um erro. Por favor, tente novamente.");
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

export default supabase;

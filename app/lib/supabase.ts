// app/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import customStorageAdapter from "./secureStorage";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || "";
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase credentials. Please check your app.config.js and environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: customStorageAdapter,
  },
  global: {
    headers: {
      "x-app-version": "1.0.0",
    },
  },
});

// Add the supabase URL to the client itself for easy access
(supabase as any).supabaseUrl = supabaseUrl;

// Export as default to avoid router warnings
export default supabase;
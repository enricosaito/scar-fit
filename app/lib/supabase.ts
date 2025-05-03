// app/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import customStorageAdapter from "./secureStorage";

const supabaseUrl = "https://ssrklevifozwowhpumvu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcmtsZXZpZm96d293aHB1bXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MDc4NzcsImV4cCI6MjA1OTM4Mzg3N30.0rwKDJUkJMDggk27C0Cx08ldg_4FNWgBnQjssb9uhzc";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase credentials.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
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
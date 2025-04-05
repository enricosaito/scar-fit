// app/lib/supabase.ts - Complete file

import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Alert, Platform } from "react-native";
import ENV from "./env";
import fetchWithTimeout from "./fetchWithTimeout";

// Get Supabase URL and anon key from environment variables
const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

// Check for missing keys
if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "YOUR_SUPABASE_URL" ||
  supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY"
) {
  console.error("Missing Supabase credentials. Check your environment variables.");
}

// Log initialization
console.log(`Initializing Supabase on ${Platform.OS} ${Platform.Version}`);
console.log(`URL: ${supabaseUrl.substring(0, 20)}...`);

// Initialize the Supabase client with custom fetch
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "x-app-version": ENV.APP_VERSION || "1.0.0",
    },
  },
  // Use our custom fetch implementation
  fetch: fetchWithTimeout,
});

// Error handler helper with more information
export const handleSupabaseError = (error: Error) => {
  console.error("Supabase error:", error.message);

  // User-friendly message based on error type
  let userMessage = "Ocorreu um erro. Por favor, tente novamente.";

  if (error.message.includes("network") || error.message.includes("timeout") || error.message.includes("failed")) {
    userMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
  } else if (error.message.includes("credentials")) {
    userMessage = "Email ou senha incorretos. Verifique suas credenciais.";
  }

  Alert.alert("Erro", userMessage);
};

export default supabase;

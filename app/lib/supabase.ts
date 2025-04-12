// app/lib/supabase.ts

import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Alert } from "react-native";

// Get Supabase URL and anon key from Expo constants
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || "";
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || "";

// Custom storage implementation for Supabase using Expo's SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Initialize the Supabase client with additional configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
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

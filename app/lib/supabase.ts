// app/lib/supabase.ts
import 'react-native-url-polyfill/auto'
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = "https://ssrklevifozwowhpumvu.supabase.co";
const supabaseAnonKey = "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Add the supabase URL to the client itself for easy access
(supabase as any).supabaseUrl = supabaseUrl;

// Export as default to avoid router warnings
export default supabase;
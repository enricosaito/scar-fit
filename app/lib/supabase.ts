// app/lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import ENV from './env';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'YOUR_SUPABASE_URL' || 
    supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    'Missing Supabase credentials. Please check your environment variables.'
  );
}

// Initialize the Supabase client with additional configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    // Set global headers if needed
    headers: {
      'x-app-version': ENV.APP_VERSION,
    },
  },
});

// Error handler helper
export const handleSupabaseError = (error: Error) => {
  console.error('Supabase error:', error);
  Alert.alert('Erro', error.message || 'Ocorreu um erro. Por favor, tente novamente.');
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

export default supabase;
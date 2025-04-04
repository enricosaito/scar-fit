// app/lib/env.ts
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';

/**
 * Environment variables configuration.
 */
export const ENV = {
  // Supabase Configuration
  SUPABASE_URL: EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
  
  // App Configuration
  APP_NAME: 'Scar Fit',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_PREMIUM_FEATURES: false,
};

export default ENV;
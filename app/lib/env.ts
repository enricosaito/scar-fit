// app/lib/env.ts
/**
 * Environment variables configuration.
 */
export const ENV = {
  // Supabase Configuration
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // App Configuration
  APP_NAME: 'Scar Fit',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_PREMIUM_FEATURES: false,
};

export default ENV;
// app/lib/env.ts - Update with simulator detection
import { Platform } from "react-native";

// Detect if we're in a simulator
const isSimulator = (): boolean => {
  if (Platform.OS === "ios") {
    return (
      !Platform.isPad &&
      !Platform.isTV &&
      (Platform.constants.uiMode === undefined || Platform.constants.uiMode === null)
    );
  }
  return false;
};

/**
 * Environment variables configuration
 */
export const ENV = {
  // Supabase Configuration
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY",

  // App Configuration
  APP_NAME: "Scar Fit",
  APP_VERSION: "1.0.0",

  // Environment Information
  IS_DEV: __DEV__,
  IS_SIMULATOR: isSimulator(),
  PLATFORM: Platform.OS,
  PLATFORM_VERSION: Platform.Version,

  // Development bypass for simulator
  DEV_BYPASS_AUTH: __DEV__ && isSimulator(),

  // Feature Flags
  ENABLE_PREMIUM_FEATURES: false,
};

// Log environment at startup
if (__DEV__) {
  console.log("Environment:", {
    url: ENV.SUPABASE_URL.substring(0, 15) + "...",
    dev: ENV.IS_DEV,
    simulator: ENV.IS_SIMULATOR,
    platform: ENV.PLATFORM,
    version: ENV.PLATFORM_VERSION,
    bypassAuth: ENV.DEV_BYPASS_AUTH,
  });
}

export default ENV;

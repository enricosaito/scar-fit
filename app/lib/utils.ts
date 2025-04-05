// app/lib/utils.ts
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { Platform } from "react-native";
import Constants from "expo-constants";

export function isRunningInSimulator(): boolean {
  // Check if we're on iOS and in development
  if (Platform.OS === "ios" && __DEV__) {
    // iOS simulators usually have specific model identifiers
    // or we can check if we're in development mode
    return Constants.executionEnvironment !== "standalone";
  }
  return false;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add a default export
export default { cn };

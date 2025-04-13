// app/lib/secureStorage.ts
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Simple in-memory fallback for server-side rendering
const memoryStorage = new Map<string, string>();

// Check if we're in a browser environment where window exists
const isBrowser = typeof window !== "undefined";

// Custom storage adapter for Supabase
const customStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        if (isBrowser) {
          // Use AsyncStorage in browser
          return await AsyncStorage.getItem(key);
        } else {
          // Use memory storage during SSR
          console.log("Using memory storage (server-side)");
          return memoryStorage.get(key) || null;
        }
      } else {
        // Use SecureStore on mobile
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting item "${key}" from storage:`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        if (isBrowser) {
          // Use AsyncStorage in browser
          await AsyncStorage.setItem(key, value);
        } else {
          // Use memory storage during SSR
          console.log("Using memory storage (server-side)");
          memoryStorage.set(key, value);
        }
      } else {
        // Use SecureStore on mobile
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting item "${key}" in storage:`, error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        if (isBrowser) {
          // Use AsyncStorage in browser
          await AsyncStorage.removeItem(key);
        } else {
          // Use memory storage during SSR
          console.log("Using memory storage (server-side)");
          memoryStorage.delete(key);
        }
      } else {
        // Use SecureStore on mobile
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing item "${key}" from storage:`, error);
    }
  },
};

export default customStorageAdapter;

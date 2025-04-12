// Create a new file app/lib/secureStorage.ts
import * as SecureStore from "expo-secure-store";

// Check if we're running in a browser environment
const isWeb = typeof document !== "undefined";

// Create a fallback storage for web environments
const webStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Error getting item from localStorage:", error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Error setting item in localStorage:", error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing item from localStorage:", error);
    }
  },
};

// Custom storage adapter for Supabase
const customStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) {
      return webStorage.getItem(key);
    }

    try {
      // Try with the correct method call
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("Error getting item from secure store:", error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      webStorage.setItem(key, value);
      return;
    }

    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("Error setting item in secure store:", error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isWeb) {
      webStorage.removeItem(key);
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("Error removing item from secure store:", error);
    }
  },
};

export default customStorageAdapter;

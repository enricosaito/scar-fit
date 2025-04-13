// app/lib/secureStorage.ts
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Custom storage adapter for Supabase
const customStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        // Use AsyncStorage on web
        return await AsyncStorage.getItem(key);
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
        // Use AsyncStorage on web
        await AsyncStorage.setItem(key, value);
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
        // Use AsyncStorage on web
        await AsyncStorage.removeItem(key);
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

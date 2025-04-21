// app/lib/voiceProcessingService.ts
import { supabase } from "./supabase";
import * as FileSystem from "expo-file-system";

export interface TranscriptionResult {
  text: string;
  success: boolean;
  error?: string;
}

export interface ExtractedFoodItem {
  name: string;
  quantity?: number;
  unit?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface MatchedFoodItem {
  foodId: number;
  food: {
    id: number;
    description: string;
    category: string;
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  quantity: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}

// Transcribe audio using the Supabase Edge Function
export const transcribeAudio = async (audioUri: string): Promise<TranscriptionResult> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error("Audio file does not exist");
    }

    // Create form data with the audio file
    const formData = new FormData();
    
    // Read file as blob and append to form data
    formData.append("file", {
      uri: audioUri,
      name: "recording.m4a",
      type: "audio/m4a",
    } as any);

    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    // Get Supabase URL from the client
    const supabaseUrl = (supabase as any).supabaseUrl;

    // Call Supabase function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/transcribe-audio`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to transcribe audio');
    }

    const result = await response.json();
    // Extract text from the result (adjust this based on how your Edge Function returns data)
    return {
      text: result.text || "",
      success: true,
    };
  } catch (error) {
    console.error("Transcription error:", error);
    return {
      text: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown transcription error",
    };
  }
};

// Extract food information from transcribed text using Supabase Edge Function
export const extractFoodItems = async (text: string): Promise<ExtractedFoodItem[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    // Get Supabase URL from the client
    const supabaseUrl = (supabase as any).supabaseUrl;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/extract-food-info`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract food information');
    }

    const result = await response.json();
    return result.foodItems || [];
  } catch (error) {
    console.error("Food extraction error:", error);
    // Return empty array instead of using fallback to avoid errors
    return [];
  }
};

// The matchWithDatabaseFoods function remains the same as it's not using the API key
export { matchWithDatabaseFoods } from "./nlpService";
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
    return {
      text: result.text,
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

// Extract food information from transcribed text
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
    // Return empty array as fallback
    return [];
  }
};

// Match extracted food items with database
export const matchWithDatabaseFoods = async (extractedItems: ExtractedFoodItem[]): Promise<MatchedFoodItem[]> => {
  try {
    const matchedItems: MatchedFoodItem[] = [];
    console.log("Starting food matching with database for items:", extractedItems);

    for (const item of extractedItems) {
      console.log(`Trying to match food: "${item.name}"`);
      let matchFound = false;

      // Strategy 1: Exact match with description
      if (!matchFound) {
        const { data: exactMatches, error } = await supabase
          .from("foods")
          .select("*")
          .ilike("description", item.name)
          .limit(1);

        if (error) {
          console.error("Error in exact match search:", error);
        } else if (exactMatches && exactMatches.length > 0) {
          console.log("Found exact match:", exactMatches[0].description);
          matchedItems.push({
            foodId: exactMatches[0].id,
            food: exactMatches[0],
            quantity: item.quantity || 100,
            mealType: item.mealType || "snack",
          });
          matchFound = true;
        }
      }

      // Strategy 2: Full-text search with websearch
      if (!matchFound) {
        const { data: textSearchMatches, error } = await supabase
          .from("foods")
          .select("*")
          .textSearch("description", item.name, {
            type: "websearch",
            config: "portuguese",
          })
          .limit(1);

        if (error) {
          console.error("Error in websearch text search:", error);
        } else if (textSearchMatches && textSearchMatches.length > 0) {
          console.log("Found websearch match:", textSearchMatches[0].description);
          matchedItems.push({
            foodId: textSearchMatches[0].id,
            food: textSearchMatches[0],
            quantity: item.quantity || 100,
            mealType: item.mealType || "snack",
          });
          matchFound = true;
        }
      }

      // Strategy 3: Partial match with ILIKE
      if (!matchFound) {
        const { data: partialMatches, error } = await supabase
          .from("foods")
          .select("*")
          .ilike("description", `%${item.name}%`)
          .limit(1);

        if (error) {
          console.error("Error in partial match search:", error);
        } else if (partialMatches && partialMatches.length > 0) {
          console.log("Found partial match:", partialMatches[0].description);
          matchedItems.push({
            foodId: partialMatches[0].id,
            food: partialMatches[0],
            quantity: item.quantity || 100,
            mealType: item.mealType || "snack",
          });
          matchFound = true;
        }
      }

      // Strategy 4: Try with individual words for common foods
      if (!matchFound) {
        const words = item.name.split(/\s+/).filter((word) => word.length > 3);
        for (const word of words) {
          const { data: wordMatches, error } = await supabase
            .from("foods")
            .select("*")
            .ilike("description", `%${word}%`)
            .limit(1);

          if (error) {
            console.error(`Error in word match search for "${word}":`, error);
          } else if (wordMatches && wordMatches.length > 0) {
            console.log(`Found word match for "${word}":`, wordMatches[0].description);
            matchedItems.push({
              foodId: wordMatches[0].id,
              food: wordMatches[0],
              quantity: item.quantity || 100,
              mealType: item.mealType || "snack",
            });
            matchFound = true;
            break;
          }
        }
      }

      // If no match found after all strategies, create a mock food in development
      if (!matchFound && __DEV__) {
        console.log("No match found in database, using mock food");

        const mockFood = {
          id: 999999,
          description: `${item.name} (Genérico)`,
          category: "Genérico",
          kcal: 100,
          protein_g: 5,
          carbs_g: 10,
          fat_g: 5,
        };

        matchedItems.push({
          foodId: mockFood.id,
          food: mockFood,
          quantity: item.quantity || 100,
          mealType: item.mealType || "snack",
        });
      }
    }

    console.log("Final matched items with database:", matchedItems);
    return matchedItems;
  } catch (error) {
    console.error("Error matching foods with database:", error);
    return [];
  }
};

// Export all functions as a default object to avoid issues with Expo Router
export default {
  transcribeAudio,
  extractFoodItems,
  matchWithDatabaseFoods,
};
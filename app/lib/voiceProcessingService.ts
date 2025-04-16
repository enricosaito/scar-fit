// app/lib/voiceProcessingService.ts (updated)
import { transcribeAudio } from "./transcriptionService";
import { extractFoodItems, matchWithDatabaseFoods } from "./nlpService";

export interface TranscriptionResult {
  text: string;
  success: boolean;
  error?: string;
}

export interface FoodItem {
  name: string;
  quantity?: number;
  unit?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
}

// Transcribe audio using the OpenAI Whisper API
export { transcribeAudio };

// Extract food information from transcribed text
export { extractFoodItems as extractFoodInformation };

// Match extracted food items with database foods
export { matchWithDatabaseFoods };

export default {
  transcribeAudio,
  extractFoodInformation: extractFoodItems,
  matchWithDatabaseFoods,
};

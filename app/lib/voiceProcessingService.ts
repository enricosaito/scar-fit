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

// Export the functions from the other services
export { transcribeAudio };
export { extractFoodItems };
export { matchWithDatabaseFoods };

export default {
  transcribeAudio,
  extractFoodInformation: extractFoodItems,
  matchWithDatabaseFoods,
};
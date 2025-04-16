// app/lib/voiceProcessingService.ts
import * as FileSystem from "expo-file-system";
import {
  mockTranscribeAudio,
  mockExtractFoodInformation,
  mockMatchWithDatabaseFoods,
  mockGetFoodById,
} from "./mockVoiceService";

interface TranscriptionResult {
  text: string;
  success: boolean;
  error?: string;
}

export const transcribeAudio = async (audioUri: string): Promise<TranscriptionResult> => {
  try {
    // Verify the file exists before attempting to process it
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      return {
        text: "",
        success: false,
        error: "Arquivo de áudio não encontrado",
      };
    }

    // For development, use mock implementation - but with proper error handling
    return mockTranscribeAudio(audioUri);
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    return {
      text: "",
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao processar áudio",
    };
  }
};

// Mock function to simulate food and quantity extraction
// This would eventually be replaced by a more sophisticated NLP model
export const extractFoodInformation = (text: string): FoodItem[] => {
  // Simple regex patterns to extract basic information
  // In a production app, you'd use a more sophisticated NLP approach

  const result: FoodItem[] = [];

  // Common meal type indicators in Portuguese
  const breakfastIndicators = ["café da manhã", "café", "desjejum"];
  const lunchIndicators = ["almoço", "almocei"];
  const dinnerIndicators = ["jantar", "jantei"];
  const snackIndicators = ["lanche", "merenda", "snack"];

  // Determine meal type from text
  let mealType: "breakfast" | "lunch" | "dinner" | "snack" | undefined;

  if (breakfastIndicators.some((term) => text.toLowerCase().includes(term))) {
    mealType = "breakfast";
  } else if (lunchIndicators.some((term) => text.toLowerCase().includes(term))) {
    mealType = "lunch";
  } else if (dinnerIndicators.some((term) => text.toLowerCase().includes(term))) {
    mealType = "dinner";
  } else if (snackIndicators.some((term) => text.toLowerCase().includes(term))) {
    mealType = "snack";
  }

  // Common units in Portuguese
  const units = [
    "g",
    "gramas",
    "kg",
    "kilos",
    "quilos",
    "ml",
    "litro",
    "litros",
    "fatia",
    "fatias",
    "colher",
    "colheres",
    "xícara",
    "xícaras",
    "copo",
    "copos",
    "prato",
    "pratos",
    "porção",
    "porções",
  ];

  // Very simple regex for quantity + unit + food
  // This is a basic implementation that would need refinement
  const quantityFoodPattern =
    /(\d+)\s*(gramas|g|kg|quilos|ml|litros?|fatias?|colheres?|xícaras?|copos?|pratos?|porções?)?(?:\s+de)?(?:\s+do?a?)?(?:\s+(.+?)(?:\s+de\s+|\s+no\s+|\s+para\s+|\s+com\s+|\s+e\s+|\s*$))/gi;

  let match;
  while ((match = quantityFoodPattern.exec(text)) !== null) {
    const quantity = parseInt(match[1], 10);
    const unit = match[2]?.toLowerCase() || "g";
    let food = match[3]?.trim().toLowerCase();

    if (food) {
      result.push({
        name: food,
        quantity: quantity,
        unit: unit,
        mealType,
      });
    }
  }

  // If no structured matches were found, try a simpler approach
  if (result.length === 0) {
    const foodTerms = ["comi", "comeu", "comí", "tomei", "bebi", "ingeri"];
    const nextWordRegex = new RegExp(`(${foodTerms.join("|")})\\s+(\\w+(?:\\s+\\w+){0,5})`, "i");
    const simpleMatch = nextWordRegex.exec(text);

    if (simpleMatch && simpleMatch[2]) {
      result.push({
        name: simpleMatch[2].trim(),
        mealType,
      });
    }
  }

  return result;
};

// Mock function to match extracted food items with database foods
// In a real app, this would query your Supabase foods table
export const matchWithDatabaseFoods = async (
  extractedItems: FoodItem[]
): Promise<Array<{ foodId: number; quantity: number; mealType: string }>> => {
  // This would be replaced with a real search in your foods database
  // For now, we'll return mock data

  return extractedItems.map((item) => ({
    foodId: 1, // Mock ID
    quantity: item.quantity || 100, // Default to 100g if no quantity specified
    mealType: item.mealType || "snack", // Default to snack if no meal type specified
  }));
};

export default {
  transcribeAudio,
  extractFoodInformation,
  matchWithDatabaseFoods,
};

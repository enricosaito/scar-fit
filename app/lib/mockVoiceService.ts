// app/lib/mockVoiceService.ts
// This is a mock implementation for testing voice features before integrating with a real service
import * as FileSystem from "expo-file-system";
import * as Random from "expo-random";

// Generate a deterministic but "random-looking" response based on the audio file
export const mockTranscribeAudio = async (
  audioUri: string
): Promise<{ text: string; success: boolean; error?: string }> => {
  try {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Instead of trying to analyze the actual audio, we'll use a simple random approach
    // Get the file info to use as a seed
    const fileInfo = await FileSystem.getInfoAsync(audioUri);

    // Get a pseudo-random number based on file size and modified time
    const seed = fileInfo.size + (fileInfo.modificationTime || 0);
    const randomValue = seed % 4; // Get a value between 0-3

    // Success case with breakfast example
    if (randomValue === 0) {
      return {
        text: "Hoje no café da manhã eu comi duas fatias de pão integral com uma colher de manteiga e tomei um copo de suco de laranja.",
        success: true,
      };
    }

    // Success case with lunch example
    else if (randomValue === 1) {
      return {
        text: "No almoço comi 150 gramas de arroz, 100 gramas de feijão e 200 gramas de frango grelhado com uma salada.",
        success: true,
      };
    }

    // Success case with dinner example
    else if (randomValue === 2) {
      return {
        text: "Jantei uma porção de macarrão com molho de tomate e 100 gramas de carne moída.",
        success: true,
      };
    }

    // Error case (but we'll make it rare for testing UI flow)
    else if (randomValue === 3) {
      if (Math.random() > 0.8) {
        // Only trigger errors 20% of the time for value 3
        return {
          text: "",
          success: false,
          error: "Não foi possível transcrever o áudio. Tente novamente.",
        };
      } else {
        return {
          text: "Comi um lanche com queijo e presunto e bebi um copo de suco de uva.",
          success: true,
        };
      }
    }

    // Default fallback
    return {
      text: "Comi uma maçã como lanche da tarde.",
      success: true,
    };
  } catch (error) {
    console.error("Error in mock transcribe:", error);
    return {
      text: "",
      success: false,
      error: "Erro ao processar o arquivo de áudio.",
    };
  }
};

// Mock function to detect food items from transcribed text
export const mockExtractFoodInformation = (text: string) => {
  // Simple parsing based on meal keywords
  const lowerText = text.toLowerCase();

  const items = [];

  // Determine meal type
  let mealType: "breakfast" | "lunch" | "dinner" | "snack" = "snack";

  if (lowerText.includes("café da manhã") || lowerText.includes("café") || lowerText.includes("manhã")) {
    mealType = "breakfast";
  } else if (lowerText.includes("almoço") || lowerText.includes("almocei")) {
    mealType = "lunch";
  } else if (lowerText.includes("jantar") || lowerText.includes("jantei")) {
    mealType = "dinner";
  }

  // Common breakfast items
  if (mealType === "breakfast") {
    if (lowerText.includes("pão")) {
      const quantity = extractQuantity(lowerText, "pão") || 50;
      items.push({
        name: "pão integral",
        quantity: quantity,
        mealType,
      });
    }

    if (lowerText.includes("manteiga")) {
      const quantity = extractQuantity(lowerText, "manteiga") || 10;
      items.push({
        name: "manteiga",
        quantity: quantity,
        mealType,
      });
    }

    if (lowerText.includes("suco")) {
      const quantity = extractQuantity(lowerText, "suco") || 200;
      items.push({
        name: "suco de laranja",
        quantity: quantity,
        mealType,
      });
    }
  }

  // Common lunch/dinner items
  if (mealType === "lunch" || mealType === "dinner") {
    if (lowerText.includes("arroz")) {
      const quantity = extractQuantity(lowerText, "arroz") || 100;
      items.push({
        name: "arroz",
        quantity: quantity,
        mealType,
      });
    }

    if (lowerText.includes("feijão")) {
      const quantity = extractQuantity(lowerText, "feijão") || 80;
      items.push({
        name: "feijão",
        quantity: quantity,
        mealType,
      });
    }

    if (lowerText.includes("frango")) {
      const quantity = extractQuantity(lowerText, "frango") || 150;
      items.push({
        name: "frango grelhado",
        quantity: quantity,
        mealType,
      });
    }

    if (lowerText.includes("carne")) {
      const quantity = extractQuantity(lowerText, "carne") || 100;
      items.push({
        name: "carne",
        quantity: quantity,
        mealType,
      });
    }

    if (lowerText.includes("salada")) {
      const quantity = extractQuantity(lowerText, "salada") || 50;
      items.push({
        name: "salada",
        quantity: quantity,
        mealType,
      });
    }

    if (lowerText.includes("macarrão")) {
      const quantity = extractQuantity(lowerText, "macarrão") || 100;
      items.push({
        name: "macarrão",
        quantity: quantity,
        mealType,
      });
    }
  }

  return items;
};

// Helper function to extract quantity from text
function extractQuantity(text: string, itemName: string): number | null {
  // Try to find pattern like "100 gramas de [itemName]" or variations
  const patterns = [
    new RegExp(`(\\d+)\\s*gramas\\s*(?:de)?\\s*${itemName}`, "i"),
    new RegExp(`(\\d+)\\s*g\\s*(?:de)?\\s*${itemName}`, "i"),
    new RegExp(`${itemName}\\s*(?:de)?\\s*(\\d+)\\s*gramas`, "i"),
    new RegExp(`${itemName}\\s*(?:de)?\\s*(\\d+)\\s*g`, "i"),
    new RegExp(`(\\d+)\\s*${itemName}`, "i"),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}

// Mock function to match with database foods
export const mockMatchWithDatabaseFoods = async (extractedItems: any[]) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Map each item to a mock database item
  return extractedItems.map((item) => {
    // Define mock food IDs based on the food name
    let foodId = 1; // Default

    if (item.name.includes("pão")) foodId = 2;
    if (item.name.includes("manteiga")) foodId = 3;
    if (item.name.includes("suco")) foodId = 4;
    if (item.name.includes("arroz")) foodId = 5;
    if (item.name.includes("feijão")) foodId = 6;
    if (item.name.includes("frango")) foodId = 7;
    if (item.name.includes("carne")) foodId = 8;
    if (item.name.includes("salada")) foodId = 9;
    if (item.name.includes("macarrão")) foodId = 10;

    return {
      foodId,
      quantity: item.quantity,
      mealType: item.mealType,
    };
  });
};

// Mock database foods
export const mockFoods = {
  2: {
    id: 2,
    description: "Pão Integral",
    category: "Pães",
    kcal: 265,
    protein_g: 8,
    carbs_g: 49,
    fat_g: 3.2,
  },
  3: {
    id: 3,
    description: "Manteiga",
    category: "Laticínios",
    kcal: 717,
    protein_g: 0.9,
    carbs_g: 0.1,
    fat_g: 81,
  },
  4: {
    id: 4,
    description: "Suco de Laranja",
    category: "Bebidas",
    kcal: 45,
    protein_g: 0.7,
    carbs_g: 10.4,
    fat_g: 0.2,
  },
  5: {
    id: 5,
    description: "Arroz Branco Cozido",
    category: "Cereais",
    kcal: 130,
    protein_g: 2.7,
    carbs_g: 28.2,
    fat_g: 0.3,
  },
  6: {
    id: 6,
    description: "Feijão Carioca Cozido",
    category: "Leguminosas",
    kcal: 77,
    protein_g: 5.1,
    carbs_g: 13.6,
    fat_g: 0.5,
  },
  7: {
    id: 7,
    description: "Peito de Frango Grelhado",
    category: "Carnes",
    kcal: 165,
    protein_g: 31,
    carbs_g: 0,
    fat_g: 3.6,
  },
  8: {
    id: 8,
    description: "Carne Moída",
    category: "Carnes",
    kcal: 250,
    protein_g: 26,
    carbs_g: 0,
    fat_g: 16,
  },
  9: {
    id: 9,
    description: "Salada Mista",
    category: "Vegetais",
    kcal: 20,
    protein_g: 1,
    carbs_g: 4,
    fat_g: 0,
  },
  10: {
    id: 10,
    description: "Macarrão Cozido",
    category: "Cereais",
    kcal: 158,
    protein_g: 5.8,
    carbs_g: 30.9,
    fat_g: 0.9,
  },
};

// Mock food lookup
export const mockGetFoodById = async (id: number) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockFoods[id] || null;
};

export default {
  mockTranscribeAudio,
  mockExtractFoodInformation,
  mockMatchWithDatabaseFoods,
  mockGetFoodById,
};

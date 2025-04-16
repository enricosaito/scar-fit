// app/lib/nlpService.ts (updated)
import Constants from "expo-constants";
import { supabase } from "./supabase";

// Get the OpenAI API key from environment variables
const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export interface ExtractedFoodItem {
  name: string;
  quantity?: number;
  unit?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
}

export async function extractFoodItems(text: string): Promise<ExtractedFoodItem[]> {
  try {
    // First attempt: try to extract directly if not using API
    if (!OPENAI_API_KEY) {
      console.log("No API key available, using fallback extraction");
      return fallbackExtractFoodItems(text);
    }

    console.log("Extracting food items with OpenAI, text:", text);

    const prompt = `
      Analise o seguinte texto em português e extraia todas as informações sobre alimentos consumidos.
      Para cada alimento, determine:
      1. Nome do alimento
      2. Quantidade (em gramas, se mencionado)
      3. Unidade de medida (se mencionada)
      4. Tipo de refeição (café da manhã, almoço, jantar, ou lanche)

      Exemplos de palavras-chave para tipo de refeição:
      - Café da manhã: café da manhã, desjejum, manhã
      - Almoço: almoço, meio-dia
      - Jantar: jantar, noite
      - Lanche: lanche, snack, merenda

      Texto: "${text}"

      Responda apenas em formato JSON, como este exemplo:
      [
        {
          "name": "arroz",
          "quantity": 100,
          "unit": "g",
          "mealType": "almoço"
        },
        {
          "name": "pão integral",
          "quantity": 2,
          "unit": "fatias",
          "mealType": "café da manhã"
        }
      ]
      
      Se não encontrar nenhuma informação sobre alimentos, retorne um array vazio: []
    `;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    console.log("OpenAI response:", data);

    if (!response.ok) {
      console.error("OpenAI API error:", data.error);
      // Fallback to basic extraction if API fails
      return fallbackExtractFoodItems(text);
    }

    // Parse the response
    try {
      const content = data.choices[0].message.content;
      console.log("OpenAI content:", content);
      const parsedContent = JSON.parse(content);

      if (Array.isArray(parsedContent)) {
        if (parsedContent.length === 0) {
          // No foods found, try fallback
          console.log("No foods found in OpenAI extraction, trying fallback");
          return fallbackExtractFoodItems(text);
        }
        return parsedContent;
      } else if (parsedContent.items && Array.isArray(parsedContent.items)) {
        return parsedContent.items;
      } else {
        // Handle case where OpenAI returns differently structured JSON
        console.log("Unexpected JSON structure, using fallback");
        return fallbackExtractFoodItems(text);
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      // Fallback to basic extraction if parsing fails
      return fallbackExtractFoodItems(text);
    }
  } catch (error) {
    console.error("NLP extraction error:", error);
    // Fallback to basic extraction for all errors
    return fallbackExtractFoodItems(text);
  }
}

// Fallback food extraction function using regex patterns
function fallbackExtractFoodItems(text: string): ExtractedFoodItem[] {
  console.log("Using fallback extraction for:", text);
  const items: ExtractedFoodItem[] = [];
  const lowerText = text.toLowerCase();

  // Determine meal type
  let mealType: "breakfast" | "lunch" | "dinner" | "snack" = "snack";
  if (lowerText.includes("café da manhã") || lowerText.includes("café") || lowerText.includes("manhã")) {
    mealType = "breakfast";
  } else if (lowerText.includes("almoço") || lowerText.includes("almocei")) {
    mealType = "lunch";
  } else if (lowerText.includes("jantar") || lowerText.includes("jantei")) {
    mealType = "dinner";
  }

  // Extract food items using regex
  // Pattern: number + unit + de + food or food + number + unit
  const foodPatterns = [
    /(\d+)\s*(?:gramas?|g)\s*(?:de)?\s*([a-zÀ-ú\s]+?)(?:\s+(?:com|e|no|na|para)\s+|$)/gi,
    /([a-zÀ-ú\s]+?)\s+(\d+)\s*(?:gramas?|g)(?:\s+(?:com|e|no|na|para)\s+|$)/gi,
    /(?:comi|ingeri|consumi)\s+([a-zÀ-ú\s]+?)(?:\s+(?:com|e|no|na|para)\s+|$)/gi,
  ];

  for (const pattern of foodPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (pattern.source.includes("comi|ingeri|consumi")) {
        // Pattern without quantity
        const foodName = match[1].trim();
        if (foodName && foodName.length > 2) {
          items.push({
            name: foodName,
            quantity: 100, // Default quantity
            mealType,
          });
        }
      } else if (pattern.source.startsWith("(\\d+)")) {
        // Pattern with quantity first
        const quantity = parseInt(match[1], 10);
        const foodName = match[2].trim();
        if (foodName && foodName.length > 2) {
          items.push({
            name: foodName,
            quantity,
            mealType,
          });
        }
      } else {
        // Pattern with food first
        const foodName = match[1].trim();
        const quantity = parseInt(match[2], 10);
        if (foodName && foodName.length > 2) {
          items.push({
            name: foodName,
            quantity,
            mealType,
          });
        }
      }
    }
  }

  // If no matches with patterns, extract any possible food items
  if (items.length === 0) {
    // Check for common food items
    const commonFoods = [
      "omelete",
      "queijo",
      "pão",
      "arroz",
      "feijão",
      "carne",
      "frango",
      "salada",
      "ovo",
      "macarrão",
      "batata",
      "leite",
      "iogurte",
      "fruta",
      "maçã",
      "banana",
      "laranja",
    ];

    for (const food of commonFoods) {
      if (lowerText.includes(food)) {
        // Extract an approximate quantity if possible
        const quantityMatch = lowerText.match(/(\d+)\s*(?:gramas?|g)/i);
        const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 100;

        items.push({
          name: food,
          quantity,
          mealType,
        });
      }
    }
  }

  console.log("Fallback extraction results:", items);
  return items;
}

export async function matchWithDatabaseFoods(extractedItems: ExtractedFoodItem[]): Promise<any[]> {
  try {
    const matchedItems = [];

    for (const item of extractedItems) {
      // Search for matching foods in the database using full-text search
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .textSearch("description", item.name, {
          type: "websearch",
          config: "portuguese",
        })
        .limit(1);

      if (error) {
        console.error("Error searching for food:", error);
        continue;
      }

      if (data && data.length > 0) {
        // Found a match
        matchedItems.push({
          foodId: data[0].id,
          food: data[0],
          quantity: item.quantity || 100, // Default to 100g if no quantity
          mealType: item.mealType || "snack", // Default to snack if no meal type
        });
      }
    }

    console.log("Matched items with database:", matchedItems);
    return matchedItems;
  } catch (error) {
    console.error("Error matching foods with database:", error);
    return [];
  }
}

export default {
  extractFoodItems,
  matchWithDatabaseFoods,
};

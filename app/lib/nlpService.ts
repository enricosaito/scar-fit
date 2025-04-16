// app/lib/nlpService.ts
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
    // Check if we have the API key
    if (!OPENAI_API_KEY) {
      throw new Error("API key not configured");
    }

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

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to extract food items");
    }

    // Parse the response
    try {
      const content = data.choices[0].message.content;
      const parsedContent = JSON.parse(content);

      if (Array.isArray(parsedContent)) {
        return parsedContent;
      } else if (parsedContent.items && Array.isArray(parsedContent.items)) {
        return parsedContent.items;
      } else {
        // Handle case where OpenAI returns differently structured JSON
        return [];
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return [];
    }
  } catch (error) {
    console.error("NLP extraction error:", error);
    return [];
  }
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

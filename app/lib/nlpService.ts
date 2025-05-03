// app/lib/nlpService.ts (updated)
import { supabase } from "./supabase";

export interface ExtractedFoodItem {
  name: string;
  quantity?: number;
  unit?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  originalQuantity?: number;
  originalUnit?: string;
}

export async function extractFoodItems(text: string): Promise<ExtractedFoodItem[]> {
  try {
    console.log("Extracting food items using extract-food-info function, text:", text);

    // Get session token for authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("No session available");
    }

    // Call the Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke("extract-food-info", {
        body: { text },
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      console.log("Extraction result:", data);

      // Map meal types from Portuguese to the app's internal format
      const mapMealType = (type: string): "breakfast" | "lunch" | "dinner" | "snack" => {
        switch (type) {
          case "café da manhã":
            return "breakfast";
          case "almoço":
            return "lunch";
          case "jantar":
            return "dinner";
          default:
            return "snack";
        }
      };

      // Process the extracted items to match the app's expected format
      const formattedItems = data.foodItems.map((item: any) => ({
        name: item.name,
        quantity: item.quantity || 100,
        unit: item.unit || "g",
        originalQuantity: item.originalQuantity,
        originalUnit: item.originalUnit,
        mealType: mapMealType(item.mealType),
      }));

      return formattedItems;
    } catch (invokeError) {
      console.error("Function invoke error:", invokeError);
      // Fall back to local extraction
      return fallbackExtractFoodItems(text);
    }
  } catch (error) {
    console.error("NLP extraction error:", error);
    // Use the fallback extraction method
    return fallbackExtractFoodItems(text);
  }
}

// Keep the existing fallback method
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

  // Extract food items using regex (keep your existing implementation)
  const foodPatterns = [
    /(\d+)\s*(?:gramas?|g)\s*(?:de)?\s*([a-zÀ-ú\s]+?)(?:\s+(?:com|e|no|na|para)\s+|$)/gi,
    /([a-zÀ-ú\s]+?)\s+(\d+)\s*(?:gramas?|g)(?:\s+(?:com|e|no|na|para)\s+|$)/gi,
    /(?:comi|ingeri|consumi)\s+([a-zÀ-ú\s]+?)(?:\s+(?:com|e|no|na|para)\s+|$)/gi,
  ];

  // Keep the rest of your fallback implementation as is...
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

// Keep the existing matchWithDatabaseFoods function
// app/lib/nlpService.ts
export async function matchWithDatabaseFoods(extractedItems: ExtractedFoodItem[]): Promise<any[]> {
  try {
    const matchedItems = [];
    console.log("Starting food matching with database for items:", extractedItems);

    // Check if extractedItems is defined and not empty
    if (!extractedItems || extractedItems.length === 0) {
      console.log("No items to match with database");
      return [];
    }

    for (const item of extractedItems) {
      console.log(`Trying to match food: "${item.name}"`);
      let matchFound = false;
      let matchedFood = null;

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
          matchedFood = exactMatches[0];
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
          matchedFood = textSearchMatches[0];
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
          matchedFood = partialMatches[0];
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
            matchedFood = wordMatches[0];
            matchFound = true;
            break;
          }
        }
      }

      // If no match found after all strategies, try with a mock food (if in development)
      if (!matchFound && __DEV__) {
        console.log("No match found in database, using mock food");

        // Fallback with a generic food item for testing
        matchedFood = {
          id: 999999,
          description: `${item.name} (Genérico)`,
          category: "Genérico",
          kcal: 100,
          protein_g: 5,
          carbs_g: 10,
          fat_g: 5,
        };
        matchFound = true;
      }

      // Add the matched item with original quantity/unit information
      if (matchFound && matchedFood) {
        matchedItems.push({
          foodId: matchedFood.id,
          food: matchedFood,
          quantity: item.quantity || 100,
          mealType: item.mealType || "snack",
          // Pass through the original quantity and unit
          originalQuantity: item.originalQuantity,
          originalUnit: item.originalUnit,
        });
      }
    }

    console.log("Final matched items with database:", matchedItems);
    return matchedItems;
  } catch (error) {
    console.error("Error matching foods with database:", error);
    return [];
  }
}

export default { extractFoodItems, matchWithDatabaseFoods };

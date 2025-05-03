// supabase/functions/extract-food-info/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const unitConversions = [
  // Volume measurements
  {
    unit: ["colher de sopa", "colheres de sopa", "tablespoon", "tablespoons", "tbsp"],
    factor: (foodName) => {
      if (foodName.toLowerCase().includes("arroz")) return 15;
      if (foodName.toLowerCase().includes("açúcar")) return 12;
      if (foodName.toLowerCase().includes("farinha")) return 8;
      if (foodName.toLowerCase().includes("óleo")) return 13;
      if (foodName.toLowerCase().includes("omelete")) return 15;
      return 15;
    },
  },
  {
    unit: ["colher de chá", "colheres de chá", "teaspoon", "teaspoons", "tsp"],
    factor: 5,
  },
  {
    unit: ["xícara", "xícaras", "cup", "cups", "copo", "copos"],
    factor: (foodName) => {
      if (foodName.toLowerCase().includes("arroz")) return 200;
      if (foodName.toLowerCase().includes("farinha")) return 120;
      if (foodName.toLowerCase().includes("leite")) return 240;
      return 200;
    },
  },
  {
    unit: ["scoop", "scoops", "dose", "doses", "medida", "medidas"],
    factor: (foodName) => {
      if (foodName.toLowerCase().includes("whey") || foodName.toLowerCase().includes("proteína")) return 30;
      if (foodName.toLowerCase().includes("creatina")) return 5;
      return 30;
    },
  },
  {
    unit: ["fatia", "fatias", "slice", "slices"],
    factor: (foodName) => {
      if (foodName.toLowerCase().includes("pão")) return 30;
      if (foodName.toLowerCase().includes("queijo")) return 20;
      if (foodName.toLowerCase().includes("presunto")) return 15;
      return 25;
    },
  },
  {
    unit: ["unidade", "unidades", "unit", "units", "piece", "pieces"],
    factor: (foodName) => {
      if (foodName.toLowerCase().includes("ovo")) return 50;
      if (foodName.toLowerCase().includes("banana")) return 100;
      if (foodName.toLowerCase().includes("maçã")) return 150;
      if (foodName.toLowerCase().includes("laranja")) return 130;
      return 100;
    },
  },
  {
    unit: ["kg", "kilogram", "kilograms", "quilo", "quilos"],
    factor: 1000,
  },
  {
    unit: ["lb", "pound", "pounds", "libra", "libras"],
    factor: 453.6,
  },
];
function convertToGrams(quantity, unit, foodName) {
  const normalizedUnit = unit.toLowerCase().trim();
  // If already in grams, return as is
  if (normalizedUnit === "g" || normalizedUnit === "grams" || normalizedUnit === "gramas") {
    return {
      grams: quantity,
      originalUnit: "g",
    };
  }
  // Find matching conversion rule
  for (const rule of unitConversions) {
    if (rule.unit.some((u) => normalizedUnit.includes(u))) {
      const factor = typeof rule.factor === "function" ? rule.factor(foodName) : rule.factor;
      return {
        grams: Math.round(quantity * factor),
        originalUnit: unit,
      };
    }
  }
  // Default for unknown units (assume grams)
  return {
    grams: quantity,
    originalUnit: unit,
  };
}
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    // Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Missing authorization header",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Invalid token",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    const { text: text1 } = await req.json();
    if (!text1) {
      return new Response(
        JSON.stringify({
          error: "No text provided",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    // First try OpenAI extraction
    let foodItems = await openAiExtraction(text1);
    // Fallback to regex if OpenAI fails
    if (foodItems.length === 0) {
      foodItems = fallbackExtraction(text1);
    }
    return new Response(
      JSON.stringify({
        foodItems,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    // Final fallback
    const foodItems = fallbackExtraction(text || "");
    return new Response(
      JSON.stringify({
        foodItems,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
// OpenAI extraction
async function openAiExtraction(text1) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition assistant. Extract food items with their quantities and units. Return JSON format.",
          },
          {
            role: "user",
            content: `Extract food items from: "${text1}". Return as: {
              "foodItems": [{
                "name": "food name",
                "quantity": number,
                "unit": "unit (colher de sopa, unidade, fatia, etc)",
                "mealType": "café da manhã/almoço/jantar/lanche"
              }]
            }`,
          },
        ],
        temperature: 0.1,
        response_format: {
          type: "json_object",
        },
      }),
    });
    const result = await response.json();
    const content = JSON.parse(result.choices[0].message.content);
    // Process and convert units to grams
    const processedItems = (content.foodItems || []).map((item) => {
      const { grams, originalUnit } = convertToGrams(item.quantity, item.unit, item.name);
      return {
        name: item.name,
        quantity: grams,
        unit: "g",
        originalQuantity: item.quantity,
        originalUnit: originalUnit,
        mealType: item.mealType,
      };
    });
    return processedItems;
  } catch (error) {
    console.error("OpenAI extraction failed:", error);
    return [];
  }
}
// Fallback extraction with unit conversion
function fallbackExtraction(text1) {
  const items = [];
  const lowerText = text1.toLowerCase();
  // Determine meal type
  let mealType = "lanche";
  if (lowerText.includes("café da manhã") || lowerText.includes("manhã")) {
    mealType = "café da manhã";
  } else if (lowerText.includes("almoço")) {
    mealType = "almoço";
  } else if (lowerText.includes("jantar")) {
    mealType = "jantar";
  }
  // Enhanced regex patterns
  const patterns = [
    // Pattern for quantity + unit + food
    /(\d+(?:\.\d+)?)\s*(colher(?:es)? de sopa|colher(?:es)? de chá|xícara|fatia|unidade|gramas?|g)\s*(?:de)?\s*([a-zÀ-ú\s]+?)(?=,|e\s|$|\.|;)/gi,
    // Pattern for "duas bananas", "dois ovos", etc.
    /(duas?|dois?|uma?|um)\s+([a-zÀ-ú\s]+?)(?=,|e\s|$|\.|;)/gi,
    // Pattern for quantity + food (no unit)
    /(\d+)\s+([a-zÀ-ú\s]+?)(?=,|e\s|$|\.|;)/gi,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text1)) !== null) {
      let quantity = 1;
      let unit = "unidade";
      let name = "";
      if (pattern.source.includes("colher")) {
        // Pattern with explicit unit
        quantity = parseFloat(match[1]);
        unit = match[2];
        name = match[3].trim();
      } else if (pattern.source.includes("duas?")) {
        // Pattern with written numbers
        const textNum = match[1].toLowerCase();
        quantity = textNum.includes("duas") || textNum.includes("dois") ? 2 : 1;
        name = match[2].trim();
        unit = "unidade";
      } else {
        // Pattern with just number + food
        quantity = parseFloat(match[1]);
        name = match[2].trim();
        unit = "unidade";
      }
      if (name && name.length > 2) {
        const { grams, originalUnit } = convertToGrams(quantity, unit, name);
        items.push({
          name,
          quantity: grams,
          unit: "g",
          originalQuantity: quantity,
          originalUnit: originalUnit,
          mealType,
        });
      }
    }
  }
  return items;
}

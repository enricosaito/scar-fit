import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    // Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Missing authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: 'Invalid token'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const { text: text1 } = await req.json();
    if (!text1) {
      return new Response(JSON.stringify({
        error: 'No text provided'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // First try OpenAI extraction
    let foodItems = await openAiExtraction(text1);
    // Fallback to regex if OpenAI fails
    if (foodItems.length === 0) {
      foodItems = fallbackExtraction(text1);
    }
    return new Response(JSON.stringify({
      foodItems
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Final fallback
    const foodItems = fallbackExtraction(text || "");
    return new Response(JSON.stringify({
      foodItems
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
// OpenAI extraction
async function openAiExtraction(text1) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition assistant. Return food items in JSON format.'
          },
          {
            role: 'user',
            content: `Extract food items from: "${text1}". Return as: {
            "foodItems": [{
              "name": "food name",
              "quantity": number,
              "unit": "g",
              "mealType": "café da manhã/almoço/jantar/lanche"
            }]
          }`
          }
        ],
        temperature: 0.1,
        response_format: {
          type: "json_object"
        }
      })
    });
    const result = await response.json();
    const content = JSON.parse(result.choices[0].message.content);
    return content.foodItems || [];
  } catch (error) {
    console.error("OpenAI extraction failed:", error);
    return [];
  }
}
// Fallback extraction
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
  // Fixed regex patterns
  const patterns = [
    /(\d+)\s*(?:gramas?|g)\s*(?:de)?\s*([a-zÀ-ú\s]+)/gi,
    /([a-zÀ-ú\s]+)\s+(\d+)\s*(?:gramas?|g)/gi,
    /(?:comi|ingeri|consumi)\s+([a-zÀ-ú\s]+)/gi
  ];
  for (const pattern of patterns){
    let match;
    while((match = pattern.exec(text1)) !== null){
      const quantity = match[1] ? parseInt(match[1]) : 100;
      const name = (match[2] || match[1]).trim();
      if (name && name.length > 2) {
        items.push({
          name,
          quantity,
          unit: "g",
          mealType
        });
      }
    }
  }
  return items;
}

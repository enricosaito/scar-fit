// app/models/food.ts
import { supabase } from "../lib/supabase";

export interface Food {
  id: number;
  category: string;
  description: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface FoodPortion {
  food: Food;
  quantity: number; // in grams
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  date: string; // ISO date string (YYYY-MM-DD)
}

// app/models/food.ts
export async function searchFoods(query: string, limit = 20): Promise<Food[]> {
  console.log("Searching for:", query); // Add logging

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .ilike("description", `%${query}%`)
    .order("description")
    .limit(limit);

  if (error) {
    console.error("Error searching foods:", error);
    return [];
  }

  console.log("Search results:", data); // Add logging
  return data || [];
}

export async function getFoodById(id: number): Promise<Food | null> {
  const { data, error } = await supabase.from("foods").select("*").eq("id", id).single();

  if (error) {
    console.error("Error fetching food:", error);
    return null;
  }

  return data;
}

export default {
  searchFoods,
  getFoodById,
};

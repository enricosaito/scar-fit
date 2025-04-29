// app/models/food.ts
import { supabase } from "../lib/supabase";

export interface Food {
  id: string;
  description: string;
  category: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at?: string;
  updated_at?: string;
}

export interface FoodPortion {
  food: Food;
  quantity: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  date: string;
}

// Validate food data
function validateFood(food: Partial<Food>): boolean {
  if (!food.description || typeof food.description !== "string") return false;
  if (!food.category || typeof food.category !== "string") return false;
  if (typeof food.kcal !== "number" || food.kcal < 0) return false;
  if (typeof food.protein_g !== "number" || food.protein_g < 0) return false;
  if (typeof food.carbs_g !== "number" || food.carbs_g < 0) return false;
  if (typeof food.fat_g !== "number" || food.fat_g < 0) return false;
  return true;
}

// Search for foods in the database
export async function searchFoods(query: string): Promise<Food[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .ilike("description", `%${query}%`)
      .order("description")
      .limit(50);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error searching foods:", error);
    throw error;
  }
}

// Get food by ID
export async function getFoodById(id: string): Promise<Food | null> {
  try {
    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting food by ID:", error);
    throw error;
  }
}

// Create a new food
export async function createFood(food: Omit<Food, "id" | "created_at" | "updated_at">): Promise<Food> {
  try {
    if (!validateFood(food)) {
      throw new Error("Invalid food data");
    }

    const { data, error } = await supabase
      .from("foods")
      .insert([food])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating food:", error);
    throw error;
  }
}

// Update an existing food
export async function updateFood(id: string, food: Partial<Food>): Promise<Food> {
  try {
    if (!validateFood(food)) {
      throw new Error("Invalid food data");
    }

    const { data, error } = await supabase
      .from("foods")
      .update(food)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating food:", error);
    throw error;
  }
}

// Delete a food
export async function deleteFood(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("foods")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting food:", error);
    throw error;
  }
}

// Get common foods by category
export async function getCommonFoodsByCategory(category: string): Promise<Food[]> {
  try {
    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .eq("category", category)
      .order("description")
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting common foods by category:", error);
    throw error;
  }
}

// Get recently added foods
export async function getRecentFoods(limit: number = 10): Promise<Food[]> {
  try {
    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting recent foods:", error);
    throw error;
  }
}

export default {
  searchFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getCommonFoodsByCategory,
  getRecentFoods,
};

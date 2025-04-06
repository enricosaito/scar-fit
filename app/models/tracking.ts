// Add to app/models/tracking.ts
import { supabase } from "../lib/supabase";
import { FoodPortion } from "./food";

export interface DailyLog {
  id?: string;
  user_id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  items: FoodPortion[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export async function getUserDailyLog(userId: string, date: string): Promise<DailyLog | null> {
  const { data, error } = await supabase.from("daily_logs").select("*").eq("user_id", userId).eq("date", date).single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows found" error
    console.error("Error fetching daily log:", error);
    return null;
  }

  // If no log exists for this date, create a new empty one
  if (!data) {
    return {
      user_id: userId,
      date,
      items: [],
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
    };
  }

  return data;
}

export async function saveDailyLog(log: DailyLog): Promise<DailyLog | null> {
  const { data, error } = await supabase.from("daily_logs").upsert(log).select().single();

  if (error) {
    console.error("Error saving daily log:", error);
    return null;
  }

  return data;
}

export async function addFoodToLog(userId: string, date: string, foodPortion: FoodPortion): Promise<DailyLog | null> {
  // Get current log
  const currentLog = await getUserDailyLog(userId, date);

  if (!currentLog) return null;

  // Calculate nutrition values based on portion
  const portionMultiplier = foodPortion.quantity / 100; // Assuming data is per 100g
  const calories = foodPortion.food.kcal * portionMultiplier;
  const protein = foodPortion.food.protein_g * portionMultiplier;
  const carbs = foodPortion.food.carbs_g * portionMultiplier;
  const fat = foodPortion.food.fat_g * portionMultiplier;

  // Add food to items and update totals
  const updatedLog: DailyLog = {
    ...currentLog,
    items: [...(currentLog.items || []), foodPortion],
    total_calories: (currentLog.total_calories || 0) + calories,
    total_protein: (currentLog.total_protein || 0) + protein,
    total_carbs: (currentLog.total_carbs || 0) + carbs,
    total_fat: (currentLog.total_fat || 0) + fat,
  };

  // Save updated log
  return saveDailyLog(updatedLog);
}

export async function removeFoodFromLog(userId: string, date: string, itemIndex: number): Promise<DailyLog | null> {
  // Get current log
  const currentLog = await getUserDailyLog(userId, date);

  if (!currentLog || !currentLog.items || itemIndex >= currentLog.items.length) {
    return null;
  }

  // Get the item to remove
  const itemToRemove = currentLog.items[itemIndex];

  // Calculate nutrition values to subtract
  const portionMultiplier = itemToRemove.quantity / 100;
  const calories = itemToRemove.food.kcal * portionMultiplier;
  const protein = itemToRemove.food.protein_g * portionMultiplier;
  const carbs = itemToRemove.food.carbs_g * portionMultiplier;
  const fat = itemToRemove.food.fat_g * portionMultiplier;

  // Remove item and update totals
  const updatedItems = [...currentLog.items];
  updatedItems.splice(itemIndex, 1);

  const updatedLog: DailyLog = {
    ...currentLog,
    items: updatedItems,
    total_calories: Math.max(0, (currentLog.total_calories || 0) - calories),
    total_protein: Math.max(0, (currentLog.total_protein || 0) - protein),
    total_carbs: Math.max(0, (currentLog.total_carbs || 0) - carbs),
    total_fat: Math.max(0, (currentLog.total_fat || 0) - fat),
  };

  // Save updated log
  return saveDailyLog(updatedLog);
}

export default {
  getUserDailyLog,
  saveDailyLog,
  addFoodToLog,
  removeFoodFromLog,
};

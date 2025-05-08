// Add to app/models/tracking.ts
import { supabase } from "../lib/supabase";
import { updateUserStreak, checkStreakEligibility } from "./streak";
import { Food, FoodPortion } from "./food";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  items: FoodPortion[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

// Get user's daily log for a specific date
export async function getUserDailyLog(userId: string, date: string): Promise<DailyLog> {
  try {
    // First try to get existing log
    const { data: existingLog, error: fetchError } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    // If log exists, return it
    if (existingLog) {
      return {
        ...existingLog,
        items: existingLog.items || [],
        total_calories: existingLog.total_calories || 0,
        total_protein: existingLog.total_protein || 0,
        total_carbs: existingLog.total_carbs || 0,
        total_fat: existingLog.total_fat || 0,
      };
    }

    // If no log exists, create a new one
    const { data: newLog, error: createError } = await supabase
      .from("daily_logs")
      .insert([
        {
          user_id: userId,
          date,
          items: [],
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    return {
      ...newLog,
      items: [],
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
    };
  } catch (error) {
    console.error("Error getting/creating daily log:", error);
    throw error;
  }
}

// Add food to daily log
export async function addFoodToLog(userId: string, date: string, foodPortion: FoodPortion): Promise<DailyLog> {
  try {
    // Get current log
    const currentLog = await getUserDailyLog(userId, date);

    // Calculate new totals
    const quantity = foodPortion.quantity;
    const food = foodPortion.food;
    const multiplier = quantity / 100;

    const newItem = {
      ...foodPortion,
      food: {
        ...food,
        kcal: Math.round(food.kcal * multiplier),
        protein_g: Math.round(food.protein_g * multiplier * 10) / 10,
        carbs_g: Math.round(food.carbs_g * multiplier * 10) / 10,
        fat_g: Math.round(food.fat_g * multiplier * 10) / 10,
      },
    };

    // Update log with new item and totals
    const updatedItems = [...currentLog.items, newItem];
    const updatedLog = {
      ...currentLog,
      items: updatedItems,
      total_calories: Math.round(updatedItems.reduce((sum, item) => sum + item.food.kcal, 0)),
      total_protein: Math.round(updatedItems.reduce((sum, item) => sum + item.food.protein_g, 0) * 10) / 10,
      total_carbs: Math.round(updatedItems.reduce((sum, item) => sum + item.food.carbs_g, 0) * 10) / 10,
      total_fat: Math.round(updatedItems.reduce((sum, item) => sum + item.food.fat_g, 0) * 10) / 10,
    };

    // Save to database
    const { error: updateError } = await supabase.from("daily_logs").update(updatedLog).eq("id", currentLog.id);

    if (updateError) throw updateError;

    // Check if we need to update the streak
    // Only check if the date is today (avoid streak updates for past days)
    const today = new Date().toISOString().split("T")[0];
    if (date === today) {
      try {
        // Check if user is eligible for streak update after adding this food
        const isEligible = await checkStreakEligibility(userId);

        if (isEligible) {
          // Update the streak
          await updateUserStreak(userId);
        }
      } catch (streakError) {
        console.error("Error updating streak:", streakError);
        // Don't throw error here, as we still want to return the updated log
      }
    }

    return updatedLog;
  } catch (error) {
    console.error("Error adding food to log:", error);
    throw error;
  }
}

// Remove food from daily log
export async function removeFoodFromLog(userId: string, date: string, itemIndex: number): Promise<DailyLog> {
  try {
    // Get current log
    const currentLog = await getUserDailyLog(userId, date);

    // Remove item and update totals
    const updatedItems = currentLog.items.filter((_, index) => index !== itemIndex);
    const updatedLog = {
      ...currentLog,
      items: updatedItems,
      total_calories: Math.round(updatedItems.reduce((sum, item) => sum + item.food.kcal, 0)),
      total_protein: Math.round(updatedItems.reduce((sum, item) => sum + item.food.protein_g, 0) * 10) / 10,
      total_carbs: Math.round(updatedItems.reduce((sum, item) => sum + item.food.carbs_g, 0) * 10) / 10,
      total_fat: Math.round(updatedItems.reduce((sum, item) => sum + item.food.fat_g, 0) * 10) / 10,
    };

    // Save to database
    const { error: updateError } = await supabase.from("daily_logs").update(updatedLog).eq("id", currentLog.id);

    if (updateError) throw updateError;

    return updatedLog;
  } catch (error) {
    console.error("Error removing food from log:", error);
    throw error;
  }
}

// Get user's daily logs for a date range
export async function getUserDailyLogs(userId: string, startDate: string, endDate: string): Promise<DailyLog[]> {
  try {
    const { data: logs, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw error;

    return logs.map((log) => ({
      ...log,
      items: log.items || [],
      total_calories: log.total_calories || 0,
      total_protein: log.total_protein || 0,
      total_carbs: log.total_carbs || 0,
      total_fat: log.total_fat || 0,
    }));
  } catch (error) {
    console.error("Error getting daily logs:", error);
    throw error;
  }
}

export default {
  getUserDailyLog,
  getUserDailyLogs,
  addFoodToLog,
  removeFoodFromLog,
};

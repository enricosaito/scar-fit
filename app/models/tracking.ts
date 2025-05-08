// Modify app/models/tracking.ts - addFoodToLog function
import { updateUserStreak, checkStreakEligibility } from "./streak";

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

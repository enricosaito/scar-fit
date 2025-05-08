// app/models/streak.ts
import { supabase } from "../lib/supabase";

export interface StreakData {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_streak_date: string;
  today_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get or create a user's streak data
 * @param userId User ID
 */
export async function getUserStreakData(userId: string): Promise<StreakData | null> {
  try {
    // Try to get existing streak
    const { data: existingStreak, error: fetchError } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    // If streak exists, return it
    if (existingStreak) {
      return existingStreak;
    }

    // If no streak exists, create a new one
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: newStreak, error: createError } = await supabase
      .from("streaks")
      .insert([
        {
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_streak_date: todayStr,
          today_completed: false,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    return newStreak;
  } catch (error) {
    console.error("Error getting/creating streak data:", error);
    return null;
  }
}

/**
 * Update streak when user completes a goal or logs a meal
 * @param userId User ID
 * @param forceComplete Force completed status (for testing)
 */
export async function updateUserStreak(userId: string, forceComplete: boolean = false): Promise<StreakData | null> {
  try {
    // Get current streak data
    const streakData = await getUserStreakData(userId);
    if (!streakData) return null;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const lastStreakDate = new Date(streakData.last_streak_date);
    lastStreakDate.setHours(0, 0, 0, 0);

    // Calculate days between last streak update and today
    const diffTime = Math.abs(today.getTime() - lastStreakDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let updatedStreak = { ...streakData };
    let streakUpdated = false;

    // If we need to process streak (today or streak needs reset)
    if (diffDays > 1 && !forceComplete) {
      // Missed a day, reset streak (unless it's a recovery day)
      const isRecoveryDay = diffDays === 2;
      if (!isRecoveryDay) {
        updatedStreak.current_streak = 0;
        updatedStreak.today_completed = false;
        streakUpdated = true;
      }
    }

    // Update today's status if we're forcing it or if the user has logged something today
    if (forceComplete || diffDays <= 1) {
      // Only mark as completed if it wasn't already completed
      if (!updatedStreak.today_completed) {
        updatedStreak.today_completed = true;

        // If this is a new day (diffDays === 1), increment streak
        if (diffDays === 1 || forceComplete) {
          updatedStreak.current_streak += 1;

          // Update longest streak if current is higher
          if (updatedStreak.current_streak > updatedStreak.longest_streak) {
            updatedStreak.longest_streak = updatedStreak.current_streak;
          }
        }

        updatedStreak.last_streak_date = todayStr;
        streakUpdated = true;
      }
    }

    // Only update the database if something changed
    if (streakUpdated) {
      const { data, error } = await supabase
        .from("streaks")
        .update(updatedStreak)
        .eq("id", streakData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    return updatedStreak;
  } catch (error) {
    console.error("Error updating streak:", error);
    return null;
  }
}

/**
 * Check if user has completed streak today (logged a meal or achieved a goal)
 * @param userId User ID
 */
export async function checkStreakEligibility(userId: string): Promise<boolean> {
  try {
    // Get today's date in YYYY-MM-DD format
    const todayStr = new Date().toISOString().split("T")[0];

    // Check if the user has logged any meals today
    const { data: dailyLog, error } = await supabase
      .from("daily_logs")
      .select("items")
      .eq("user_id", userId)
      .eq("date", todayStr)
      .single();

    if (error) return false;

    // Check if items array exists and has at least one item
    const hasLoggedMeal = dailyLog?.items && dailyLog.items.length > 0;

    return hasLoggedMeal;
  } catch (error) {
    console.error("Error checking streak eligibility:", error);
    return false;
  }
}

/**
 * Reset streak for a new day
 * @param userId User ID
 */
export async function resetDailyStreak(userId: string): Promise<void> {
  try {
    const streakData = await getUserStreakData(userId);
    if (!streakData) return;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const lastStreakDate = new Date(streakData.last_streak_date);

    // If it's still the same day, don't reset
    if (lastStreakDate.toISOString().split("T")[0] === todayStr) {
      return;
    }

    // Reset today's completion status for a new day
    await supabase
      .from("streaks")
      .update({
        today_completed: false,
        // Don't update last_streak_date or current_streak yet
      })
      .eq("id", streakData.id);
  } catch (error) {
    console.error("Error resetting daily streak:", error);
  }
}

export default {
  getUserStreakData,
  updateUserStreak,
  checkStreakEligibility,
  resetDailyStreak,
};

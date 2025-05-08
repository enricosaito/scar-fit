// Modify app/models/streak.ts to improve eligibility and update logic
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
 * Get or create a user's streak data using upsert to avoid duplicates
 * @param userId User ID
 */
export async function getUserStreakData(userId: string): Promise<StreakData | null> {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // Instead of separate select/insert, use upsert to ensure only one record exists
    const { data, error } = await supabase
      .from("streaks")
      .upsert(
        {
          user_id: userId,
          current_streak: 0, // Only used for new records
          longest_streak: 0, // Only used for new records
          last_streak_date: todayStr, // Only used for new records
          today_completed: false, // Only used for new records
        },
        {
          onConflict: "user_id", // Key to determine if record exists
          ignoreDuplicates: true, // Don't update if record exists
        }
      )
      .select();

    if (error) {
      console.error("Error upserting streak data:", error);
      throw error;
    }

    // After upsert, directly select the record to get the current data
    const { data: streakData, error: fetchError } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching streak data after upsert:", fetchError);
      throw fetchError;
    }

    // Check if streak needs daily reset
    await resetDailyStreakIfNeeded(streakData);

    return streakData;
  } catch (error) {
    console.error("Error in getUserStreakData:", error);
    return null;
  }
}

/**
 * Reset today_completed flag if it's a new day
 */
async function resetDailyStreakIfNeeded(streakData: StreakData): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const lastStreakDate = streakData.last_streak_date.split("T")[0];

    // If it's still the same day, don't reset
    if (lastStreakDate === today) {
      return;
    }

    // If yesterday and completed, we don't want to reset the streak count, just the flag
    // If not yesterday or not completed, the streak will be reset during update

    // Reset today's completion status for a new day
    await supabase
      .from("streaks")
      .update({
        today_completed: false,
      })
      .eq("id", streakData.id);
  } catch (error) {
    console.error("Error resetting daily streak:", error);
  }
}

/**
 * Update streak when user completes a goal or logs a meal
 * @param userId User ID
 * @param forceComplete Force completed status (for testing)
 */
export async function updateUserStreak(userId: string, forceComplete: boolean = false): Promise<StreakData | null> {
  try {
    // Get current streak data (this will ensure a record exists)
    const streakData = await getUserStreakData(userId);
    if (!streakData) return null;

    // If today is already completed, no update needed
    if (streakData.today_completed && !forceComplete) {
      console.log("Streak already completed today, no update needed");
      return streakData;
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const lastStreakDate = new Date(streakData.last_streak_date);

    // Reset time components for date comparison
    lastStreakDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Calculate days between last streak update and today
    const diffTime = Math.abs(today.getTime() - lastStreakDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let updatedStreak = { ...streakData };
    let streakUpdated = false;

    console.log(
      `Streak update: Last date: ${lastStreakDate.toISOString()}, Today: ${today.toISOString()}, Diff days: ${diffDays}`
    );

    // Determine if we need to update the streak
    if (diffDays > 1 && !forceComplete) {
      // Missed a day, reset streak (unless it's a recovery day)
      const isRecoveryDay = diffDays === 2;
      if (!isRecoveryDay) {
        console.log("Missed more than one day, resetting streak");
        updatedStreak.current_streak = 0;
      } else {
        console.log("Recovery day, not resetting streak");
      }

      // Always mark as not completed for a new day
      updatedStreak.today_completed = false;
      streakUpdated = true;
    }

    // Handle today's completion
    if (forceComplete || diffDays <= 1) {
      console.log("Completing today's streak");
      updatedStreak.today_completed = true;

      // If this is a new day (diffDays === 1), increment streak
      if (diffDays === 1 || forceComplete) {
        console.log("New day, incrementing streak");
        updatedStreak.current_streak += 1;

        // Update longest streak if current is higher
        if (updatedStreak.current_streak > updatedStreak.longest_streak) {
          updatedStreak.longest_streak = updatedStreak.current_streak;
        }
      }

      updatedStreak.last_streak_date = todayStr;
      streakUpdated = true;
    }

    // Only update the database if something changed
    if (streakUpdated) {
      console.log("Updating streak in database:", updatedStreak);
      const { data, error } = await supabase
        .from("streaks")
        .update({
          current_streak: updatedStreak.current_streak,
          longest_streak: updatedStreak.longest_streak,
          last_streak_date: updatedStreak.last_streak_date,
          today_completed: updatedStreak.today_completed,
        })
        .eq("id", streakData.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating streak:", error);
        throw error;
      }

      console.log("Streak updated successfully:", data);
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

    if (error && error.code !== "PGRST116") {
      console.error("Error checking daily log:", error);
      return false;
    }

    // Check if items array exists and has at least one item
    const hasLoggedMeal = dailyLog?.items && dailyLog.items.length > 0;

    console.log("Streak eligibility check:", hasLoggedMeal ? "Eligible" : "Not eligible");
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

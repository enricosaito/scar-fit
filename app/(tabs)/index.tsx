// app/(tabs)/index.tsx
import React, { useState, useEffect, useRef } from "react";
import { Text, View, Pressable, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import NutritionSummary from "../components/tracking/NutritionSummary";
import MealList from "../components/tracking/MealList";
import WeeklyActivity from "../components/tracking/WeeklyActivity";
import type { FoodPortion } from "../models/food";
import Header from "../components/ui/Header";
import { MacroData } from "../models/user";
import { DailyLog, getUserDailyLog } from "../models/tracking";
import { clearImageCache } from "../utils/imageUpload";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import PagerView from "react-native-pager-view";
import ContributionGraph from "../components/tracking/ContributionGraph";
import StreakTracker from "../components/tracking/StreakTracker";
import { getUserStreakData, updateUserStreak, checkStreakEligibility } from "../models/streak";

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userProfile, user, refreshProfile } = useAuth();
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMacroDetails, setShowMacroDetails] = useState(true);
  const [activityDates, setActivityDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Streak Data
  const [streakData, setStreakData] = useState<{
    currentStreak: number;
    longestStreak: number;
    todayCompleted: boolean;
  }>({
    currentStreak: 0,
    longestStreak: 0,
    todayCompleted: false,
  });
  const [streakLoading, setStreakLoading] = useState(false);
  const [streakError, setStreakError] = useState<string | null>(null);

  // Improved loadStreakData function
  const loadStreakData = async () => {
    if (!user) return;

    setStreakLoading(true);
    setStreakError(null);

    try {
      console.log("Loading streak data for user:", user.id);

      // Get streak data
      const data = await getUserStreakData(user.id);
      if (!data) {
        setStreakError("Failed to load streak data");
        return;
      }

      console.log("Retrieved streak data:", data);

      // Check if user has logged meals today
      const isEligibleForStreak = await checkStreakEligibility(user.id);
      console.log("User is eligible for streak update:", isEligibleForStreak);

      // If user has logged meals and streak isn't updated, update it
      if (isEligibleForStreak && !data.today_completed) {
        console.log("Updating streak for eligible user");
        const updatedData = await updateUserStreak(user.id);

        if (updatedData) {
          console.log("Streak updated:", updatedData);
          // Update the UI
          setStreakData({
            currentStreak: updatedData.current_streak,
            longestStreak: updatedData.longest_streak,
            todayCompleted: updatedData.today_completed,
          });

          // If streak was updated, trigger haptic feedback
          if (updatedData.today_completed && updatedData.current_streak > data.current_streak) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else {
          console.log("Failed to update streak");
          setStreakError("Failed to update streak");
        }
      } else {
        console.log("Using existing streak data:", data);
        // Just update the UI with existing data
        setStreakData({
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          todayCompleted: data.today_completed,
        });
      }
    } catch (error) {
      console.error("Error loading streak data:", error);
      setStreakError("Error loading streak data");
    } finally {
      setStreakLoading(false);
    }
  };

  // Generate a unique key for the Header component to force re-rendering
  const [headerKey, setHeaderKey] = useState(Date.now().toString());

  // Force refresh when the component comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // When the screen comes into focus, refresh the header
      // This ensures the avatar is up-to-date when navigating back to this screen
      setHeaderKey(Date.now().toString());

      // Also refresh the profile in the background
      refreshProfile().catch((err) => console.error("Error refreshing profile:", err));

      return () => {
        // Cleanup function when component loses focus
      };
    }, [])
  );

  // Check if user has saved macros
  const hasMacros = userProfile?.macros && Object.keys(userProfile?.macros || {}).length > 0;

  // Format date for database queries (YYYY-MM-DD)
  const formatDateForDb = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Load daily log for the selected date
  const loadDailyLog = async (date: Date) => {
    if (!user) return;

    setLoading(true);
    try {
      const dateStr = formatDateForDb(date);
      const log = await getUserDailyLog(user.id, dateStr);
      setDailyLog(log);
    } catch (error) {
      console.error("Error loading daily log:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load activity dates for the week
  const loadActivityDates = async () => {
    if (!user) return;

    try {
      // For now, let's just mark today and yesterday as having activity
      // In a real implementation, you'd fetch this from your database
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const dates = [today.toISOString().split("T")[0], yesterday.toISOString().split("T")[0]];

      setActivityDates(dates);
    } catch (error) {
      console.error("Error loading activity dates:", error);
    }
  };

  // Handle date selection from weekly activity
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    loadDailyLog(date);
  };

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // Load the daily log for selected date
      await loadDailyLog(selectedDate);

      // Load activity dates
      await loadActivityDates();

      // Load streak data
      await loadStreakData();

      // Force refresh the profile to get the latest avatar
      await refreshProfile();

      // Force re-render the Header component with a new key
      setHeaderKey(Date.now().toString());
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load data when component mounts or selected date changes
  useEffect(() => {
    loadDailyLog(selectedDate);
    loadActivityDates();
    loadStreakData();
  }, [user, selectedDate]);

  // Add another useEffect to reload streak data when daily log changes
  useEffect(() => {
    if (dailyLog) {
      loadStreakData();
    }
  }, [dailyLog]);

  // Group food items by meal type
  const getMealItems = (mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    if (!dailyLog || !dailyLog.items) return [];
    return dailyLog.items.filter((item) => item.meal_type === mealType);
  };

  // Prepare meals data for MealList component
  type MealType = "breakfast" | "lunch" | "dinner" | "snack";

  type Meal = {
    type: MealType;
    title: string;
    items: FoodPortion[];
    icon: string;
    time?: string;
  };

  const prepareMeals = (): Meal[] => {
    if (!dailyLog) return [];

    return [
      {
        type: "breakfast",
        title: "Café da Manhã",
        items: getMealItems("breakfast"),
        icon: "coffee",
        time: "7:00 - 9:00",
      },
      {
        type: "lunch",
        title: "Almoço",
        items: getMealItems("lunch"),
        icon: "sun",
        time: "12:00 - 14:00",
      },
      {
        type: "dinner",
        title: "Jantar",
        items: getMealItems("dinner"),
        icon: "moon",
        time: "18:00 - 20:00",
      },
      {
        type: "snack",
        title: "Lanches",
        items: getMealItems("snack"),
        icon: "package",
      },
    ];
  };

  // Helper: get start and end of current week (Monday-Sunday)
  const getWeekBounds = (date: Date) => {
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  };

  // Get all dates for the current week (Monday-Sunday)
  const getWeekDates = (date: Date) => {
    const { monday } = getWeekBounds(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  // Track the current week's Monday in state
  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - ((day + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [currentWeekMonday, setCurrentWeekMonday] = useState(() => getMonday(selectedDate));
  const weekDates = React.useMemo(() => getWeekDates(currentWeekMonday), [currentWeekMonday]);
  const selectedIndex = weekDates.findIndex((d) => d.toDateString() === selectedDate.toDateString());

  // Preload daily logs for the week
  const [weekLogs, setWeekLogs] = useState<(DailyLog | null)[]>(Array(7).fill(null));

  // Only fetch logs when the week changes
  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      const logs = await Promise.all(
        weekDates.map(async (date) => {
          try {
            const dateStr = formatDateForDb(date);
            return await getUserDailyLog(user.id, dateStr);
          } catch {
            return null;
          }
        })
      );
      setWeekLogs(logs);
    };
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentWeekMonday.toISOString()]);

  // When selectedDate changes, if it's outside the current week, update the week
  useEffect(() => {
    const monday = getMonday(selectedDate);
    if (monday.getTime() !== currentWeekMonday.getTime()) {
      setCurrentWeekMonday(monday);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handlePageSelected = (e: any) => {
    const idx = e.nativeEvent.position;
    setSelectedDate(weekDates[idx]);
  };

  // Add showStreakDetails function
  const showStreakDetails = () => {
    // Navigate to streak details screen or show modal
    router.push("/screens/StreakDetails" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title="Scar Fit ⚡️" key={headerKey} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View className="px-4 py-3 mt-3">
          {/* Weekly Activity Component */}
          <WeeklyActivity
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            activityDates={activityDates}
            greeting={`Olá, ${userProfile?.full_name?.split(" ")[0] || user?.user_metadata?.name || "Usuário"}`}
          />

          {/* Loading state */}
          {loading && !refreshing ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {/* Nutrition Summary with new component */}
              {hasMacros && weekLogs[selectedIndex] ? (
                <>
                  <PagerView
                    style={{ height: 260 }}
                    initialPage={selectedIndex}
                    scrollEnabled={true}
                    onPageSelected={handlePageSelected}
                    key={weekDates.map((d) => d.toDateString()).join("-")}
                  >
                    {weekDates.map((date, idx) => (
                      <View key={date.toISOString()}>
                        <NutritionSummary
                          macros={userProfile?.macros as Partial<MacroData>}
                          current={
                            weekLogs[idx]
                              ? {
                                  calories: weekLogs[idx]?.total_calories,
                                  protein: weekLogs[idx]?.total_protein,
                                  carbs: weekLogs[idx]?.total_carbs,
                                  fat: weekLogs[idx]?.total_fat,
                                }
                              : {}
                          }
                          selectedDate={date}
                        />
                      </View>
                    ))}
                  </PagerView>
                </>
              ) : !hasMacros ? (
                <View className="bg-card rounded-xl border border-border p-6 mb-6">
                  <Text className="text-lg font-semibold text-foreground mb-4">Defina suas metas</Text>
                  <Text className="text-muted-foreground mb-4">
                    Calcule suas metas nutricionais personalizadas para começar a acompanhar seu progresso.
                  </Text>
                  <Pressable
                    className="bg-primary py-2 px-4 rounded-lg items-center"
                    onPress={() => router.push("/screens/onboarding")}
                  >
                    <Text className="text-white font-medium">Calcular Metas</Text>
                  </Pressable>
                </View>
              ) : null}

              {/* Streak Tracker */}
              {user && !streakLoading ? (
                <StreakTracker
                  currentStreak={streakData.currentStreak}
                  longestStreak={streakData.longestStreak}
                  todayCompleted={streakData.todayCompleted}
                  onPress={showStreakDetails}
                />
              ) : streakLoading ? (
                <View className="bg-card rounded-xl border border-border p-4 mb-4 items-center justify-center">
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text className="text-muted-foreground text-sm mt-2">Carregando streak...</Text>
                </View>
              ) : streakError ? (
                <Pressable className="bg-card rounded-xl border border-border p-4 mb-4" onPress={loadStreakData}>
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mr-3">
                      <Feather name="refresh-cw" size={20} color="#ef4444" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">Erro ao carregar streak</Text>
                      <Text className="text-muted-foreground text-xs">Toque para tentar novamente</Text>
                    </View>
                  </View>
                </Pressable>
              ) : null}

              {/* Meal List Section */}
              {dailyLog && (
                <>
                  <View className="flex-row justify-between items-center mt-12 mb-3">
                    <Text className="text-xl font-bold text-foreground">Refeições</Text>
                  </View>

                  <MealList meals={prepareMeals()} />
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// app/(tabs)/index.tsx
import React, { useState, useEffect } from "react";
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
import PagerView from "react-native-pager-view";
import StreakTracker from "../components/tracking/StreakTracker";
import { getUserStreakData, updateUserStreak, checkStreakEligibility } from "../models/streak";

// Custom hook for streak management
const useStreak = (userId: string | undefined) => {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    todayCompleted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStreakData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getUserStreakData(userId);
      if (!data) {
        setError("Failed to load streak data");
        return;
      }

      const isEligibleForStreak = await checkStreakEligibility(userId);

      if (isEligibleForStreak && !data.today_completed) {
        const updatedData = await updateUserStreak(userId);
        if (updatedData) {
          setStreakData({
            currentStreak: updatedData.current_streak,
            longestStreak: updatedData.longest_streak,
            todayCompleted: updatedData.today_completed,
          });

          if (updatedData.today_completed && updatedData.current_streak > data.current_streak) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else {
          setError("Failed to update streak");
        }
      } else {
        setStreakData({
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          todayCompleted: data.today_completed,
        });
      }
    } catch (error) {
      setError("Error loading streak data");
    } finally {
      setLoading(false);
    }
  };

  return { streakData, loading: loading, error, loadStreakData };
};

// Custom hook for date management
const useDateManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activityDates, setActivityDates] = useState<string[]>([]);

  const getWeekBounds = (date: Date) => {
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  };

  const getWeekDates = (date: Date) => {
    const { monday } = getWeekBounds(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - ((day + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [currentWeekMonday, setCurrentWeekMonday] = useState(() => getMonday(selectedDate));
  const weekDates = React.useMemo(() => getWeekDates(currentWeekMonday), [currentWeekMonday]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const monday = getMonday(date);
    if (monday.getTime() !== currentWeekMonday.getTime()) {
      setCurrentWeekMonday(monday);
    }
  };

  return {
    selectedDate,
    activityDates,
    setActivityDates,
    weekDates,
    currentWeekMonday,
    handleDateSelect,
  };
};

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userProfile, user, refreshProfile } = useAuth();
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [weekLogs, setWeekLogs] = useState<(DailyLog | null)[]>(Array(7).fill(null));
  const [headerKey, setHeaderKey] = useState(Date.now().toString());

  const { streakData, loading: streakLoading, error: streakError, loadStreakData } = useStreak(user?.id);
  const { selectedDate, activityDates, setActivityDates, weekDates, handleDateSelect } = useDateManagement();

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
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dates = [today.toISOString().split("T")[0], yesterday.toISOString().split("T")[0]];
      setActivityDates(dates);
    } catch (error) {
      console.error("Error loading activity dates:", error);
    }
  };

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadDailyLog(selectedDate), loadActivityDates(), loadStreakData(), refreshProfile()]);
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

  // Reload streak data when daily log changes
  useEffect(() => {
    if (dailyLog) {
      loadStreakData();
    }
  }, [dailyLog]);

  // Preload daily logs for the week
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
  }, [user, weekDates]);

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
        type: "breakfast" as MealType,
        title: "Café da Manhã",
        items: getMealItems("breakfast"),
        icon: "coffee",
        time: "7:00 - 9:00",
      },
      {
        type: "lunch" as MealType,
        title: "Almoço",
        items: getMealItems("lunch"),
        icon: "sun",
        time: "12:00 - 14:00",
      },
      {
        type: "dinner" as MealType,
        title: "Jantar",
        items: getMealItems("dinner"),
        icon: "moon",
        time: "18:00 - 20:00",
      },
      {
        type: "snack" as MealType,
        title: "Lanches",
        items: getMealItems("snack"),
        icon: "package",
      },
    ];
  };

  const handlePageSelected = (e: any) => {
    const idx = e.nativeEvent.position;
    handleDateSelect(weekDates[idx]);
  };

  const showStreakDetails = () => {
    router.push("/screens/StreakDetails" as any);
  };

  const selectedIndex = weekDates.findIndex((d) => d.toDateString() === selectedDate.toDateString());

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
          <WeeklyActivity
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            activityDates={activityDates}
            greeting={`Olá, ${userProfile?.full_name?.split(" ")[0] || user?.user_metadata?.name || "Usuário"}`}
          />

          {loading && !refreshing ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {hasMacros && weekLogs[selectedIndex] ? (
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

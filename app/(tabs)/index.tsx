// app/(tabs)/index.tsx
import React, { useState, useEffect, useRef } from "react";
import { Text, View, Pressable, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
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

// Create a reference to the Header component
let headerRef: React.RefObject<typeof Header> = { current: null };

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
  }, [user, selectedDate]);

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
              {hasMacros && dailyLog ? (
                <NutritionSummary
                  macros={userProfile?.macros as Partial<MacroData>}
                  current={{
                    calories: dailyLog.total_calories,
                    protein: dailyLog.total_protein,
                    carbs: dailyLog.total_carbs,
                    fat: dailyLog.total_fat,
                  }}
                  showDetails={showMacroDetails}
                  onToggleDetails={() => setShowMacroDetails(!showMacroDetails)}
                />
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

              {/* Rest of the component remains the same */}
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

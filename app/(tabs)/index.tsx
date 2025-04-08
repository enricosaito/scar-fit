// app/(tabs)/index.tsx (partial update to implement the new component)
import React, { useState, useEffect } from "react";
import { Text, View, Pressable, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import NutritionSummary from "../components/tracking/NutritionSummary"; // Import the new component
import MealList from "../components/tracking/MealList";
import Header from "../components/ui/Header";
import { MacroData } from "../models/user";
import { DailyLog, getUserDailyLog } from "../models/tracking";

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userProfile, user } = useAuth();
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMacroDetails, setShowMacroDetails] = useState(true); // State for toggling macro details

  // Check if user has saved macros
  const hasMacros = userProfile?.macros && Object.keys(userProfile?.macros || {}).length > 0;

  // Format date for database queries (YYYY-MM-DD)
  const formatDateForDb = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Load daily log for today
  const loadTodaysLog = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const dateStr = formatDateForDb(new Date());
      const log = await getUserDailyLog(user.id, dateStr);
      setDailyLog(log);
    } catch (error) {
      console.error("Error loading daily log:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodaysLog();
    setRefreshing(false);
  };

  // Load data when component mounts
  useEffect(() => {
    loadTodaysLog();
  }, [user]);

  // Group food items by meal type
  const getMealItems = (mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    if (!dailyLog || !dailyLog.items) return [];
    return dailyLog.items.filter((item) => item.meal_type === mealType);
  };

  // Prepare meals data for MealList component
  const prepareMeals = () => {
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
      <Header title="Scar Fit ⚡️" />

      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="px-4 py-3 mt-3">
          <Text className="text-2xl font-bold text-foreground mb-5">
            Olá, {userProfile?.full_name?.split(" ")[0] || user?.user_metadata?.name || "Usuário"}!
          </Text>

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
                    onPress={() => router.push("/(tabs)/calculator")}
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

              {/* Daily Tip */}
              <View className="bg-accent rounded-xl p-6 mb-4">
                <Text className="text-lg font-semibold text-accent-foreground mb-2">Registrar uma refeição</Text>
                <Text className="text-accent-foreground">
                  Toque no botão azul abaixo com símbolo ( + ) para adicionar uma refeição!
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

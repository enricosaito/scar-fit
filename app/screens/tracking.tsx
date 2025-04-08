// app/tracking.tsx (updated)
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Food, FoodPortion, searchFoods } from "../models/food";
import { DailyLog, getUserDailyLog, addFoodToLog, removeFoodFromLog } from "../models/tracking";
import MealSection from "../components/tracking/MealSection";
import Header from "../components/ui/Header";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export default function Tracking() {
  const router = useRouter();
  const { colors } = useTheme();
  const { mode, showSearch } = useLocalSearchParams();
  const { user, userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Daily log state
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(false);

  // Food search state
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Add food state
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [addFoodVisible, setAddFoodVisible] = useState(false);
  const [quantity, setQuantity] = useState("100");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");

  // Check if we're in add mode (coming from the + button)
  const isAddMode = mode === "add";

  // Format date as "Segunda, 15 de Abril" in Portuguese
  const formatDate = (date: Date): string => {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    return `${dayName}, ${day} de ${month}`;
  };

  // Date format for database queries (YYYY-MM-DD)
  const formatDateForDb = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Navigate to previous day
  const previousDay = (): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const nextDay = (): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Load daily log for the selected date
  const loadDailyLog = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const dateStr = formatDateForDb(selectedDate);
      const log = await getUserDailyLog(user.id, dateStr);
      setDailyLog(log);
    } catch (error) {
      console.error("Error loading daily log:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle food search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchFoods(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching foods:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Select a food to add
  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setSearchVisible(false);
    setAddFoodVisible(true);
  };

  // Add the selected food to the daily log
  const handleAddFood = async () => {
    if (!user || !selectedFood) return;

    try {
      const dateStr = formatDateForDb(selectedDate);
      const quantityNum = parseFloat(quantity);

      if (isNaN(quantityNum) || quantityNum <= 0) {
        Alert.alert("Erro", "Por favor insira uma quantidade válida maior que zero.");
        return;
      }

      const foodPortion: FoodPortion = {
        food: selectedFood,
        quantity: quantityNum,
        meal_type: selectedMealType,
        date: dateStr,
      };

      const updatedLog = await addFoodToLog(user.id, dateStr, foodPortion);
      setDailyLog(updatedLog);
      setAddFoodVisible(false);
      setSelectedFood(null);
      setQuantity("100");
    } catch (error) {
      console.error("Error adding food:", error);
      Alert.alert("Erro", "Ocorreu um erro ao adicionar o alimento.");
    }
  };

  // Remove a food from the daily log
  const handleRemoveFood = async (itemIndex: number) => {
    if (!user || !dailyLog) return;

    try {
      const dateStr = formatDateForDb(selectedDate);
      const updatedLog = await removeFoodFromLog(user.id, dateStr, itemIndex);
      setDailyLog(updatedLog);
    } catch (error) {
      console.error("Error removing food:", error);
      Alert.alert("Erro", "Ocorreu um erro ao remover o alimento.");
    }
  };

  // Load data when component mounts or date changes
  useEffect(() => {
    loadDailyLog();
  }, [selectedDate, user]);

  // Open search modal when in add mode
  useEffect(() => {
    if (showSearch === "true") {
      setSearchVisible(true);
    }
  }, [showSearch]);

  // Group food items by meal type
  const getMealItems = (mealType: MealType) => {
    if (!dailyLog || !dailyLog.items) return [];
    return dailyLog.items.filter((item) => item.meal_type === mealType);
  };

  // Get total calories for the day
  const getTotalCalories = () => {
    return dailyLog?.total_calories || 0;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Custom Header */}
      <Header title="Gerenciar Refeições" showProfile={false} showNotifications={false} />

      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          {/* Date Selector */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable onPress={previousDay} className="p-2">
              <Feather name="chevron-left" size={24} color={colors.foreground} />
            </Pressable>

            <Text className="text-lg font-medium text-foreground">{formatDate(selectedDate)}</Text>

            <Pressable onPress={nextDay} className="p-2">
              <Feather name="chevron-right" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Loading indicator */}
          {loading && (
            <View className="py-4 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {!loading && dailyLog && (
            <>
              {/* Total Calories Summary */}
              <View className="bg-card rounded-xl border border-border p-4 mb-6">
                <Text className="text-lg font-semibold text-foreground mb-2">Total do Dia</Text>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-3xl font-bold text-foreground">{Math.round(getTotalCalories())}</Text>
                    <Text className="text-muted-foreground">calorias</Text>
                  </View>
                  <Button onPress={() => setSearchVisible(true)} className="bg-primary px-4 py-2">
                    <View className="flex-row items-center">
                      <Feather name="plus" size={16} color="white" />
                      <Text className="text-white ml-2">Adicionar Alimento</Text>
                    </View>
                  </Button>
                </View>
              </View>

              {/* Meals */}
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-foreground">Refeições</Text>
                </View>

                {dailyLog.items && dailyLog.items.length > 0 ? (
                  <>
                    {/* Breakfast */}
                    <MealSection
                      title="Café da Manhã"
                      icon="coffee"
                      items={getMealItems("breakfast")}
                      colors={colors}
                      onRemove={handleRemoveFood}
                    />

                    {/* Lunch */}
                    <MealSection
                      title="Almoço"
                      icon="sun"
                      items={getMealItems("lunch")}
                      colors={colors}
                      onRemove={handleRemoveFood}
                    />

                    {/* Dinner */}
                    <MealSection
                      title="Jantar"
                      icon="moon"
                      items={getMealItems("dinner")}
                      colors={colors}
                      onRemove={handleRemoveFood}
                    />

                    {/* Snacks */}
                    <MealSection
                      title="Lanches"
                      icon="package"
                      items={getMealItems("snack")}
                      colors={colors}
                      onRemove={handleRemoveFood}
                    />
                  </>
                ) : (
                  <View className="bg-card rounded-xl border border-border p-8 items-center">
                    <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
                      <Feather name="clipboard" size={24} color={colors.mutedForeground} />
                    </View>
                    <Text className="text-lg font-medium mb-2 text-center text-foreground">
                      Nenhuma refeição registrada
                    </Text>
                    <Text className="text-muted-foreground text-center mb-4">
                      Adicione refeições para acompanhar seus macros diários
                    </Text>

                    <Button onPress={() => setSearchVisible(true)}>Adicionar Primeira Refeição</Button>
                  </View>
                )}
              </View>

              {/* Tips - only show in normal mode */}
              {!isAddMode && (
                <View className="bg-accent rounded-xl p-6">
                  <Text className="text-lg font-semibold text-accent-foreground mb-2">Dica do Dia</Text>
                  <Text className="text-accent-foreground">
                    Para ter mais energia ao longo do dia, procure distribuir suas refeições em intervalos regulares de
                    3-4 horas.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Food Search Modal */}
      <Modal
        visible={searchVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setSearchVisible(false);
          if (isAddMode) router.back();
        }}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center p-4 border-b border-border">
            <Pressable
              onPress={() => {
                setSearchVisible(false);
                if (isAddMode) router.back();
              }}
              className="p-2"
            >
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
            <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Pesquisar Alimentos</Text>
          </View>

          <View className="p-4">
            <View className="flex-row items-center bg-card rounded-lg border border-border px-3 py-2 mb-4">
              <Feather name="search" size={20} color={colors.mutedForeground} />
              <TextInput
                className="ml-2 flex-1 text-foreground"
                placeholder="Pesquisar alimentos..."
                placeholderTextColor={colors.mutedForeground}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            {searchLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                {searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <Pressable
                        className="bg-card rounded-lg border border-border p-3 mb-2"
                        onPress={() => handleSelectFood(item)}
                      >
                        <Text className="text-foreground font-medium mb-1">{item.description}</Text>
                        <View className="flex-row justify-between">
                          <Text className="text-muted-foreground text-xs">{item.category}</Text>
                          <Text className="text-primary text-xs">{item.kcal} kcal/100g</Text>
                        </View>
                        <View className="flex-row mt-1">
                          <Text className="text-xs text-purple-500 mr-2">P: {item.protein_g}g</Text>
                          <Text className="text-xs text-yellow-500 mr-2">C: {item.carbs_g}g</Text>
                          <Text className="text-xs text-red-500">G: {item.fat_g}g</Text>
                        </View>
                      </Pressable>
                    )}
                  />
                ) : (
                  searchQuery.length > 1 && (
                    <View className="items-center py-8">
                      <Feather name="search" size={48} color={colors.mutedForeground} />
                      <Text className="text-muted-foreground mt-2">Nenhum resultado encontrado</Text>
                    </View>
                  )
                )}
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Add Food Modal */}
      <Modal
        visible={addFoodVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddFoodVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center p-4 border-b border-border">
            <Pressable onPress={() => setAddFoodVisible(false)} className="p-2">
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
            <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Adicionar Alimento</Text>
          </View>

          {selectedFood && (
            <ScrollView className="p-4">
              <View className="bg-card rounded-xl border border-border p-4 mb-6">
                <Text className="text-xl font-medium text-foreground mb-1">{selectedFood.description}</Text>
                <Text className="text-muted-foreground mb-4">{selectedFood.category}</Text>

                <View className="flex-row justify-between mb-4">
                  <View className="items-center">
                    <Text className="text-sm text-muted-foreground">Calorias</Text>
                    <Text className="text-lg font-medium text-foreground">{selectedFood.kcal}</Text>
                    <Text className="text-xs text-muted-foreground">kcal/100g</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-sm text-muted-foreground">Proteínas</Text>
                    <Text className="text-lg font-medium text-purple-500">{selectedFood.protein_g}g</Text>
                    <Text className="text-xs text-muted-foreground">por 100g</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-sm text-muted-foreground">Carboidratos</Text>
                    <Text className="text-lg font-medium text-yellow-500">{selectedFood.carbs_g}g</Text>
                    <Text className="text-xs text-muted-foreground">por 100g</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-sm text-muted-foreground">Gorduras</Text>
                    <Text className="text-lg font-medium text-red-500">{selectedFood.fat_g}g</Text>
                    <Text className="text-xs text-muted-foreground">por 100g</Text>
                  </View>
                </View>
              </View>

              <Text className="font-medium text-foreground mb-2">Quantidade (g)</Text>
              <TextInput
                className="border border-border bg-card text-foreground rounded-md px-3 py-2 mb-4"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="100"
                placeholderTextColor={colors.mutedForeground}
              />

              <Text className="font-medium text-foreground mb-2">Refeição</Text>
              <View className="flex-row mb-6">
                <Pressable
                  onPress={() => setSelectedMealType("breakfast")}
                  className={`flex-1 py-2 px-3 rounded-md mr-2 ${
                    selectedMealType === "breakfast" ? "bg-primary" : "bg-card border border-border"
                  }`}
                >
                  <Text
                    className={
                      selectedMealType === "breakfast" ? "text-white text-center" : "text-foreground text-center"
                    }
                  >
                    Café da Manhã
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedMealType("lunch")}
                  className={`flex-1 py-2 px-3 rounded-md mr-2 ${
                    selectedMealType === "lunch" ? "bg-primary" : "bg-card border border-border"
                  }`}
                >
                  <Text
                    className={selectedMealType === "lunch" ? "text-white text-center" : "text-foreground text-center"}
                  >
                    Almoço
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row mb-6">
                <Pressable
                  onPress={() => setSelectedMealType("dinner")}
                  className={`flex-1 py-2 px-3 rounded-md mr-2 ${
                    selectedMealType === "dinner" ? "bg-primary" : "bg-card border border-border"
                  }`}
                >
                  <Text
                    className={selectedMealType === "dinner" ? "text-white text-center" : "text-foreground text-center"}
                  >
                    Jantar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedMealType("snack")}
                  className={`flex-1 py-2 px-3 rounded-md ${
                    selectedMealType === "snack" ? "bg-primary" : "bg-card border border-border"
                  }`}
                >
                  <Text
                    className={selectedMealType === "snack" ? "text-white text-center" : "text-foreground text-center"}
                  >
                    Lanche
                  </Text>
                </Pressable>
              </View>

              {/* Preview nutrition based on quantity */}
              <View className="bg-card rounded-xl border border-border p-4 mb-6">
                <Text className="font-medium text-foreground mb-2">Prévia para {quantity}g</Text>

                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-muted-foreground text-xs">Calorias</Text>
                    <Text className="text-foreground">
                      {Math.round((selectedFood.kcal * parseFloat(quantity || "0")) / 100)} kcal
                    </Text>
                  </View>
                  <View>
                    <Text className="text-muted-foreground text-xs">Proteínas</Text>
                    <Text className="text-purple-500">
                      {Math.round((selectedFood.protein_g * parseFloat(quantity || "0")) / 100)}g
                    </Text>
                  </View>
                  <View>
                    <Text className="text-muted-foreground text-xs">Carboidratos</Text>
                    <Text className="text-yellow-500">
                      {Math.round((selectedFood.carbs_g * parseFloat(quantity || "0")) / 100)}g
                    </Text>
                  </View>
                  <View>
                    <Text className="text-muted-foreground text-xs">Gorduras</Text>
                    <Text className="text-red-500">
                      {Math.round((selectedFood.fat_g * parseFloat(quantity || "0")) / 100)}g
                    </Text>
                  </View>
                </View>
              </View>

              <Button onPress={handleAddFood}>Adicionar à Refeição</Button>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

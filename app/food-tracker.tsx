// app/food-tracker.tsx
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
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import { Food, FoodPortion, searchFoods } from "./models/food";
import { DailyLog, getUserDailyLog, addFoodToLog, removeFoodFromLog } from "./models/tracking";
import Button from "./components/ui/Button";
import Header from "./components/ui/Header";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export default function FoodTracker() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, userProfile } = useAuth();
  
  // State for date selection
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  
  // Daily log state
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Food search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Food[]>([]);

  // Add food state
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [addFoodVisible, setAddFoodVisible] = useState(false);
  const [quantity, setQuantity] = useState("100");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");

  // Format date as "Segunda, 15 de Abril" in Portuguese
  const formatDate = (date: Date): string => {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
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

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailyLog();
    setRefreshing(false);
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
    setAddFoodVisible(true);
    
    // Add to recent searches if not already there
    if (!recentSearches.some(item => item.id === food.id)) {
      setRecentSearches(prev => [food, ...prev].slice(0, 5));
    }
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
      setSearchQuery("");
      setSearchResults([]);
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

  // Group food items by meal type
  const getMealItems = (mealType: MealType) => {
    if (!dailyLog || !dailyLog.items) return [];
    return dailyLog.items.filter((item) => item.meal_type === mealType);
  };

  // Calculate total calories for each meal type
  const getMealCalories = (mealType: MealType) => {
    const items = getMealItems(mealType);
    return items.reduce((total, item) => {
      return total + (item.food.kcal * item.quantity) / 100;
    }, 0);
  };

  // Get total calories for the day
  const getTotalCalories = () => {
    return dailyLog?.total_calories || 0;
  };

  // Get calorie goal from user profile
  const getCalorieGoal = () => {
    return userProfile?.macros?.calories || 2000;
  };

  // Calculate calories remaining
  const getCaloriesRemaining = () => {
    const consumed = getTotalCalories();
    const goal = getCalorieGoal();
    return goal - consumed;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center py-3 px-4 border-b border-border">
  <Pressable onPress={() => router.back()} className="p-2 mr-3">
    <Feather name="arrow-left" size={24} color={colors.foreground} />
  </Pressable>
  <Text className="text-lg font-semibold text-foreground flex-1">Rastreador de Alimentos</Text>
</View>

      <View className="flex-1">
        {/* Search Bar - Always visible at top */}
        <View className="px-4 py-2 border-b border-border">
          <View className="flex-row items-center bg-card rounded-lg border border-border px-3 py-2">
            <Feather name="search" size={20} color={colors.mutedForeground} />
            <TextInput
              className="ml-2 flex-1 text-foreground"
              placeholder="Pesquisar alimentos..."
              placeholderTextColor={colors.mutedForeground}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        {searchQuery.length >= 2 ? (
          // Search Results
          <View className="flex-1">
            {searchLoading ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={() => (
                  <View className="items-center py-8">
                    <Feather name="search" size={48} color={colors.mutedForeground} />
                    <Text className="text-muted-foreground mt-2">Nenhum resultado encontrado</Text>
                  </View>
                )}
                renderItem={({ item }) => (
                  <Pressable
                    className="bg-card px-4 py-3 border-b border-border"
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
            )}
          </View>
        ) : (
          // Daily Tracking View
          <ScrollView 
            className="flex-1" 
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Date Selector */}
            <View className="flex-row items-center justify-between px-4 py-3">
              <Pressable onPress={previousDay} className="p-2">
                <Feather name="chevron-left" size={24} color={colors.foreground} />
              </Pressable>

              <Pressable onPress={() => setDatePickerVisible(true)}>
                <Text className="text-lg font-medium text-foreground">{formatDate(selectedDate)}</Text>
              </Pressable>

              <Pressable onPress={nextDay} className="p-2">
                <Feather name="chevron-right" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            {/* Loading indicator */}
            {loading && !refreshing ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                {/* Daily Summary Card */}
                <View className="mx-4 mb-6 bg-card rounded-xl border border-border p-4">
                  <Text className="text-lg font-semibold text-foreground mb-3">Resumo do Dia</Text>
                  
                  <View className="flex-row">
                    {/* Consumed */}
                    <View className="flex-1 items-center">
                      <Text className="text-muted-foreground text-sm mb-1">Consumido</Text>
                      <Text className="text-2xl font-bold text-foreground">{Math.round(getTotalCalories())}</Text>
                      <Text className="text-xs text-muted-foreground">calorias</Text>
                    </View>
                    
                    {/* Divider */}
                    <View className="w-px bg-border mx-4" />
                    
                    {/* Goal */}
                    <View className="flex-1 items-center">
                      <Text className="text-muted-foreground text-sm mb-1">Meta</Text>
                      <Text className="text-2xl font-bold text-primary">{getCalorieGoal()}</Text>
                      <Text className="text-xs text-muted-foreground">calorias</Text>
                    </View>
                    
                    {/* Divider */}
                    <View className="w-px bg-border mx-4" />
                    
                    {/* Remaining */}
                    <View className="flex-1 items-center">
                      <Text className="text-muted-foreground text-sm mb-1">Restante</Text>
                      <Text 
                        className={`text-2xl font-bold ${
                          getCaloriesRemaining() >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {Math.round(getCaloriesRemaining())}
                      </Text>
                      <Text className="text-xs text-muted-foreground">calorias</Text>
                    </View>
                  </View>
                  
                  {/* Progress Bar */}
                  <View className="mt-4">
                    <View className="h-2 bg-muted rounded-full overflow-hidden">
                      <View 
                        className={`h-full rounded-full ${
                          getTotalCalories() <= getCalorieGoal() ? "bg-primary" : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(100, (getTotalCalories() / getCalorieGoal()) * 100)}%`
                        }}
                      />
                    </View>
                  </View>
                </View>

                {/* Meal Sections */}
                {dailyLog && (
                  <View className="px-4 pb-6">
                    {/* Breakfast */}
                    <MealSection
                      title="Café da Manhã"
                      icon="coffee"
                      iconColor="#3b82f6"
                      items={getMealItems("breakfast")}
                      calories={getMealCalories("breakfast")}
                      onAddFood={() => {
                        setSelectedMealType("breakfast");
                        setSearchQuery("");  // Clear search to show recent searches instead
                      }}
                      onRemoveFood={handleRemoveFood}
                      colors={colors}
                    />
                    
                    {/* Lunch */}
                    <MealSection
                      title="Almoço"
                      icon="sun"
                      iconColor="#eab308"
                      items={getMealItems("lunch")}
                      calories={getMealCalories("lunch")}
                      onAddFood={() => {
                        setSelectedMealType("lunch");
                        setSearchQuery("");  // Clear search to show recent searches instead
                      }}
                      onRemoveFood={handleRemoveFood}
                      colors={colors}
                    />
                    
                    {/* Dinner */}
                    <MealSection
                      title="Jantar"
                      icon="moon"
                      iconColor="#8b5cf6"
                      items={getMealItems("dinner")}
                      calories={getMealCalories("dinner")}
                      onAddFood={() => {
                        setSelectedMealType("dinner");
                        setSearchQuery("");  // Clear search to show recent searches instead
                      }}
                      onRemoveFood={handleRemoveFood}
                      colors={colors}
                    />
                    
                    {/* Snacks */}
                    <MealSection
                      title="Lanches"
                      icon="package"
                      iconColor="#ef4444"
                      items={getMealItems("snack")}
                      calories={getMealCalories("snack")}
                      onAddFood={() => {
                        setSelectedMealType("snack");
                        setSearchQuery("");  // Clear search to show recent searches instead
                      }}
                      onRemoveFood={handleRemoveFood}
                      colors={colors}
                    />
                    
                    {/* No meals placeholder */}
                    {dailyLog.items.length === 0 && (
                      <View className="bg-card rounded-xl border border-border p-8 items-center mt-2">
                        <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
                          <Feather name="clipboard" size={24} color={colors.mutedForeground} />
                        </View>
                        <Text className="text-lg font-medium mb-2 text-center text-foreground">
                          Nenhuma refeição registrada
                        </Text>
                        <Text className="text-muted-foreground text-center mb-4">
                          Adicione refeições para acompanhar seus macros diários
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Recent searches (show when search is empty) */}
                {searchQuery.length < 2 && recentSearches.length > 0 && (
                  <View className="px-4 pb-6">
                    <Text className="text-lg font-bold text-foreground mb-3">Pesquisas Recentes</Text>
                    {recentSearches.map((food) => (
                      <Pressable
                        key={food.id}
                        className="bg-card rounded-lg border border-border p-3 mb-2"
                        onPress={() => handleSelectFood(food)}
                      >
                        <Text className="text-foreground font-medium mb-1">{food.description}</Text>
                        <View className="flex-row justify-between">
                          <Text className="text-muted-foreground text-xs">{food.category}</Text>
                          <Text className="text-primary text-xs">{food.kcal} kcal/100g</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
                
                {/* Tip */}
                <View className="mx-4 mb-6 bg-accent rounded-xl p-6">
                  <Text className="text-lg font-semibold text-accent-foreground mb-2">Dica do Dia</Text>
                  <Text className="text-accent-foreground">
                    Para manter uma dieta equilibrada, tente consumir proteínas em todas as refeições.
                    Isso ajuda a controlar a fome e manter a massa muscular.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        )}
      </View>

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
              <View className="flex-row items-center mb-4">
                <TextInput
                  className="flex-1 border border-border bg-card text-foreground rounded-md px-3 py-2"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="100"
                  placeholderTextColor={colors.mutedForeground}
                />
                
                {/* Quick quantity buttons */}
                <View className="flex-row ml-2">
                  <Pressable 
                    className="bg-card border border-border rounded-md px-3 py-2 mr-1"
                    onPress={() => setQuantity("50")}
                  >
                    <Text className="text-foreground">50g</Text>
                  </Pressable>
                  <Pressable 
                    className="bg-card border border-border rounded-md px-3 py-2 mr-1"
                    onPress={() => setQuantity("100")}
                  >
                    <Text className="text-foreground">100g</Text>
                  </Pressable>
                  <Pressable 
                    className="bg-card border border-border rounded-md px-3 py-2"
                    onPress={() => setQuantity("200")}
                  >
                    <Text className="text-foreground">200g</Text>
                  </Pressable>
                </View>
              </View>

              <Text className="font-medium text-foreground mb-2">Refeição</Text>
              <View className="flex-row mb-3">
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

// MealSection Component for displaying meal groups
interface MealSectionProps {
  title: string;
  icon: string;
  iconColor: string;
  items: FoodPortion[];
  calories: number;
  onAddFood: () => void;
  onRemoveFood: (index: number) => void;
  colors: any;
}

function MealSection({ title, icon, iconColor, items, calories, onAddFood, onRemoveFood, colors }: MealSectionProps) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <View className="mb-4">
      <View className="bg-card rounded-t-xl border border-border p-3">
        <Pressable 
          className="flex-row items-center justify-between"
          onPress={() => setExpanded(!expanded)}
        >
          <View className="flex-row items-center">
            <View 
              className="w-8 h-8 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <Feather name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-lg font-medium text-foreground">{title}</Text>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-foreground font-medium mr-2">
              {calories > 0 ? `${Math.round(calories)} kcal` : "-"}
            </Text>
            <Pressable 
              className="bg-primary/10 w-8 h-8 rounded-full items-center justify-center mr-2"
              onPress={onAddFood}
            >
              <Feather name="plus" size={18} color={colors.primary} />
            </Pressable>
            <Feather 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.mutedForeground} 
            />
          </View>
        </Pressable>
      </View>
      
      {expanded && items.length > 0 && (
        <View className="bg-card rounded-b-xl border-b border-l border-r border-border">
          {items.map((item, index) => (
            <View key={index} className="px-3 py-3 border-t border-border">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-foreground font-medium mb-1">{item.food.description}</Text>
                  <Text className="text-muted-foreground text-xs">{item.quantity}g</Text>
                </View>
                <View className="items-end">
                <Text className="text-foreground">{Math.round((item.food.kcal * item.quantity) / 100)} kcal</Text>
                  <View className="flex-row mt-1">
                    <Text className="text-xs text-purple-500 mr-2">
                      P: {Math.round((item.food.protein_g * item.quantity) / 100)}g
                    </Text>
                    <Text className="text-xs text-yellow-500 mr-2">
                      C: {Math.round((item.food.carbs_g * item.quantity) / 100)}g
                    </Text>
                    <Text className="text-xs text-red-500">
                      G: {Math.round((item.food.fat_g * item.quantity) / 100)}g
                    </Text>
                  </View>
                </View>
                <Pressable
                  className="ml-2 p-2"
                  onPress={() => {
                    Alert.alert("Remover item", "Tem certeza que deseja remover este item?", [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Remover", onPress: () => onRemoveFood(index), style: "destructive" },
                    ]);
                  }}
                >
                  <Feather name="trash-2" size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
      
      {expanded && items.length === 0 && (
        <View className="bg-card rounded-b-xl border-b border-l border-r border-border p-4 items-center">
          <Text className="text-muted-foreground">
            Ainda não há alimentos registrados para esta refeição
          </Text>
          <Pressable 
            className="mt-2 flex-row items-center" 
            onPress={onAddFood}
          >
            <Feather name="plus" size={16} color={colors.primary} />
            <Text className="text-primary ml-1">Adicionar alimento</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
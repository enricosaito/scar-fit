// app/screens/food-tracker.tsx (updated with better styling)
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
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Food, FoodPortion, searchFoods } from "../models/food";
import { DailyLog, addFoodToLog, getUserDailyLog } from "../models/tracking";
import Button from "../components/ui/Button";

// MacroTag Component
const MacroTag = ({
  value,
  color,
  label,
  textColor = "white",
}: {
  value: string | number;
  color: string;
  label: string;
  textColor?: string;
}) => {
  return (
    <View
      className="rounded-md px-2 py-0.5 mr-2 flex-row items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <Text className="text-xs font-medium" style={{ color: textColor }}>
        {value}g {label}
      </Text>
    </View>
  );
};

// Calorie Tag Component
const CalorieTag = ({ calories }: { calories: number }) => {
  return (
    <View
      className="rounded-md px-2 py-0.5 mr-2 flex-row items-center justify-center"
      style={{ backgroundColor: "#3b82f680" }}
    >
      <Text className="text-xs font-medium text-white">{calories} kcal</Text>
    </View>
  );
};

export default function FoodTracker() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Food[]>([]);

  // Add food state
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [addFoodVisible, setAddFoodVisible] = useState(false);
  const [quantity, setQuantity] = useState("100");
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");

  // Daily log for today (needed for adding food)
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(false);

  // Macro tag colors - softer, more modern palette
  const macroColors = {
    protein: "#9333ea80", // Softer purple with transparency
    carbs: "#ca8a0480", // Softer amber with transparency
    fat: "#dc262680", // Softer red with transparency
  };

  // Common foods by category
  const commonFoodCategories = [
    {
      name: "Proteínas",
      icon: "award",
      foods: [
        { id: "c1", name: "Frango Grelhado" },
        { id: "c2", name: "Ovos" },
        { id: "c3", name: "Atum" },
        { id: "c4", name: "Iogurte Grego" },
      ],
    },
    {
      name: "Carboidratos",
      icon: "pie-chart",
      foods: [
        { id: "c5", name: "Arroz" },
        { id: "c6", name: "Batata" },
        { id: "c7", name: "Pão Integral" },
        { id: "c8", name: "Aveia" },
      ],
    },
    {
      name: "Frutas",
      icon: "gift",
      foods: [
        { id: "c9", name: "Banana" },
        { id: "c10", name: "Maçã" },
        { id: "c11", name: "Laranja" },
        { id: "c12", name: "Morango" },
      ],
    },
    {
      name: "Vegetais",
      icon: "shopping-bag",
      foods: [
        { id: "c13", name: "Brócolis" },
        { id: "c14", name: "Cenoura" },
        { id: "c15", name: "Espinafre" },
        { id: "c16", name: "Tomate" },
      ],
    },
  ];

  // Load daily log for today
  const loadDailyLog = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const log = await getUserDailyLog(user.id, today);
      setDailyLog(log);
    } catch (error) {
      console.error("Error loading daily log:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadDailyLog();
    // Could load recent searches from storage here
  }, [user]);

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
    if (!recentSearches.some((item) => item.id === food.id)) {
      setRecentSearches((prev) => [food, ...prev].slice(0, 5));
    }
  };

  // Add the selected food to the daily log
  const handleAddFood = async () => {
    if (!user || !selectedFood || !dailyLog) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const quantityNum = parseFloat(quantity);

      if (isNaN(quantityNum) || quantityNum <= 0) {
        Alert.alert("Erro", "Por favor insira uma quantidade válida maior que zero.");
        return;
      }

      const foodPortion: FoodPortion = {
        food: selectedFood,
        quantity: quantityNum,
        meal_type: selectedMealType,
        date: today,
      };

      const updatedLog = await addFoodToLog(user.id, today, foodPortion);
      setDailyLog(updatedLog);
      setAddFoodVisible(false);
      setSelectedFood(null);
      setQuantity("100");

      // Show toast notification instead of alert
      showToast(`${selectedFood.description} adicionado ao diário`, "success");
    } catch (error) {
      console.error("Error adding food:", error);
      Alert.alert("Erro", "Ocorreu um erro ao adicionar o alimento.");
    }
  };

  // Quick search by common food name
  const handleQuickSearch = (foodName: string) => {
    setSearchQuery(foodName);
    handleSearch(foodName);
  };

  // Render a food item in search results
  const renderFoodItem = (item: Food) => {
    return (
      <Pressable className="bg-card rounded-lg border border-border p-3 mb-3" onPress={() => handleSelectFood(item)}>
        <Text className="text-foreground font-medium mb-1">{item.description}</Text>
        <Text className="text-muted-foreground text-xs mb-2">{item.category}</Text>

        {/* Macro tags row */}
        <View className="flex-row flex-wrap">
          <CalorieTag calories={item.kcal} />
          <MacroTag value={item.protein_g} color={macroColors.protein} label="prot." />
          <MacroTag value={item.carbs_g} color={macroColors.carbs} label="carb." />
          <MacroTag value={item.fat_g} color={macroColors.fat} label="gord." />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center py-3 px-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2 mr-3">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground flex-1">Adicionar Alimentos</Text>
      </View>

      {/* Search Bar - Always visible at top */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-card rounded-lg border border-border px-3 py-3">
          <Feather name="search" size={20} color={colors.mutedForeground} />
          <TextInput
            className="ml-2 flex-1 text-foreground"
            placeholder="Procurar alimentos..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={false}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Main Content */}
      {searchQuery.length >= 2 ? (
        // Search Results with improved styling
        <View className="flex-1 px-4 py-2">
          {searchLoading ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => renderFoodItem(item)}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              ) : (
                <View className="items-center py-8">
                  <Feather name="search" size={48} color={colors.mutedForeground} />
                  <Text className="text-muted-foreground mt-2">Nenhum resultado encontrado</Text>
                </View>
              )}
            </>
          )}
        </View>
      ) : (
        // Common Foods and Categories
        <ScrollView className="flex-1 px-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">Pesquisas Recentes</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recentSearches.map((food) => (
                  <Pressable
                    key={food.id}
                    className="bg-card rounded-lg border border-border p-3 mr-3 min-w-[150px]"
                    onPress={() => handleSelectFood(food)}
                  >
                    <Text className="text-foreground font-medium mb-1" numberOfLines={1}>
                      {food.description}
                    </Text>
                    <Text className="text-primary text-xs">{food.kcal} kcal/100g</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Common Foods Categories */}
          {commonFoodCategories.map((category, index) => (
            <View key={index} className="mb-6">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
                  <Feather name={category.icon as keyof typeof Feather.glyphMap} size={18} color={colors.primary} />
                </View>
                <Text className="text-lg font-bold text-foreground">{category.name}</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {category.foods.map((food) => (
                  <Pressable
                    key={food.id}
                    className="bg-card rounded-lg border border-border py-3 px-4 mr-3"
                    onPress={() => handleQuickSearch(food.name)}
                  >
                    <Text className="text-foreground">{food.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ))}

          {/* Quick Search Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Pesquisa Rápida</Text>
            <View className="flex-row flex-wrap">
              <Pressable
                className="bg-card rounded-lg border border-border py-2 px-4 mr-2 mb-2"
                onPress={() => handleQuickSearch("Arroz")}
              >
                <Text className="text-foreground">Arroz</Text>
              </Pressable>
              <Pressable
                className="bg-card rounded-lg border border-border py-2 px-4 mr-2 mb-2"
                onPress={() => handleQuickSearch("Feijão")}
              >
                <Text className="text-foreground">Feijão</Text>
              </Pressable>
              <Pressable
                className="bg-card rounded-lg border border-border py-2 px-4 mr-2 mb-2"
                onPress={() => handleQuickSearch("Frango")}
              >
                <Text className="text-foreground">Frango</Text>
              </Pressable>
              <Pressable
                className="bg-card rounded-lg border border-border py-2 px-4 mr-2 mb-2"
                onPress={() => handleQuickSearch("Pão")}
              >
                <Text className="text-foreground">Pão</Text>
              </Pressable>
              <Pressable
                className="bg-card rounded-lg border border-border py-2 px-4 mr-2 mb-2"
                onPress={() => handleQuickSearch("Ovo")}
              >
                <Text className="text-foreground">Ovo</Text>
              </Pressable>
              <Pressable
                className="bg-card rounded-lg border border-border py-2 px-4 mr-2 mb-2"
                onPress={() => handleQuickSearch("Leite")}
              >
                <Text className="text-foreground">Leite</Text>
              </Pressable>
            </View>
          </View>

          {/* Tip */}
          <View className="mb-6 bg-accent rounded-xl p-6">
            <Text className="text-lg font-semibold text-accent-foreground mb-2">Dica do Dia</Text>
            <Text className="text-accent-foreground">
              Prefira alimentos não processados e ricos em nutrientes para uma dieta balanceada e saudável.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Add Food Modal - Simplified & Better Styled */}
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
              {/* Food details - simplified header */}
              <View className="bg-card rounded-xl border border-border p-4 mb-6">
                <Text className="text-xl font-medium text-foreground mb-1">{selectedFood.description}</Text>
                <Text className="text-muted-foreground mb-2">{selectedFood.category}</Text>

                {/* Macro tags for per 100g */}
                <View className="flex-row flex-wrap mt-2">
                  <CalorieTag calories={selectedFood.kcal} />
                  <MacroTag value={selectedFood.protein_g} color={macroColors.protein} label="prot." />
                  <MacroTag value={selectedFood.carbs_g} color={macroColors.carbs} label="carb." />
                  <MacroTag value={selectedFood.fat_g} color={macroColors.fat} label="gord." />
                </View>
                <Text className="text-xs text-muted-foreground mt-2">Valores por 100g</Text>
              </View>

              {/* Quantity selection */}
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

              {/* Meal type selection */}
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

              {/* Preview - Simplified with "<quantity>g de <food>" format */}
              <View className="bg-card rounded-xl border border-border p-4 mb-6">
                <Text className="font-medium text-foreground mb-2">Você está adicionando:</Text>

                {/* Display format: "<quantity>g de <food>" */}
                <Text className="text-foreground text-lg mb-3">
                  <Text className="text-muted-foreground">{quantity}g de </Text>
                  {selectedFood.description}
                </Text>

                {/* Macro tags for selected quantity */}
                <View className="flex-row flex-wrap">
                  <CalorieTag calories={Math.round((selectedFood.kcal * parseFloat(quantity || "0")) / 100)} />

                  <MacroTag
                    value={Math.round((selectedFood.protein_g * parseFloat(quantity || "0")) / 100)}
                    color={macroColors.protein}
                    label="prot."
                  />

                  <MacroTag
                    value={Math.round((selectedFood.carbs_g * parseFloat(quantity || "0")) / 100)}
                    color={macroColors.carbs}
                    label="carb."
                  />

                  <MacroTag
                    value={Math.round((selectedFood.fat_g * parseFloat(quantity || "0")) / 100)}
                    color={macroColors.fat}
                    label="gord."
                  />
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

// app/screens/add-food-search.tsx
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Food, FoodPortion, searchFoods } from "../models/food";
import { DailyLog, addFoodToLog, getUserDailyLog } from "../models/tracking";
import Button from "../components/ui/Button";
import { getFoodEmoji } from "../utils/foodEmojis";
import { FoodCard } from "../components/food/FoodCard";
import { MealTypeSelector } from "../components/food/MealTypeSelector";
import { QuantityInput } from "../components/food/QuantityInput";

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
  const [isSearching, setIsSearching] = useState(false);

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
  }, [user]);

  // Handle food search with debounce
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchFoods(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching foods:", error);
      showToast("Erro ao pesquisar alimentos", "error");
    } finally {
      setSearchLoading(false);
      setIsSearching(false);
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header with improved styling */}
      <View className="flex-row items-center py-4 px-4 border-b border-border bg-card">
        <Pressable onPress={() => router.back()} className="p-2 mr-3 rounded-full bg-background">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-xl font-bold text-foreground flex-1">Adicionar Alimentos</Text>
      </View>

      {/* Search Bar with improved styling */}
      <View className="px-4 py-3 bg-background">
        <View className="flex-row items-center bg-card rounded-xl border border-border px-4 py-3 shadow-sm">
          <Feather name="search" size={20} color={colors.mutedForeground} />
          <TextInput
            className="ml-3 flex-1 text-foreground text-base"
            placeholder="Procurar alimentos..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="p-2 rounded-full bg-background"
            >
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Main Content */}
      {isSearching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted-foreground mt-4">Pesquisando alimentos...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              className="bg-card rounded-xl border border-border p-4 mb-3 mx-4 shadow-sm"
              onPress={() => handleSelectFood(item)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Text className="text-2xl mr-3">{getFoodEmoji(item.description)}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-lg font-semibold text-foreground flex-1">{item.description}</Text>
                      <View className="bg-primary/10 rounded-full px-2 py-1">
                        <Text className="text-primary font-medium">{item.kcal} kcal</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-muted-foreground text-sm">{item.category}</Text>
                      <View className="ml-2 bg-primary/10 rounded-full px-2 py-0.5 flex-row items-center">
                        <MaterialCommunityIcons name="shield-check" size={12} color={colors.primary} />
                        <Text className="text-primary text-xs ml-1">TACO</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      ) : (
        <FlatList
          data={commonFoodCategories}
          keyExtractor={(item) => item.name}
          renderItem={({ item: category }) => (
            <View className="mb-6 px-4">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Text className="text-2xl">{getFoodEmoji(category.name)}</Text>
                </View>
                <Text className="text-xl font-bold text-foreground">{category.name}</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                {category.foods.map((food) => (
                  <Pressable
                    key={food.id}
                    className="bg-card rounded-xl border border-border py-3 px-4 mr-3 shadow-sm"
                    onPress={() => handleQuickSearch(food.name)}
                  >
                    <Text className="text-foreground font-medium">{food.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          ListHeaderComponent={
            recentSearches.length > 0 ? (
              <View className="mb-6 px-4">
                <Text className="text-lg font-bold text-foreground mb-4">Pesquisas Recentes</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                >
                  {recentSearches.map((food) => (
                    <Pressable
                      key={food.id}
                      className="bg-card rounded-xl border border-border p-4 mr-3 min-w-[180px] shadow-sm"
                      onPress={() => handleSelectFood(food)}
                    >
                      <View className="flex-row items-center">
                        <Text className="text-2xl mr-2">{getFoodEmoji(food.description)}</Text>
                        <View className="flex-1">
                          <Text className="text-foreground font-semibold mb-1" numberOfLines={1}>
                            {food.description}
                          </Text>
                          <View className="flex-row items-center">
                            <View className="bg-primary/10 rounded-full px-2 py-0.5 flex-row items-center">
                              <MaterialCommunityIcons name="shield-check" size={12} color={colors.primary} />
                              <Text className="text-primary text-xs ml-1">TACO</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      {/* Add Food Modal */}
      <Modal
        visible={addFoodVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddFoodVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center py-4 px-4 border-b border-border bg-card">
            <Pressable onPress={() => setAddFoodVisible(false)} className="p-2 mr-3 rounded-full bg-background">
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
            <Text className="text-xl font-bold text-foreground flex-1">Adicionar Alimento</Text>
          </View>

          {selectedFood && (
            <ScrollView className="p-4">
              {/* Food details */}
              <FoodCard food={selectedFood} quantity={parseFloat(quantity) || 100} />

              {/* Quantity selection */}
              <Text className="font-semibold text-foreground mb-2 mt-4">Quantidade (g)</Text>
              <QuantityInput quantity={quantity} onQuantityChange={setQuantity} />

              {/* Meal type selection */}
              <MealTypeSelector selectedMealType={selectedMealType} onSelectMealType={setSelectedMealType} />

              {/* Add button */}
              <Button onPress={handleAddFood} className="bg-primary rounded-xl py-4 mt-4">
                <Text className="text-white font-bold text-lg">Adicionar Alimento</Text>
              </Button>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

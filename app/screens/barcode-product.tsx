// app/screens/barcode-product.tsx
import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, Pressable, ActivityIndicator, Image, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import { fetchProductByBarcode, Product } from "../lib/openFoodFactsApi";
import { addFoodToLog } from "../models/tracking";
import { Food } from "../models/food";

// Components for displaying macros with consistent styling
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

export default function BarcodeProductScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("snack");
  const [addingToLog, setAddingToLog] = useState(false);

  // Macro tag colors
  const macroColors = {
    protein: "#9333ea80", // Purple with transparency
    carbs: "#ca8a0480", // Amber with transparency
    fat: "#dc262680", // Red with transparency
  };

  useEffect(() => {
    loadProductInfo();
  }, [barcode]);

  const loadProductInfo = async () => {
    if (!barcode) {
      setError("Código de barras inválido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const productData = await fetchProductByBarcode(barcode as string);
      setProduct(productData);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Produto não encontrado ou erro na busca. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLog = async () => {
    if (!user || !product) return;

    try {
      setAddingToLog(true);

      // Convert OpenFoodFacts product to our app's Food format
      const food: Food = {
        id: parseInt(barcode as string) || 0,
        description: product.product_name || "Produto Desconhecido",
        category: product.categories || "Outros",
        kcal: product.nutriments.energy_kcal || 0,
        protein_g: product.nutriments.proteins || 0,
        carbs_g: product.nutriments.carbohydrates || 0,
        fat_g: product.nutriments.fat || 0,
      };

      const today = new Date().toISOString().split("T")[0];
      const quantityNum = parseFloat(quantity);

      if (isNaN(quantityNum) || quantityNum <= 0) {
        Alert.alert("Erro", "Por favor, insira uma quantidade válida maior que zero.");
        setAddingToLog(false);
        return;
      }

      await addFoodToLog(user.id, today, {
        food,
        quantity: quantityNum,
        meal_type: selectedMealType,
        date: today,
      });

      // Show toast and navigate to dashboard
      showToast(`${food.description} adicionado ao diário`, "success");
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Error adding food to log:", err);
      Alert.alert("Erro", "Ocorreu um erro ao adicionar o alimento ao diário.");
    } finally {
      setAddingToLog(false);
    }
  };

  const handleScanAgain = () => {
    router.replace("/screens/barcode-scanner");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Detalhes do Produto</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-foreground mt-4">Carregando informações do produto...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center p-6">
          <Feather name="alert-circle" size={60} color={colors.mutedForeground} />
          <Text className="text-foreground text-lg font-medium mt-4 mb-2 text-center">Produto não encontrado</Text>
          <Text className="text-muted-foreground text-center mb-6">{error}</Text>
          <Button className="mb-4" onPress={handleScanAgain}>
            Escanear Novamente
          </Button>
          <Button variant="outline" onPress={() => router.push("/screens/add-food-search")}>
            Buscar Manualmente
          </Button>
        </View>
      ) : product ? (
        <ScrollView className="flex-1 p-4">
          {/* Product info */}
          <View className="bg-card rounded-lg border border-border p-4 mb-6">
            <View className="flex-row mb-4">
              {product.image_url ? (
                <Image source={{ uri: product.image_url }} className="w-24 h-24 rounded-md mr-4" resizeMode="contain" />
              ) : (
                <View className="w-24 h-24 bg-muted rounded-md mr-4 items-center justify-center">
                  <Feather name="image" size={24} color={colors.mutedForeground} />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-xl font-semibold text-foreground">
                  {product.product_name || "Produto Desconhecido"}
                </Text>
                <Text className="text-muted-foreground mb-2">{product.brands || "Marca desconhecida"}</Text>
                <Text className="text-xs text-muted-foreground">{barcode}</Text>
              </View>
            </View>

            {/* Nutrition info per 100g */}
            <View className="border-t border-border pt-3">
              <Text className="text-foreground font-medium mb-2">Informação Nutricional (por 100g)</Text>
              <View className="flex-row flex-wrap">
                <CalorieTag calories={product.nutriments.energy_kcal || 0} />
                <MacroTag value={product.nutriments.proteins || 0} color={macroColors.protein} label="prot." />
                <MacroTag value={product.nutriments.carbohydrates || 0} color={macroColors.carbs} label="carb." />
                <MacroTag value={product.nutriments.fat || 0} color={macroColors.fat} label="gord." />
              </View>
            </View>
          </View>

          {/* Add to diary form */}
          <View className="bg-card rounded-lg border border-border p-4 mb-6">
            <Text className="text-foreground font-medium mb-4">Adicionar ao Diário</Text>

            {/* Quantity */}
            <View className="mb-4">
              <Text className="text-foreground text-sm mb-2">Quantidade (g)</Text>
              <View className="flex-row">
                <Pressable
                  className="bg-muted px-3 py-2 rounded-l-md"
                  onPress={() => setQuantity((prev) => Math.max(1, parseInt(prev) - 10).toString())}
                >
                  <Feather name="minus" size={20} color={colors.foreground} />
                </Pressable>
                <View className="flex-1 bg-card border-t border-b border-border">
                  <Text className="text-center text-foreground py-2">{quantity}g</Text>
                </View>
                <Pressable
                  className="bg-muted px-3 py-2 rounded-r-md"
                  onPress={() => setQuantity((prev) => (parseInt(prev) + 10).toString())}
                >
                  <Feather name="plus" size={20} color={colors.foreground} />
                </Pressable>
              </View>
              <View className="flex-row justify-center mt-2">
                <Pressable className="bg-muted mx-1 px-3 py-1 rounded-md" onPress={() => setQuantity("50")}>
                  <Text className="text-foreground">50g</Text>
                </Pressable>
                <Pressable className="bg-muted mx-1 px-3 py-1 rounded-md" onPress={() => setQuantity("100")}>
                  <Text className="text-foreground">100g</Text>
                </Pressable>
                <Pressable className="bg-muted mx-1 px-3 py-1 rounded-md" onPress={() => setQuantity("200")}>
                  <Text className="text-foreground">200g</Text>
                </Pressable>
              </View>
            </View>

            {/* Meal type */}
            <Text className="text-foreground text-sm mb-2">Refeição</Text>
            <View className="flex-row mb-3">
              <Pressable
                onPress={() => setSelectedMealType("breakfast")}
                className={`flex-1 py-2 px-3 rounded-md mr-2 ${
                  selectedMealType === "breakfast" ? "bg-primary" : "bg-muted"
                }`}
              >
                <Text
                  className={
                    selectedMealType === "breakfast" ? "text-white text-center" : "text-foreground text-center"
                  }
                >
                  Café
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedMealType("lunch")}
                className={`flex-1 py-2 px-3 rounded-md ${selectedMealType === "lunch" ? "bg-primary" : "bg-muted"}`}
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
                  selectedMealType === "dinner" ? "bg-primary" : "bg-muted"
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
                className={`flex-1 py-2 px-3 rounded-md ${selectedMealType === "snack" ? "bg-primary" : "bg-muted"}`}
              >
                <Text
                  className={selectedMealType === "snack" ? "text-white text-center" : "text-foreground text-center"}
                >
                  Lanche
                </Text>
              </Pressable>
            </View>

            {/* Add button */}
            <Button onPress={handleAddToLog} disabled={addingToLog}>
              {addingToLog ? <ActivityIndicator size="small" color="white" /> : "Adicionar ao Diário"}
            </Button>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

import React from "react";
import { View, Text, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { MacroTag } from "./MacroTag";
import { CalorieTag } from "./CalorieTag";
import { Food } from "../../models/food";

interface FoodCardProps {
  food: Food;
  showMacros?: boolean;
  onPress?: () => void;
}

/**
 * A reusable component for displaying food information
 * @param food - The food object to display
 * @param showMacros - Whether to show macro nutrient information
 * @param onPress - Optional callback when the card is pressed
 */
export const FoodCard: React.FC<FoodCardProps> = ({ food, showMacros = true, onPress }) => {
  const { colors } = useTheme();

  const macroColors = {
    protein: "#9333ea80",
    carbs: "#ca8a0480",
    fat: "#dc262680",
  };

  return (
    <View className="bg-card rounded-lg border border-border p-4 mb-6" onTouchEnd={onPress}>
      <View className="flex-row mb-4">
        <View className="w-24 h-24 bg-muted rounded-md mr-4 items-center justify-center">
          <Feather name="image" size={24} color={colors.mutedForeground} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-semibold text-foreground">{food.description}</Text>
          <Text className="text-muted-foreground mb-2">{food.category}</Text>
        </View>
      </View>

      {showMacros && (
        <View className="border-t border-border pt-3">
          <Text className="text-foreground font-medium mb-2">Informação Nutricional (por 100g)</Text>
          <View className="flex-row flex-wrap">
            <CalorieTag calories={food.kcal} />
            <MacroTag value={food.protein_g} color={macroColors.protein} label="prot." />
            <MacroTag value={food.carbs_g} color={macroColors.carbs} label="carb." />
            <MacroTag value={food.fat_g} color={macroColors.fat} label="gord." />
          </View>
        </View>
      )}
    </View>
  );
};

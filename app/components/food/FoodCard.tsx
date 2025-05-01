import React from "react";
import { View, Text, Image } from "react-native";
import { Food } from "../../models/food";
import { getFoodEmoji } from "../../utils/foodEmojis";

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

interface FoodCardProps {
  food: Food;
  showMacros?: boolean;
  quantity?: number;
  imageUrl?: string;
  isBarcode?: boolean;
}

/**
 * A reusable component for displaying food information
 * @param food - The food object to display
 * @param showMacros - Whether to show macro nutrient information
 * @param quantity - The quantity of the food to display (default is 100g)
 * @param imageUrl - Optional URL for the food image (used for barcode products)
 * @param isBarcode - Whether this is a barcode product (affects display style)
 */
export function FoodCard({ food, showMacros = true, quantity = 100, imageUrl, isBarcode = false }: FoodCardProps) {
  // Macro tag colors - softer, more modern palette
  const macroColors = {
    protein: "#9333ea80", // Softer purple with transparency
    carbs: "#ca8a0480", // Softer amber with transparency
    fat: "#dc262680", // Softer red with transparency
  };

  const calculateValue = (value: number) => {
    return Math.round((value * quantity) / 100);
  };

  return (
    <View className="bg-card rounded-xl border border-border p-4">
      <View className="flex-row items-center">
        {isBarcode && imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-16 h-16 rounded-md mr-3" resizeMode="contain" />
        ) : (
          <Text className="text-3xl mr-3">{getFoodEmoji(food.description)}</Text>
        )}
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">{food.description}</Text>
          <Text className="text-muted-foreground text-sm">{food.category}</Text>
        </View>
      </View>
      {showMacros && (
        <View className="mt-3 flex-row flex-wrap">
          <CalorieTag calories={calculateValue(food.kcal)} />
          <MacroTag value={calculateValue(food.protein_g)} color={macroColors.protein} label="prot." />
          <MacroTag value={calculateValue(food.carbs_g)} color={macroColors.carbs} label="carb." />
          <MacroTag value={calculateValue(food.fat_g)} color={macroColors.fat} label="gord." />
        </View>
      )}
    </View>
  );
}

export default FoodCard;

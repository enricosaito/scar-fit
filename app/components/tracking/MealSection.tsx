// Updated MealSection.tsx with labeled macro tags
import React from "react";
import { Text, View, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FoodPortion } from "../../models/food";

// New MacroTag component with labels
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

// Calorie Tag component
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

interface MealSectionProps {
  title: string;
  icon: string;
  items: FoodPortion[];
  colors: any;
  onRemove: (index: number) => void;
}

export default function MealSection({ title, icon, items, colors, onRemove }: MealSectionProps) {
  if (!items || items.length === 0) return null;

  // Macro tag colors - softer, more modern palette
  const macroColors = {
    protein: "#9333ea80", // Softer purple with transparency
    carbs: "#ca8a0480", // Softer amber with transparency
    fat: "#dc262680", // Softer red with transparency
  };

  return (
    <View className="bg-card rounded-xl border border-border p-4 mb-4">
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
          <Feather name={icon as keyof typeof Feather.glyphMap} size={16} color={colors.primary} />
        </View>
        <Text className="text-lg font-medium text-foreground">{title}</Text>
      </View>

      {items.map((item, index) => (
        <View key={index} className="py-3 border-t border-border">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              {/* Rearranged food description with quantity at the beginning */}
              <Text className="text-foreground font-medium mb-1">
                <Text className="text-muted-foreground font-normal">{item.quantity}g de </Text>
                {item.food.description}
              </Text>

              {/* Updated macro tags with labels */}
              <View className="flex-row flex-wrap mt-1.5">
                <CalorieTag calories={Math.round((item.food.kcal * item.quantity) / 100)} />

                <MacroTag
                  value={Math.round((item.food.protein_g * item.quantity) / 100)}
                  color={macroColors.protein}
                  label="prot."
                />
                <MacroTag
                  value={Math.round((item.food.carbs_g * item.quantity) / 100)}
                  color={macroColors.carbs}
                  label="carb."
                />
                <MacroTag
                  value={Math.round((item.food.fat_g * item.quantity) / 100)}
                  color={macroColors.fat}
                  label="gord."
                />
              </View>
            </View>

            <Pressable
              className="ml-2 p-2"
              onPress={() => {
                Alert.alert("Remover item", "Tem certeza que deseja remover este item?", [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Remover", onPress: () => onRemove(index), style: "destructive" },
                ]);
              }}
            >
              <Feather name="trash-2" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

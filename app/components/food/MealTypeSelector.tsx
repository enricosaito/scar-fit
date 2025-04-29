import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface MealTypeSelectorProps {
  selectedMealType: MealType;
  onSelectMealType: (mealType: MealType) => void;
}

/**
 * A reusable component for selecting meal types
 * @param selectedMealType - The currently selected meal type
 * @param onSelectMealType - Callback function when a meal type is selected
 */
export const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({ selectedMealType, onSelectMealType }) => {
  const { colors } = useTheme();

  const mealTypes: { type: MealType; label: string }[] = [
    { type: "breakfast", label: "Café" },
    { type: "lunch", label: "Almoço" },
    { type: "dinner", label: "Jantar" },
    { type: "snack", label: "Lanche" },
  ];

  return (
    <View className="mb-6">
      <Text className="text-foreground text-sm mb-2">Refeição</Text>
      <View className="flex-row flex-wrap">
        {mealTypes.map((meal) => (
          <Pressable
            key={meal.type}
            onPress={() => onSelectMealType(meal.type)}
            className={`flex-1 py-2 px-3 rounded-md mr-2 mb-2 ${
              selectedMealType === meal.type ? "bg-primary" : "bg-muted"
            }`}
          >
            <Text className={`text-center ${selectedMealType === meal.type ? "text-white" : "text-foreground"}`}>
              {meal.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

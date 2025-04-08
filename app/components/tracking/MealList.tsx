// app/components/MealList.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";
import { FoodPortion } from "../../models/food";

interface MealListProps {
  meals: {
    type: "breakfast" | "lunch" | "dinner" | "snack";
    title: string;
    items: FoodPortion[];
    icon: string;
    time?: string;
  }[];
}

export default function MealList({ meals }: MealListProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const getIconColor = (type: string) => {
    switch (type) {
      case "breakfast":
        return "#3b82f6"; // blue
      case "lunch":
        return "#eab308"; // yellow
      case "dinner":
        return "#8b5cf6"; // purple
      case "snack":
        return "#ef4444"; // red
      default:
        return colors.primary;
    }
  };

  const getMealTotalCalories = (items: FoodPortion[]) => {
    return items.reduce((total, item) => {
      return total + (item.food.kcal * item.quantity) / 100;
    }, 0);
  };

  const navigateToTracking = () => {
    router.push("/tracking");
  };

  if (meals.length === 0 || meals.every((meal) => meal.items.length === 0)) {
    return (
      <View className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm">
        <View className="items-center">
          <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
            <Feather name="coffee" size={24} color={colors.mutedForeground} />
          </View>
          <Text className="text-lg font-medium mb-2 text-center text-foreground">Nenhuma refeição registrada</Text>
          <Text className="text-muted-foreground text-center mb-4">
            Adicione suas refeições para acompanhar seus macros diários
          </Text>
          <Pressable
            className="flex-row items-center bg-primary px-4 py-2.5 rounded-lg"
            onPress={() =>
              router.push({
                pathname: "/tracking",
                params: { showSearch: "true" },
              })
            }
          >
            <Feather name="plus" size={16} color="white" />
            <Text className="text-white ml-2 font-medium">Adicionar Refeição</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      {meals.map((meal, index) => {
        if (meal.items.length === 0) return null;

        return (
          <Pressable
            key={index}
            className="bg-card rounded-xl border border-border p-4 mb-3 shadow-sm"
            onPress={navigateToTracking}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${getIconColor(meal.type)}20` }}
              >
                <Feather name={meal.icon} size={20} color={getIconColor(meal.type)} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-medium text-base">{meal.title}</Text>
                {meal.time && (
                  <View className="flex-row items-center">
                    <Feather name="clock" size={12} color={colors.mutedForeground} className="mr-1" />
                    <Text className="text-muted-foreground text-xs">{meal.time}</Text>
                  </View>
                )}
              </View>
              <View className="items-end">
                <Text className="text-foreground font-medium">{Math.round(getMealTotalCalories(meal.items))} kcal</Text>
                <Text className="text-xs text-muted-foreground">
                  {meal.items.length} {meal.items.length === 1 ? "item" : "itens"}
                </Text>
              </View>
            </View>

            {/* Show up to 3 food items */}
            {meal.items.slice(0, 3).map((item, idx) => (
              <View key={idx} className="flex-row items-center py-2.5 border-t border-border">
                <View className="flex-1">
                  <Text className="text-foreground">{item.food.description}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-muted-foreground text-xs">{item.quantity}g</Text>
                    <View className="flex-row ml-2">
                      <Text className="text-xs text-purple-500 mr-1.5">
                        P:{Math.round((item.food.protein_g * item.quantity) / 100)}g
                      </Text>
                      <Text className="text-xs text-yellow-500 mr-1.5">
                        C:{Math.round((item.food.carbs_g * item.quantity) / 100)}g
                      </Text>
                      <Text className="text-xs text-red-500">
                        G:{Math.round((item.food.fat_g * item.quantity) / 100)}g
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-foreground">{Math.round((item.food.kcal * item.quantity) / 100)} kcal</Text>
              </View>
            ))}

            {/* Show "Ver mais" if there are more than 3 items */}
            {meal.items.length > 3 && (
              <Pressable className="pt-2.5 items-center border-t border-border" onPress={navigateToTracking}>
                <View className="flex-row items-center">
                  <Text className="text-primary mr-1">Ver mais ({meal.items.length - 3})</Text>
                  <Feather name="chevron-right" size={16} color={colors.primary} />
                </View>
              </Pressable>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

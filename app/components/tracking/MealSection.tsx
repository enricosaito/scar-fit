// app/components/MealSection.tsx
import React from "react";
import { Text, View, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FoodPortion } from "../../models/food";

interface MealSectionProps {
  title: string;
  icon: string;
  items: FoodPortion[];
  colors: any;
  onRemove: (index: number) => void;
}

export default function MealSection({ title, icon, items, colors, onRemove }: MealSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <View className="bg-card rounded-xl border border-border p-4 mb-4">
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
          <Feather name={icon} size={16} color={colors.primary} />
        </View>
        <Text className="text-lg font-medium text-foreground">{title}</Text>
      </View>

      {items.map((item, index) => (
        <View key={index} className="py-3 border-t border-border">
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
                <Text className="text-xs text-red-500">G: {Math.round((item.food.fat_g * item.quantity) / 100)}g</Text>
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

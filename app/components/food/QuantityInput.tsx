import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface QuantityInputProps {
  quantity: string;
  onQuantityChange: (quantity: string) => void;
}

/**
 * A reusable component for inputting food quantities
 * @param quantity - The current quantity value
 * @param onQuantityChange - Callback function when quantity changes
 */
export const QuantityInput: React.FC<QuantityInputProps> = ({ quantity, onQuantityChange }) => {
  const { colors } = useTheme();

  const handleIncrement = () => {
    onQuantityChange((parseInt(quantity) + 10).toString());
  };

  const handleDecrement = () => {
    onQuantityChange(Math.max(1, parseInt(quantity) - 10).toString());
  };

  return (
    <View className="mb-4">
      <Text className="text-foreground text-sm mb-2">Quantidade (g)</Text>
      <View className="flex-row">
        <Pressable className="bg-muted px-3 py-2 rounded-l-md" onPress={handleDecrement}>
          <Feather name="minus" size={20} color={colors.foreground} />
        </Pressable>
        <View className="flex-1 bg-card border-t border-b border-border">
          <Text className="text-center text-foreground py-2">{quantity}g</Text>
        </View>
        <Pressable className="bg-muted px-3 py-2 rounded-r-md" onPress={handleIncrement}>
          <Feather name="plus" size={20} color={colors.foreground} />
        </Pressable>
      </View>
      <View className="flex-row justify-center mt-2">
        <Pressable className="bg-muted mx-1 px-3 py-1 rounded-md" onPress={() => onQuantityChange("50")}>
          <Text className="text-foreground">50g</Text>
        </Pressable>
        <Pressable className="bg-muted mx-1 px-3 py-1 rounded-md" onPress={() => onQuantityChange("100")}>
          <Text className="text-foreground">100g</Text>
        </Pressable>
        <Pressable className="bg-muted mx-1 px-3 py-1 rounded-md" onPress={() => onQuantityChange("200")}>
          <Text className="text-foreground">200g</Text>
        </Pressable>
      </View>
    </View>
  );
};

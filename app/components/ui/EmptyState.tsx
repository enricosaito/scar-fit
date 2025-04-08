// app/components/ui/EmptyState.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export default function EmptyState({ icon = "inbox", title, description, buttonText, onButtonPress }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="bg-card rounded-xl border border-border p-6 items-center shadow-sm">
      <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
        <Feather name={icon} size={24} color={colors.mutedForeground} />
      </View>

      <Text className="text-lg font-medium mb-2 text-center text-foreground">{title}</Text>

      {description && <Text className="text-muted-foreground text-center mb-4">{description}</Text>}

      {buttonText && onButtonPress && (
        <Pressable className="flex-row items-center bg-primary px-4 py-2.5 rounded-lg" onPress={onButtonPress}>
          <Feather name="plus" size={16} color="white" />
          <Text className="text-white ml-2 font-medium">{buttonText}</Text>
        </Pressable>
      )}
    </View>
  );
}

// app/components/ui/Loading.tsx
import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: "small" | "large";
}

export default function Loading({ message = "Carregando...", fullScreen = false, size = "large" }: LoadingProps) {
  const { colors } = useTheme();

  if (fullScreen) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size={size} color={colors.primary} />
        {message && <Text className="text-foreground mt-4">{message}</Text>}
      </View>
    );
  }

  return (
    <View className="py-8 items-center justify-center">
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text className="text-muted-foreground mt-2">{message}</Text>}
    </View>
  );
}

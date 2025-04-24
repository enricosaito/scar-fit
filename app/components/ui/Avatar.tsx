import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/utils";

interface AvatarProps {
  url?: string | null;
  size?: number;
  className?: string;
}

export default function Avatar({ url, size = 40, className }: AvatarProps) {
  const { colors } = useTheme();

  if (!url) {
    return (
      <View
        className={cn(`bg-primary/20 items-center justify-center rounded-full`, className)}
        style={{ width: size, height: size }}
      >
        <Feather name="user" size={size * 0.5} color={colors.primary} />
      </View>
    );
  }

  return (
    <View className={cn("rounded-full overflow-hidden", className)} style={{ width: size, height: size }}>
      <Image source={{ uri: url }} style={{ width: size, height: size }} resizeMode="cover" />
    </View>
  );
}

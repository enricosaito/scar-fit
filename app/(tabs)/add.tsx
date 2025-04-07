// app/(tabs)/add.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function Add() {
  const router = useRouter();
  const { colors } = useTheme();

  // Automatically redirect to the tracking page with add mode
  React.useEffect(() => {
    router.replace("/tracking?mode=add");
  }, []);

  return (
    <View className="flex-1 bg-background justify-center items-center p-6">
      <View className="w-16 h-16 bg-primary rounded-full items-center justify-center mb-4">
        <Feather name="plus" size={24} color="white" />
      </View>
      <Text className="text-lg font-medium text-foreground mb-2">Adicionar Refeição</Text>
      <Text className="text-muted-foreground text-center mb-4">Redirecionando para adicionar uma nova refeição...</Text>
      <TouchableOpacity
        className="bg-primary px-4 py-2 rounded-md"
        onPress={() => router.replace("/tracking?mode=add")}
      >
        <Text className="text-white">Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

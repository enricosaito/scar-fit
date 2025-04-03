// app/recipes.tsx
import React from "react";
import { Text, View, SafeAreaView } from "react-native";
import "../global.css";

export default function Recipes() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center">
        <Text className="text-foreground text-lg">Planejador de Receitas</Text>
        <Text className="text-muted-foreground mt-2">Em breve: Encontre receitas que combinam com seus macros</Text>
      </View>
    </SafeAreaView>
  );
}

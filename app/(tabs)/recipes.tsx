// app/(tabs)/recipes.tsx
import React from "react";
import { Text, View, SafeAreaView } from "react-native";

export default function Recipes() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-2xl font-bold text-center">Receitas</Text>
        <Text className="text-gray-500 mt-2 text-center">Em breve: Receitas personalizadas</Text>
      </View>
    </SafeAreaView>
  );
}

// app/(tabs)/index.tsx
import React from "react";
import { Text, View, SafeAreaView } from "react-native";

export default function MacroCalculator() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-2xl font-bold text-center">Calculadora de Macros</Text>
        <Text className="text-gray-500 mt-2 text-center">Descubra seus valores ideais de macronutrientes</Text>
      </View>
    </SafeAreaView>
  );
}

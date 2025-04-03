// app/(tabs)/index.tsx
import React from "react";
import { Text, View, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Button from "../components/ui/Button";

export default function Home() {
  const router = useRouter();

  const navigateToCalculator = () => {
    router.push("/(tabs)/calculator");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-3xl font-bold text-center mb-2">Calculadora de Macros</Text>
          <Text className="text-gray-500 text-center mb-6">
            Descubra seus valores ideais de macronutrientes baseado nos seus objetivos
          </Text>

          <View className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <Text className="text-lg font-semibold mb-4">Comece sua jornada</Text>
            <Text className="text-gray-500 mb-4">
              A calculadora fornecerá recomendações personalizadas para sua ingestão de calorias, proteínas,
              carboidratos e gorduras.
            </Text>
            <Button className="w-full my-2" onPress={navigateToCalculator}>
              Iniciar Cálculo
            </Button>
          </View>

          <View className="bg-green-50 rounded-xl p-6">
            <Text className="text-lg font-semibold text-green-900 mb-2">Sabia que...</Text>
            <Text className="text-green-800">
              Macronutrientes são os nutrientes que seu corpo precisa em grandes quantidades: proteínas, carboidratos e
              gorduras.
            </Text>
          </View>

          {/* Additional informational sections */}
          <View className="mt-8">
            <Text className="text-2xl font-bold mb-4">Por que calcular macros?</Text>

            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex-row items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-blue-500 text-xl">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium mb-1">Controle Nutricional</Text>
                <Text className="text-gray-500">Entenda exatamente o que seu corpo precisa</Text>
              </View>
            </View>

            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex-row items-center">
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-3">
                <Text className="text-green-500 text-xl">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium mb-1">Foco nos Resultados</Text>
                <Text className="text-gray-500">Atinja seus objetivos com eficiência e precisão</Text>
              </View>
            </View>

            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex-row items-center">
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Text className="text-purple-500 text-xl">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium mb-1">Hábitos Saudáveis</Text>
                <Text className="text-gray-500">Desenvolva uma relação melhor com a alimentação</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

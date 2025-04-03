// app/(tabs)/tracking.tsx
import React, { useState } from "react";
import { Text, View, SafeAreaView, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Button from "../components/ui/Button";

export default function Tracking() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format date as "Segunda, 15 de Abril" in Portuguese
  const formatDate = (date: Date): string => {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    return `${dayName}, ${day} de ${month}`;
  };

  // Navigate to previous day
  const previousDay = (): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const nextDay = (): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          {/* Date Selector */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable onPress={previousDay} className="p-2">
              <Feather name="chevron-left" size={24} color="#333" />
            </Pressable>

            <Text className="text-lg font-medium">{formatDate(selectedDate)}</Text>

            <Pressable onPress={nextDay} className="p-2">
              <Feather name="chevron-right" size={24} color="#333" />
            </Pressable>
          </View>

          {/* Daily Summary */}
          <View className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <Text className="text-xl font-bold mb-4">Resumo Diário</Text>

            {/* Calories */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-medium">Calorias</Text>
                <Text className="text-gray-500">0 / 2000 kcal</Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
              </View>
            </View>

            {/* Protein */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-medium">Proteínas</Text>
                <Text className="text-gray-500">0 / 150g</Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View className="h-full bg-blue-500 rounded-full" style={{ width: "0%" }} />
              </View>
            </View>

            {/* Carbs */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-medium">Carboidratos</Text>
                <Text className="text-gray-500">0 / 200g</Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View className="h-full bg-yellow-500 rounded-full" style={{ width: "0%" }} />
              </View>
            </View>

            {/* Fats */}
            <View>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-medium">Gorduras</Text>
                <Text className="text-gray-500">0 / 65g</Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View className="h-full bg-red-500 rounded-full" style={{ width: "0%" }} />
              </View>
            </View>
          </View>

          {/* Meals */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Refeições</Text>
              <Button variant="outline" size="sm">
                Adicionar Refeição
              </Button>
            </View>

            {/* Empty state */}
            <View className="bg-white rounded-xl border border-gray-200 p-8 items-center">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Feather name="clipboard" size={24} color="#888" />
              </View>
              <Text className="text-lg font-medium mb-2 text-center">Nenhuma refeição registrada</Text>
              <Text className="text-gray-500 text-center mb-4">
                Adicione refeições para acompanhar seus macros diários
              </Text>
              <Button>Adicionar Primeira Refeição</Button>
            </View>
          </View>

          {/* Tips */}
          <View className="bg-green-50 rounded-xl p-6">
            <Text className="text-lg font-semibold text-green-900 mb-2">Dica do Dia</Text>
            <Text className="text-green-800">
              Lembre-se de beber água suficiente ao longo do dia. A hidratação adequada ajuda no metabolismo e na
              absorção de nutrientes.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

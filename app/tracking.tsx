// app/tracking.tsx
import React, { useState } from "react";
import { Text, View, SafeAreaView, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Button from "./components/ui/Button";
import { useTheme } from "./context/ThemeContext";

export default function Tracking() {
  const router = useRouter();
  const { colors } = useTheme();
  const { mode } = useLocalSearchParams();
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

  // Check if we're in add mode (coming from the + button)
  const isAddMode = mode === "add";

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header with back button */}
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">
          {isAddMode ? "Adicionar Refeição" : "Acompanhamento"}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          {/* Date Selector */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable onPress={previousDay} className="p-2">
              <Feather name="chevron-left" size={24} color={colors.foreground} />
            </Pressable>

            <Text className="text-lg font-medium text-foreground">{formatDate(selectedDate)}</Text>

            <Pressable onPress={nextDay} className="p-2">
              <Feather name="chevron-right" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Daily Summary */}
          <View className="bg-card rounded-xl border border-border p-6 mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">Resumo Diário</Text>

            {/* Calories */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-medium text-foreground">Calorias</Text>
                <Text className="text-muted-foreground">0 / 2000 kcal</Text>
              </View>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
              </View>
            </View>

            {/* Protein */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-medium text-foreground">Proteínas</Text>
                <Text className="text-muted-foreground">0 / 150g</Text>
              </View>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View className="h-full bg-blue-500 rounded-full" style={{ width: "0%" }} />
              </View>
            </View>

            {/* Carbs */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-medium text-foreground">Carboidratos</Text>
                <Text className="text-muted-foreground">0 / 200g</Text>
              </View>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View className="h-full bg-yellow-500 rounded-full" style={{ width: "0%" }} />
              </View>
            </View>

            {/* Fats */}
            <View>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-medium text-foreground">Gorduras</Text>
                <Text className="text-muted-foreground">0 / 65g</Text>
              </View>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View className="h-full bg-red-500 rounded-full" style={{ width: "0%" }} />
              </View>
            </View>
          </View>

          {/* Meals */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-foreground">Refeições</Text>

              {!isAddMode && (
                <Button variant="outline" size="sm">
                  Adicionar Refeição
                </Button>
              )}
            </View>

            {/* Empty state */}
            <View className="bg-card rounded-xl border border-border p-8 items-center">
              <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
                <Feather name="clipboard" size={24} color={colors.mutedForeground} />
              </View>
              <Text className="text-lg font-medium mb-2 text-center text-foreground">Nenhuma refeição registrada</Text>
              <Text className="text-muted-foreground text-center mb-4">
                Adicione refeições para acompanhar seus macros diários
              </Text>

              {isAddMode ? (
                // If in add mode, show a form or form button
                <Button className="w-full">Criar Nova Refeição</Button>
              ) : (
                // Normal mode
                <Button>Adicionar Primeira Refeição</Button>
              )}
            </View>
          </View>

          {/* Tips - only show in normal mode */}
          {!isAddMode && (
            <View className="bg-accent rounded-xl p-6">
              <Text className="text-lg font-semibold text-accent-foreground mb-2">Dica do Dia</Text>
              <Text className="text-accent-foreground">
                Lembre-se de beber água suficiente ao longo do dia. A hidratação adequada ajuda no metabolismo e na
                absorção de nutrientes.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

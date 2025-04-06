// app/(tabs)/index.tsx
import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import MacroSummary from "../components/MacroSummary";
import { MacroData } from "../models/user";
import { DailyLog, getUserDailyLog } from "../models/tracking";

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userProfile, user } = useAuth();
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(false);

  const navigateToCalculator = () => {
    router.push("/(tabs)/calculator");
  };

  const navigateToTracking = () => {
    router.push("/tracking");
  };

  // Check if user has saved macros
  const hasMacros = userProfile?.macros && Object.keys(userProfile?.macros || {}).length > 0;

  // Format date for database queries (YYYY-MM-DD)
  const formatDateForDb = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Load daily log for today
  useEffect(() => {
    const loadTodaysLog = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const dateStr = formatDateForDb(new Date());
        const log = await getUserDailyLog(user.id, dateStr);
        setDailyLog(log);
      } catch (error) {
        console.error("Error loading daily log:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodaysLog();
  }, [user]);

  // Get today's date formatted nicely in Portuguese
  const getTodayDateFormatted = () => {
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

    const today = new Date();
    const dayName = days[today.getDay()];
    const day = today.getDate();
    const month = months[today.getMonth()];

    return `${dayName}, ${day} de ${month}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Olá!</Text>
          <Text className="text-muted-foreground mb-6">{getTodayDateFormatted()}</Text>

          {/* Show macros if available */}
          {hasMacros ? (
            <>
              {loading ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : dailyLog ? (
                <View className="bg-card rounded-xl border border-border p-4 mb-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-foreground">Hoje</Text>
                    <Pressable onPress={navigateToTracking}>
                      <Text className="text-primary">Ver detalhes</Text>
                    </Pressable>
                  </View>

                  <MacroSummary
                    macros={userProfile?.macros as Partial<MacroData>}
                    showDate={false}
                    compact={true}
                    current={{
                      calories: dailyLog.total_calories,
                      protein: dailyLog.total_protein,
                      carbs: dailyLog.total_carbs,
                      fat: dailyLog.total_fat,
                    }}
                    showProgress={true}
                  />

                  <View className="flex-row mt-4">
                    <Button
                      className="flex-1 mr-2"
                      onPress={() =>
                        router.push({
                          pathname: "/tracking",
                          params: { showSearch: "true" },
                        })
                      }
                    >
                      <View className="flex-row items-center">
                        <Feather name="plus" size={16} color="white" />
                        <Text className="text-white ml-2">Adicionar</Text>
                      </View>
                    </Button>

                    <Button variant="outline" className="flex-1 ml-2" onPress={navigateToTracking}>
                      <Text className="text-foreground">Ver Detalhes</Text>
                    </Button>
                  </View>
                </View>
              ) : null}

              <View className="mb-6">
                <Text className="text-xl font-bold text-foreground mb-4">Suas Metas</Text>
                <MacroSummary macros={userProfile?.macros as Partial<MacroData>} showDate={true} compact={true} />
                <Button variant="outline" className="mt-3" onPress={navigateToCalculator}>
                  <View className="flex-row items-center">
                    <Feather name="sliders" size={16} color={colors.foreground} />
                    <Text className="text-foreground ml-2">Recalcular Metas</Text>
                  </View>
                </Button>
              </View>
            </>
          ) : (
            <View className="bg-card rounded-xl border border-border p-6 mb-6">
              <Text className="text-lg font-semibold text-foreground mb-4">Comece sua jornada</Text>
              <Text className="text-muted-foreground mb-4">
                A calculadora fornecerá recomendações personalizadas para sua ingestão de calorias, proteínas,
                carboidratos e gorduras.
              </Text>
              <Button className="w-full my-2" onPress={navigateToCalculator}>
                Iniciar Cálculo
              </Button>
            </View>
          )}

          <View className="bg-accent rounded-xl p-6">
            <Text className="text-lg font-semibold text-accent-foreground mb-2">Dica do Dia</Text>
            <Text className="text-accent-foreground">
              Lembre-se de beber água suficiente ao longo do dia. A hidratação adequada ajuda no metabolismo e na
              absorção de nutrientes.
            </Text>
          </View>

          {/* Additional informational sections */}
          <View className="mt-8">
            <Text className="text-2xl font-bold text-foreground mb-4">Por que calcular macros?</Text>

            <View className="bg-card rounded-xl border border-border p-4 mb-4 flex-row items-center">
              <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-3">
                <Text className="text-primary text-xl">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground mb-1">Controle Nutricional</Text>
                <Text className="text-muted-foreground">Entenda exatamente o que seu corpo precisa</Text>
              </View>
            </View>

            <View className="bg-card rounded-xl border border-border p-4 mb-4 flex-row items-center">
              <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-3">
                <Text className="text-primary text-xl">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground mb-1">Foco nos Resultados</Text>
                <Text className="text-muted-foreground">Atinja seus objetivos com eficiência e precisão</Text>
              </View>
            </View>

            <View className="bg-card rounded-xl border border-border p-4 mb-4 flex-row items-center">
              <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-3">
                <Text className="text-primary text-xl">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground mb-1">Hábitos Saudáveis</Text>
                <Text className="text-muted-foreground">Desenvolva uma relação melhor com a alimentação</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

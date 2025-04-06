// app/(tabs)/index.tsx
import React from "react";
import { Text, View, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import MacroSummary from "../components/MacroSummary";
import { MacroData } from "../models/user"; // Import the MacroData type

export default function Home() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const navigateToCalculator = () => {
    router.push("/(tabs)/calculator");
  };

  // Check if user has saved macros
  const hasMacros = userProfile?.macros && Object.keys(userProfile?.macros || {}).length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-3xl font-bold text-foreground text-center mb-2">Calculadora de Macros</Text>
          <Text className="text-muted-foreground text-center mb-6">
            Descubra seus valores ideais de macronutrientes baseado nos seus objetivos
          </Text>

          {/* Show macros if available */}
          {hasMacros ? (
            <View className="mb-6">
              <MacroSummary macros={userProfile?.macros as Partial<MacroData>} />
              <View className="mt-2">
                <Button onPress={navigateToCalculator}>Recalcular</Button>
              </View>
            </View>
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
            <Text className="text-lg font-semibold text-accent-foreground mb-2">Sabia que...</Text>
            <Text className="text-accent-foreground">
              Macronutrientes são os nutrientes que seu corpo precisa em grandes quantidades: proteínas, carboidratos e
              gorduras.
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

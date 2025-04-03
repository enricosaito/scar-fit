// app/index.tsx
import React from "react";
import { Text, View, SafeAreaView, ScrollView } from "react-native";
import Button from "./components/ui/Button";
import "../global.css";

export default function MacroCalculator() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-3xl font-bold text-foreground text-center mb-2">Calculadora de Macros</Text>
          <Text className="text-muted-foreground text-center mb-6">
            Descubra seus valores ideais de macronutrientes baseado nos seus objetivos
          </Text>

          <View className="bg-card rounded-xl border border-border p-6 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">Comece sua jornada</Text>
            <Text className="text-muted-foreground mb-4">
              A calculadora fornecerá recomendações personalizadas para sua ingestão de calorias, proteínas,
              carboidratos e gorduras.
            </Text>
            <Button
              className="w-full my-2"
              onPress={() => {
                // To be implemented
                console.log("Iniciar cálculo");
              }}
            >
              Iniciar Cálculo
            </Button>
          </View>

          <View className="bg-accent rounded-xl p-6">
            <Text className="text-lg font-semibold text-accent-foreground mb-2">Sabia que...</Text>
            <Text className="text-accent-foreground">
              Macronutrientes são os nutrientes que seu corpo precisa em grandes quantidades: proteínas, carboidratos e
              gorduras.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// app/screens/onboarding/steps/Goal.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInRight, FadeInLeft } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useOnboarding } from "../context/OnboardingContext";

interface GoalStepProps {
  onNext: () => void;
  onBack: () => void;
}

const Goal = ({ onNext, onBack }: GoalStepProps) => {
  const { colors } = useTheme();
  const { formData, updateFormData } = useOnboarding();

  const goals = [
    {
      id: "lose",
      title: "Perder Peso",
      description: "Déficit calórico para perda de gordura",
      icon: "trending-down",
      bgColor: "#ef444420", // Red tint
    },
    {
      id: "maintain",
      title: "Manter Peso",
      description: "Manutenção do peso atual",
      icon: "activity",
      bgColor: "#3b82f620", // Blue tint
    },
    {
      id: "gain",
      title: "Ganhar Massa",
      description: "Superávit calórico para ganho muscular",
      icon: "trending-up",
      bgColor: "#22c55e20", // Green tint
    },
  ];

  return (
    <View className="flex-1 justify-center">
      {/* Animated Title */}
      <Animated.Text
        className="text-2xl font-bold text-center text-foreground mb-2"
        entering={FadeInLeft.duration(600)}
      >
        Seu Objetivo
      </Animated.Text>

      {/* Animated Subtitle */}
      <Animated.Text className="text-center text-muted-foreground mb-8" entering={FadeInLeft.duration(600).delay(100)}>
        Qual é o seu principal objetivo de fitness?
      </Animated.Text>

      {/* Goals */}
      <Animated.View entering={FadeInRight.duration(600).delay(200)}>
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            className={`mb-6 p-5 border rounded-xl ${
              formData.goal === goal.id ? "bg-primary/10 border-primary" : "border-border bg-card"
            }`}
            onPress={() => updateFormData("goal", goal.id)}
          >
            <View className="flex-row items-center mb-2">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: formData.goal === goal.id ? `${colors.primary}20` : goal.bgColor }}
              >
                <Feather
                  name={goal.icon as keyof typeof Feather.glyphMap}
                  size={22}
                  color={
                    formData.goal === goal.id
                      ? colors.primary
                      : goal.id === "lose"
                      ? "#ef4444"
                      : goal.id === "maintain"
                      ? "#3b82f6"
                      : "#22c55e"
                  }
                />
              </View>
              <Text
                className={`text-xl font-semibold ${formData.goal === goal.id ? "text-primary" : "text-foreground"}`}
              >
                {goal.title}
              </Text>
            </View>

            <Text className="text-muted-foreground ml-16">{goal.description}</Text>

            {goal.id === "lose" && formData.goal === "lose" && (
              <View className="mt-4 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
                <Text className="text-red-500">
                  Déficit recomendado de 20% para perda de peso saudável, com ênfase em proteínas para preservar massa
                  muscular.
                </Text>
              </View>
            )}

            {goal.id === "maintain" && formData.goal === "maintain" && (
              <View className="mt-4 bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                <Text className="text-blue-500">
                  Consumo equilibrado de calorias para manutenção do peso, com distribuição balanceada de
                  macronutrientes.
                </Text>
              </View>
            )}

            {goal.id === "gain" && formData.goal === "gain" && (
              <View className="mt-4 bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                <Text className="text-green-500">
                  Superávit moderado de 15% para ganho de massa muscular, com aumento de carboidratos para energia
                  durante treinos.
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
};

export default Goal;

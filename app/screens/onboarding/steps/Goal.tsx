// Update app/screens/onboarding/steps/Goal.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInRight, FadeInLeft, ZoomIn } from "react-native-reanimated";
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
      iconColor: "#ef4444", // Red
      detailText:
        "Déficit recomendado de 20% para perda de peso saudável, com ênfase em proteínas para preservar massa muscular.",
      bgDetail: "bg-red-500/10",
      borderDetail: "border-red-500/30",
      textDetail: "text-red-500",
    },
    {
      id: "maintain",
      title: "Manter Peso",
      description: "Manutenção do peso atual",
      icon: "activity",
      bgColor: "#3b82f620", // Blue tint
      iconColor: "#3b82f6", // Blue
      detailText:
        "Consumo equilibrado de calorias para manutenção do peso, com distribuição balanceada de macronutrientes.",
      bgDetail: "bg-blue-500/10",
      borderDetail: "border-blue-500/30",
      textDetail: "text-blue-500",
    },
    {
      id: "gain",
      title: "Ganhar Massa",
      description: "Superávit calórico para ganho muscular",
      icon: "trending-up",
      bgColor: "#22c55e20", // Green tint
      iconColor: "#22c55e", // Green
      detailText:
        "Superávit moderado de 15% para ganho de massa muscular, com aumento de carboidratos para energia durante treinos.",
      bgDetail: "bg-green-500/10",
      borderDetail: "border-green-500/30",
      textDetail: "text-green-500",
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
        {goals.map((goal, index) => (
          <Animated.View key={goal.id} entering={ZoomIn.duration(500).delay(400 + index * 150)}>
            <Pressable
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
                    color={formData.goal === goal.id ? colors.primary : goal.iconColor}
                  />
                </View>
                <Text
                  className={`text-xl font-semibold ${formData.goal === goal.id ? "text-primary" : "text-foreground"}`}
                >
                  {goal.title}
                </Text>
              </View>

              <Text className="text-muted-foreground ml-16">{goal.description}</Text>

              {/* Show details when selected */}
              {formData.goal === goal.id && (
                <Animated.View
                  className={`mt-4 ${goal.bgDetail} p-3 rounded-lg border ${goal.borderDetail}`}
                  entering={FadeInRight.duration(300)}
                >
                  <Text className={goal.textDetail}>{goal.detailText}</Text>
                </Animated.View>
              )}
            </Pressable>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
};

export default Goal;

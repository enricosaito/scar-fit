// app/screens/onboarding/steps/ActivityLevel.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInRight, FadeInLeft } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useOnboarding } from "../context/OnboardingContext";

interface ActivityLevelStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ActivityLevel = ({ onNext, onBack }: ActivityLevelStepProps) => {
  const { colors } = useTheme();
  const { formData, updateFormData } = useOnboarding();

  const activityLevels = [
    {
      id: "sedentary",
      title: "Sedentário",
      description: "Pouco ou nenhum exercício",
      icon: "tv",
    },
    {
      id: "light",
      title: "Levemente Ativo",
      description: "Exercício leve 1-3 dias por semana",
      icon: "coffee",
    },
    {
      id: "moderate",
      title: "Moderadamente Ativo",
      description: "Exercício moderado 3-5 dias por semana",
      icon: "trending-up",
    },
    {
      id: "active",
      title: "Muito Ativo",
      description: "Exercício intenso 6-7 dias por semana",
      icon: "activity",
    },
    {
      id: "extreme",
      title: "Extremamente Ativo",
      description: "Exercício muito intenso, trabalho físico, ou treinamento 2x por dia",
      icon: "zap",
    },
  ];

  return (
    <View className="flex-1 justify-center">
      {/* Animated Title */}
      <Animated.Text
        className="text-2xl font-bold text-center text-foreground mb-2"
        entering={FadeInLeft.duration(600)}
      >
        Nível de Atividade
      </Animated.Text>

      {/* Animated Subtitle */}
      <Animated.Text className="text-center text-muted-foreground mb-6" entering={FadeInLeft.duration(600).delay(100)}>
        Selecione o nível que melhor descreve sua rotina física
      </Animated.Text>

      {/* Activity Levels */}
      <Animated.View entering={FadeInRight.duration(600).delay(200)}>
        {activityLevels.map((level, index) => (
          <Pressable
            key={level.id}
            className={`mb-3 p-4 border rounded-xl ${
              formData.activityLevel === level.id ? "bg-primary/10 border-primary" : "border-border bg-card"
            }`}
            onPress={() => updateFormData("activityLevel", level.id)}
          >
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor:
                    formData.activityLevel === level.id ? `${colors.primary}20` : `${colors.mutedForeground}15`,
                }}
              >
                <Feather
                  name={level.icon}
                  size={18}
                  color={formData.activityLevel === level.id ? colors.primary : colors.mutedForeground}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-medium ${formData.activityLevel === level.id ? "text-primary" : "text-foreground"}`}
                >
                  {level.title}
                </Text>
                <Text className="text-muted-foreground text-sm mt-1">{level.description}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
};

export default ActivityLevel;

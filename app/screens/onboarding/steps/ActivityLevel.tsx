// Update app/screens/onboarding/steps/ActivityLevel.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInRight, FadeInLeft, ZoomIn } from "react-native-reanimated";
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
      intensity: 1,
    },
    {
      id: "light",
      title: "Levemente Ativo",
      description: "Exercício leve 1-3 dias por semana",
      icon: "coffee",
      intensity: 2,
    },
    {
      id: "moderate",
      title: "Moderadamente Ativo",
      description: "Exercício moderado 3-5 dias por semana",
      icon: "trending-up",
      intensity: 3,
    },
    {
      id: "active",
      title: "Muito Ativo",
      description: "Exercício intenso 6-7 dias por semana",
      icon: "activity",
      intensity: 4,
    },
    {
      id: "extreme",
      title: "Extremamente Ativo",
      description: "Exercício muito intenso, trabalho físico, ou treinamento 2x por dia",
      icon: "zap",
      intensity: 5,
    },
  ];

  // Function to generate intensity indicators
  const renderIntensityIndicators = (intensity: number) => {
    return (
      <View className="flex-row mt-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <View
            key={level}
            className={`h-1.5 w-4 mx-0.5 rounded-full ${
              level <= intensity
                ? intensity === 1
                  ? "bg-blue-500"
                  : intensity === 2
                  ? "bg-green-500"
                  : intensity === 3
                  ? "bg-yellow-500"
                  : intensity === 4
                  ? "bg-orange-500"
                  : "bg-red-500"
                : "bg-muted"
            }`}
          />
        ))}
      </View>
    );
  };

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
          <Animated.View key={level.id} entering={ZoomIn.duration(400).delay(300 + index * 100)}>
            <Pressable
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
                    name={level.icon as keyof typeof Feather.glyphMap}
                    size={18}
                    color={formData.activityLevel === level.id ? colors.primary : colors.mutedForeground}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-medium ${
                      formData.activityLevel === level.id ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {level.title}
                  </Text>
                  <Text className="text-muted-foreground text-sm mt-1">{level.description}</Text>
                  {renderIntensityIndicators(level.intensity)}
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
};

export default ActivityLevel;

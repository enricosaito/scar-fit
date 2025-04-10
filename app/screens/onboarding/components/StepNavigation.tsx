// app/screens/onboarding/components/StepNavigation.tsx
import React from "react";
import { View, Pressable, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Button from "../../../components/ui/Button";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

const StepNavigation = ({ currentStep, totalSteps, onNext, onBack, onSkip }: StepNavigationProps) => {
  const { colors } = useTheme();
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <Animated.View
      className="px-6 pb-8 pt-4"
      entering={FadeIn.duration(500).delay(300)}
      exiting={FadeOut.duration(200)}
    >
      {onSkip && (
        <Pressable className="absolute top-4 right-6" onPress={onSkip}>
          <Text className="text-primary font-medium">Pular</Text>
        </Pressable>
      )}

      <View className="flex-row justify-between mt-2">
        <Pressable
          className={`p-3 ${isFirstStep ? "opacity-0" : "opacity-100"}`}
          onPress={onBack}
          disabled={isFirstStep}
        >
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>

        <Button onPress={onNext} className="px-8">
          {isLastStep ? "Concluir" : "Próximo"}
        </Button>
      </View>
    </Animated.View>
  );
};

export default StepNavigation;

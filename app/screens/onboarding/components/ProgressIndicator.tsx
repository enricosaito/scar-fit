// app/screens/onboarding/components/ProgressIndicator.tsx
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useTheme } from "../../../context/ThemeContext";

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const ProgressIndicator = ({ totalSteps, currentStep }: ProgressIndicatorProps) => {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  // Update progress when step changes
  useEffect(() => {
    progress.value = withTiming(currentStep / (totalSteps - 1), {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [currentStep, totalSteps]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View className="px-6 py-4">
      <View className="h-1 bg-muted rounded-full w-full overflow-hidden">
        <Animated.View className="h-full bg-primary rounded-full" style={progressStyle} />
      </View>

      {/* Optional: Dot indicators */}
      <View className="flex-row justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} className={`h-2 w-2 rounded-full ${index <= currentStep ? "bg-primary" : "bg-muted"}`} />
        ))}
      </View>
    </View>
  );
};

export default ProgressIndicator;

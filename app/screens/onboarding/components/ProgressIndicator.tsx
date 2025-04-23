// Update app/screens/onboarding/components/ProgressIndicator.tsx
import React from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useAnimatedReaction,
} from "react-native-reanimated";
import { useTheme } from "../../../context/ThemeContext";

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const ProgressIndicator = ({ totalSteps, currentStep }: ProgressIndicatorProps) => {
  const { colors } = useTheme();

  // Create an array of animation values for each segment
  const segmentAnimations = Array.from({ length: totalSteps }).map(() => useSharedValue(0));

  // React to changes in currentStep to animate the appropriate segments
  useAnimatedReaction(
    () => currentStep,
    (current, previous) => {
      for (let i = 0; i < segmentAnimations.length; i++) {
        // Animate segments up to current step
        segmentAnimations[i].value = withTiming(i <= current ? 1 : 0, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }
    },
    [currentStep]
  );

  return (
    <View className="px-6 py-4">
      {/* Five-part segmented bar with rounded edges */}
      <View className="flex-row justify-between px-1">
        {segmentAnimations.map((animation, index) => {
          // Create animated style for each segment
          const segmentStyle = useAnimatedStyle(() => ({
            backgroundColor: animation.value === 1 ? colors.primary : colors.muted,
            opacity: animation.value * 0.7 + 0.3, // Ensure partially visible even when not active
          }));

          return (
            <View key={index} className="flex-1 mx-1">
              <Animated.View className="h-2.5 rounded-full" style={segmentStyle} />
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ProgressIndicator;

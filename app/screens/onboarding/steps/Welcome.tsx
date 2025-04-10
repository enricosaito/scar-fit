// app/screens/onboarding/steps/Welcome.tsx
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import LottieView from "lottie-react-native";

interface WelcomeStepProps {
  onNext: () => void;
}

const Welcome = ({ onNext }: WelcomeStepProps) => {
  const { colors } = useTheme();
  const animation = useSharedValue(0);

  // Animated style for the icon
  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSequence(
            withTiming(1.2, { duration: 600, easing: Easing.bezier(0.34, 1.56, 0.64, 1) }),
            withTiming(1, { duration: 400, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })
          ),
        },
      ],
    };
  });

  // Start animation sequence on mount
  useEffect(() => {
    animation.value = 1;

    // Auto-advance to next step after 4 seconds (optional)
    // const timer = setTimeout(onNext, 4000);
    // return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 justify-center items-center">
      {/* Logo or App Icon with animation */}
      <Animated.View
        style={iconStyle}
        className="w-32 h-32 bg-primary/20 rounded-full items-center justify-center mb-8"
      >
        <Feather name="activity" size={64} color={colors.primary} />
      </Animated.View>

      {/* Animated Title */}
      <Animated.Text
        className="text-4xl font-bold text-center text-foreground mb-4"
        entering={FadeInDown.duration(800).delay(300)}
      >
        Scar Fit
      </Animated.Text>

      {/* Animated Subtitle */}
      <Animated.Text
        className="text-lg text-center text-muted-foreground mb-8 px-6"
        entering={FadeInDown.duration(800).delay(600)}
      >
        Vamos transformar seus objetivos de saúde em realidade
      </Animated.Text>

      {/* Animated Feature Cards */}
      <Animated.View className="w-full px-6" entering={FadeIn.duration(800).delay(900)}>
        <View className="bg-card rounded-xl border border-border p-5 mb-4">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
              <Feather name="target" size={20} color={colors.primary} />
            </View>
            <Text className="text-base font-semibold text-foreground">Defina suas metas</Text>
          </View>
          <Text className="text-muted-foreground">Personalize sua nutrição com base nos seus objetivos únicos.</Text>
        </View>

        <View className="bg-card rounded-xl border border-border p-5">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
              <Feather name="trending-up" size={20} color={colors.primary} />
            </View>
            <Text className="text-base font-semibold text-foreground">Acompanhe seu progresso</Text>
          </View>
          <Text className="text-muted-foreground">Visualize seus dados nutricionais e alcance resultados reais.</Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default Welcome;

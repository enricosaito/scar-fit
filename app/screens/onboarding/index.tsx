// Update app/screens/onboarding/index.tsx
import React, { useState, useEffect } from "react";
import { SafeAreaView, View, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn, FadeOut } from "react-native-reanimated";
import { onboardingSteps } from "./config/OnboardingFlow";
import ProgressIndicator from "./components/ProgressIndicator";
import StepNavigation from "./components/StepNavigation";
import { useTheme } from "../../context/ThemeContext";
import {
  OnboardingProvider,
  Gender,
  ActivityLevel,
  Goal,
  OnboardingFormData,
  defaultFormData,
} from "./context/OnboardingContext";
import { Keyboard } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { setOnboardingCompleted } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(defaultFormData);

  const dismissKeyboardBeforeTransition = () => {
    Keyboard.dismiss();
    setTimeout(() => {}, 100);
  };

  const backgroundOpacity = useSharedValue(0);
  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  useEffect(() => {
    backgroundOpacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const currentStep = onboardingSteps[currentStepIndex];
  const StepComponent = currentStep.component;

  const updateFormData = (key: keyof OnboardingFormData, value: string | Gender | ActivityLevel | Goal) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    dismissKeyboardBeforeTransition();
    if (currentStepIndex < onboardingSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    dismissKeyboardBeforeTransition();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      router.push("/(tabs)");
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
    router.replace("/(tabs)");
  };

  return (
    <OnboardingProvider value={{ formData, updateFormData }}>
      <SafeAreaView className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <StatusBar barStyle="light-content" />

        <Animated.View className="absolute top-0 left-0 right-0 bottom-0 bg-background" style={backgroundStyle} />

        <ProgressIndicator totalSteps={onboardingSteps.length} currentStep={currentStepIndex} />

        <Animated.View
          className="flex-1 px-6"
          entering={FadeIn.duration(600)}
          exiting={FadeOut.duration(300)}
          key={currentStep.id}
        >
          <StepComponent onNext={handleNext} onBack={handleBack} formData={formData} updateFormData={updateFormData} />
        </Animated.View>

        <StepNavigation
          currentStep={currentStepIndex}
          totalSteps={onboardingSteps.length}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={currentStep.skipEnabled ? handleSkip : undefined}
        />
      </SafeAreaView>
    </OnboardingProvider>
  );
}

// app/screens/onboarding/index.tsx
import React, { useState, useEffect } from "react";
import { SafeAreaView, View, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn, FadeOut } from "react-native-reanimated";
import { onboardingSteps } from "./config/OnboardingFlow";
import ProgressIndicator from "./components/ProgressIndicator";
import StepNavigation from "./components/StepNavigation";
import { useTheme } from "../../context/ThemeContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import { Keyboard } from "react-native";

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    gender: "male",
    age: "",
    weight: "",
    height: "",
    activityLevel: "moderate",
    goal: "maintain",
  });
  // Add this function inside your component
  const dismissKeyboardBeforeTransition = () => {
    Keyboard.dismiss();
    // Small delay before navigation
    setTimeout(() => {
      // Your navigation code
    }, 100);
  };

  // Animation opacity value
  const backgroundOpacity = useSharedValue(0);
  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  // Set background animation on mount
  useEffect(() => {
    backgroundOpacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const currentStep = onboardingSteps[currentStepIndex];
  const StepComponent = currentStep.component;

  const updateFormData = (key, value) => {
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
    // Save user data here if needed
    // Then navigate to main app
    router.replace("/(tabs)");
  };

  return (
    <OnboardingProvider value={{ formData, updateFormData }}>
      <SafeAreaView className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <StatusBar barStyle="light-content" />

        {/* Animated Background (could be gradient or image) */}
        <Animated.View className="absolute top-0 left-0 right-0 bottom-0 bg-background" style={backgroundStyle} />

        {/* Progress Indicator */}
        <ProgressIndicator totalSteps={onboardingSteps.length} currentStep={currentStepIndex} />

        {/* Step Content with Smooth Transitions */}
        <Animated.View
          className="flex-1 px-6"
          entering={FadeIn.duration(600)}
          exiting={FadeOut.duration(300)}
          key={currentStep.id}
        >
          <StepComponent onNext={handleNext} onBack={handleBack} formData={formData} updateFormData={updateFormData} />
        </Animated.View>

        {/* Navigation Controls */}
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

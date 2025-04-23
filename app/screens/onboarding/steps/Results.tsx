// Update app/screens/onboarding/steps/Results.tsx
import React, { useEffect } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  FadeIn,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../../../context/AuthContext";
import { saveUserMacros } from "../../../models/user";
import { calculateBMR, getActivityMultiplier, getGoalAdjustment, calculateMacros } from "../utils/calculations";

interface ResultsStepProps {
  onNext: () => void;
  onBack: () => void;
}

const Results = ({ onNext, onBack }: ResultsStepProps) => {
  const { colors } = useTheme();
  const { formData } = useOnboarding();
  const { user, refreshProfile, setOnboardingCompleted } = useAuth();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  // Animation values
  const caloriesScale = useSharedValue(0.8);
  const proteinProgress = useSharedValue(0);
  const carbsProgress = useSharedValue(0);
  const fatProgress = useSharedValue(0);

  // Calculate all the values
  const bmr = calculateBMR(formData.gender, formData.weight, formData.height, formData.age);
  const activityMultiplier = getActivityMultiplier(formData.activityLevel);
  const tdee = bmr * activityMultiplier;
  const goalAdjustment = getGoalAdjustment(formData.goal);
  const adjustedTdee = tdee * goalAdjustment;
  const macros = calculateMacros(adjustedTdee, formData.weight, formData.goal);

  // Calculate percentages for display
  const proteinPercentage = Math.round(((macros.protein * 4) / macros.calories) * 100);
  const carbsPercentage = Math.round(((macros.carbs * 4) / macros.calories) * 100);
  const fatPercentage = Math.round(((macros.fat * 9) / macros.calories) * 100);

  // Animated styles
  const caloriesStyle = useAnimatedStyle(() => ({
    transform: [{ scale: caloriesScale.value }],
  }));

  const proteinBarStyle = useAnimatedStyle(() => ({
    width: `${proteinProgress.value * proteinPercentage}%`,
  }));

  const carbsBarStyle = useAnimatedStyle(() => ({
    width: `${carbsProgress.value * carbsPercentage}%`,
  }));

  const fatBarStyle = useAnimatedStyle(() => ({
    width: `${fatProgress.value * fatPercentage}%`,
  }));

  // Start animations
  useEffect(() => {
    // Animate calories
    caloriesScale.value = withSequence(
      withDelay(300, withSpring(1.2, { mass: 1, stiffness: 100 })),
      withSpring(1, { mass: 1, stiffness: 100 })
    );

    // Animate progress bars
    proteinProgress.value = withDelay(800, withTiming(1, { duration: 1000 }));
    carbsProgress.value = withDelay(1000, withTiming(1, { duration: 1000 }));
    fatProgress.value = withDelay(1200, withTiming(1, { duration: 1000 }));
  }, []);

  // Save results to user profile
  const handleSaveResults = async () => {
    if (!user) {
      return;
    }

    setIsSaving(true);
    try {
      await saveUserMacros(user.id, {
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        goal: formData.goal,
        activityLevel: formData.activityLevel,
      });

      // Refresh the profile to update context
      await refreshProfile();
      setIsSaved(true);

      // Mark onboarding as completed to prevent future redirects
      setOnboardingCompleted(true);

      // Complete and exit onboarding
      setTimeout(() => {
        onNext();
      }, 1000);
    } catch (error) {
      console.error("Error saving macros:", error);
      Alert.alert("Erro", "Não foi possível salvar seus resultados. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save when component mounts
  useEffect(() => {
    handleSaveResults();
  }, []);

  return (
    <View className="flex-1 justify-center">
      <Animated.Text className="text-2xl font-bold text-center text-foreground mb-2" entering={FadeInUp.duration(600)}>
        Suas Metas Nutricionais
      </Animated.Text>

      <Animated.Text className="text-center text-muted-foreground mb-6" entering={FadeInUp.duration(600).delay(200)}>
        Objetivos diários personalizados para seus resultados
      </Animated.Text>

      {/* Main Calories Card */}
      <Animated.View
        className="bg-card rounded-xl border border-border p-6 mb-6 items-center"
        entering={ZoomIn.duration(800).delay(400)}
        style={caloriesStyle}
      >
        <Text className="text-sm font-medium text-primary mb-1">Calorias Diárias</Text>
        <Animated.Text className="text-5xl font-bold text-foreground mb-2">{macros.calories}</Animated.Text>
        <Text className="text-muted-foreground mb-4">kcal</Text>

        <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-1">
          <Feather name="battery-charging" size={28} color={colors.primary} />
        </View>
      </Animated.View>

      {/* Macros Distribution */}
      <Animated.View
        className="bg-card rounded-xl border border-border p-4 mb-6"
        entering={FadeInUp.duration(800).delay(600)}
      >
        <Text className="font-medium text-foreground mb-3">Distribuição de Macros</Text>

        {/* Protein Row */}
        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
              <Text className="font-medium text-foreground">Proteínas</Text>
            </View>
            <Text className="text-muted-foreground">
              {macros.protein}g ({proteinPercentage}%)
            </Text>
          </View>
          <View className="h-2 bg-muted rounded-full overflow-hidden">
            <Animated.View className="h-full bg-blue-500 rounded-full" style={proteinBarStyle} />
          </View>
        </View>

        {/* Carbs Row */}
        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-yellow-500 mr-1" />
              <Text className="font-medium text-foreground">Carboidratos</Text>
            </View>
            <Text className="text-muted-foreground">
              {macros.carbs}g ({carbsPercentage}%)
            </Text>
          </View>
          <View className="h-2 bg-muted rounded-full overflow-hidden">
            <Animated.View className="h-full bg-yellow-500 rounded-full" style={carbsBarStyle} />
          </View>
        </View>

        {/* Fat Row */}
        <View>
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
              <Text className="font-medium text-foreground">Gorduras</Text>
            </View>
            <Text className="text-muted-foreground">
              {macros.fat}g ({fatPercentage}%)
            </Text>
          </View>
          <View className="h-2 bg-muted rounded-full overflow-hidden">
            <Animated.View className="h-full bg-red-500 rounded-full" style={fatBarStyle} />
          </View>
        </View>
      </Animated.View>

      {/* Saving Indicator */}
      <Animated.View className="items-center" entering={FadeIn.duration(500).delay(1400)}>
        {isSaving ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color={colors.primary} />
            <Text className="text-muted-foreground ml-2">Salvando suas metas...</Text>
          </View>
        ) : isSaved ? (
          <View className="flex-row items-center">
            <Feather name="check-circle" size={18} color="#22c55e" />
            <Text className="text-green-500 ml-2">Metas salvas com sucesso!</Text>
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
};

export default Results;

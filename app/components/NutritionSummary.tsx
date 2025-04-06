// app/components/NutritionSummary.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Animated } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { MacroData } from "../models/user";

interface NutritionSummaryProps {
  macros: Partial<MacroData>;
  current?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  compact?: boolean;
}

export default function NutritionSummary({ macros, current = {}, compact = false }: NutritionSummaryProps) {
  const { colors } = useTheme();

  // Animation values
  const proteinAnim = React.useRef(new Animated.Value(0)).current;
  const carbsAnim = React.useRef(new Animated.Value(0)).current;
  const fatsAnim = React.useRef(new Animated.Value(0)).current;

  if (!macros) {
    return null;
  }

  // Use current values for display if provided
  const currentCalories = current.calories !== undefined ? current.calories : 0;
  const currentProtein = current.protein !== undefined ? current.protein : 0;
  const currentCarbs = current.carbs !== undefined ? current.carbs : 0;
  const currentFat = current.fat !== undefined ? current.fat : 0;

  // Calculate calories difference (negative when over the goal)
  const caloriesDiff = (macros.calories || 0) - currentCalories;
  const isOverCalorieGoal = caloriesDiff < 0;

  // Amount to display: either remaining or over
  const caloriesAmount = Math.abs(caloriesDiff);

  // Format today's date (e.g., "Domingo, 6 de Abril")
  const formatTodayDate = () => {
    const today = new Date();
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const dayOfWeek = days[today.getDay()];
    const dayOfMonth = today.getDate();
    const month = months[today.getMonth()];

    return `${dayOfWeek}, ${dayOfMonth} de ${month}`;
  };

  // Calculate progress percentages
  const calculateProgress = (current: number, target: number) => {
    if (!target) return 0;
    const percentage = (current / target) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  const proteinProgress = calculateProgress(currentProtein, macros.protein || 0);
  const carbsProgress = calculateProgress(currentCarbs, macros.carbs || 0);
  const fatProgress = calculateProgress(currentFat, macros.fat || 0);

  // Fix: Store calculated progress in state to ensure useEffect runs correctly
  const [currentProgress, setCurrentProgress] = useState({
    protein: proteinProgress,
    carbs: carbsProgress,
    fat: fatProgress,
  });

  // Update progress values when current values change
  useEffect(() => {
    setCurrentProgress({
      protein: calculateProgress(currentProtein, macros.protein || 0),
      carbs: calculateProgress(currentCarbs, macros.carbs || 0),
      fat: calculateProgress(currentFat, macros.fat || 0),
    });
  }, [currentProtein, currentCarbs, currentFat, macros]);

  // Animate progress bars when progress changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(proteinAnim, {
        toValue: currentProgress.protein,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(carbsAnim, {
        toValue: currentProgress.carbs,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(fatsAnim, {
        toValue: currentProgress.fat,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentProgress]);

  const proteinWidth = proteinAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const carbsWidth = carbsAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const fatsWidth = fatsAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View className="bg-card rounded-xl border border-border p-4">
      {/* Today's date with weekday */}
      <Text className="text-lg font-semibold text-foreground mb-4">{formatTodayDate()}</Text>

      {/* Main layout */}
      <View className="flex-row mb-4">
        {/* Left side: Calorie circle */}
        <View className="w-2/5 items-center justify-center">
          <CalorieCircle
            current={currentCalories}
            goal={macros.calories || 2000}
            caloriesAmount={caloriesAmount}
            isOverGoal={isOverCalorieGoal}
          />
        </View>

        {/* Right side: Macros */}
        <View className="w-3/5 justify-center pl-4">
          {/* Protein - compact display */}
          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <View className="w-6 h-6 bg-purple-500/20 rounded-full items-center justify-center mr-2">
                <Feather name="award" size={12} color="#a855f7" />
              </View>
              <Text className="text-foreground font-medium">Proteínas</Text>
            </View>

            {/* Main text - protein remaining */}
            <Text className="text-xl text-white mb-1">
              <Text className="font-bold">{Math.round(Math.max(0, (macros.protein || 0) - currentProtein))}g</Text>{" "}
              restantes
            </Text>

            {/* Protein progress bar - thinner but with subtle glow */}
            <View className="h-2 rounded-full overflow-hidden bg-purple-900/30">
              {/* Static background (darker purple) - already handled by the parent View */}

              {/* Animated foreground bar */}
              <Animated.View
                style={[
                  {
                    width: proteinWidth,
                    height: "100%",
                    backgroundColor: "#a855f7", // Tailwind purple-500
                    borderRadius: 9999,
                    shadowColor: "#c084fc", // Tailwind purple-400
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.4,
                    shadowRadius: 3,
                  },
                ]}
              />
            </View>

            {/* Secondary text - protein consumed vs total, with consumed in purple */}
            <Text className="text-xs text-muted-foreground mt-1.5">
              <Text className="text-purple-500">{Math.round(currentProtein)}g</Text> / {macros.protein || 0}g consumidos
            </Text>
          </View>

          {/* Carbs and Fats aligned under protein section */}
          <View className="flex-row justify-between mt-3 px-1">
            {/* Carbs */}
            <View className="items-center">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-yellow-500 mr-1" />
                <Text className="text-sm text-muted-foreground">
                  <Text className="text-yellow-500">{Math.round(currentCarbs)}g</Text> / {macros.carbs || 0}g
                </Text>
              </View>
              <Text className="text-xs text-muted-foreground mt-0.5">Carbos</Text>
            </View>

            {/* Fats */}
            <View className="items-center">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                <Text className="text-sm text-muted-foreground">
                  <Text className="text-red-500">{Math.round(currentFat)}g</Text> / {macros.fat || 0}g
                </Text>
              </View>
              <Text className="text-xs text-muted-foreground mt-0.5">Gorduras</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// Component for the calorie circle with "calories left" or "calories over" display
function CalorieCircle({ current, goal, caloriesAmount, isOverGoal }) {
  const { colors } = useTheme();

  // Calculate percentage
  const percentage = goal > 0 ? Math.min(120, (current / goal) * 100) : 0;

  // Calculate circle properties
  const size = 140;
  const strokeWidth = 12; // Slightly thicker for emphasis
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Handle the case when over goal
  const progressPercentage = isOverGoal ? 100 : percentage;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Get dynamic progress color based on percentage and overrun
  const getProgressColor = () => {
    if (isOverGoal) return "#ef4444"; // Tailwind red-500 for over goal
    if (percentage >= 90 && percentage <= 100) return "#22c55e"; // Tailwind green-500
    return "#3b82f6"; // Tailwind blue-500 (base color)
  };

  return (
    <View className="items-center justify-center">
      <View className="relative">
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={colors.border}
            fill="transparent"
          />

          {/* Progress Circle */}
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              stroke={getProgressColor()}
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </G>
        </Svg>

        {/* Centered Text - Calories Left or Over */}
        <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
          <Text className={`text-3xl font-bold ${isOverGoal ? "text-red-400" : "text-white"}`}>
            {Math.round(caloriesAmount)}
          </Text>
          <Text className={`text-xs ${isOverGoal ? "text-red-400" : "text-white"}`}>
            {isOverGoal ? "acima" : "restantes"}
          </Text>
        </View>
      </View>
      <Text className="text-muted-foreground mt-2">de {goal} calorias</Text>
    </View>
  );
}

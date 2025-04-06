// app/components/MacroSummary.tsx (updated)
import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { MacroData } from "../models/user";
import CalorieProgress from "./CalorieProgress";
import Svg, { Circle, G } from "react-native-svg";

interface MacroSummaryProps {
  macros: Partial<MacroData>;
  showDate?: boolean;
  compact?: boolean;
  current?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  showProgress?: boolean;
}

export default function MacroSummary({
  macros,
  showDate = true,
  compact = false,
  current = {},
  showProgress = false,
}: MacroSummaryProps) {
  const { colors } = useTheme();

  if (!macros) {
    return null;
  }

  // Calculate percentages for pie chart display
  const proteinCalories = (macros.protein || 0) * 4;
  const carbCalories = (macros.carbs || 0) * 4;
  const fatCalories = (macros.fat || 0) * 9;
  const totalCalories = macros.calories || 0;

  const proteinPercentage = Math.round((proteinCalories / totalCalories) * 100) || 0;
  const carbsPercentage = Math.round((carbCalories / totalCalories) * 100) || 0;
  const fatPercentage = Math.round((fatCalories / totalCalories) * 100) || 0;

  // Calculate progress percentages if current values are provided
  const calculateProgress = (current: number, target: number) => {
    if (!target) return 0;
    const percentage = (current / target) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  // Use current values for display if provided
  const currentCalories = current.calories !== undefined ? current.calories : 0;
  const currentProtein = current.protein !== undefined ? current.protein : 0;
  const currentCarbs = current.carbs !== undefined ? current.carbs : 0;
  const currentFat = current.fat !== undefined ? current.fat : 0;

  // Calculate calories left
  const caloriesLeft = Math.max(0, (macros.calories || 0) - currentCalories);

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

  return (
    <View className="bg-card rounded-xl border border-border p-4">
      {/* Today's date with weekday */}
      <Text className="text-lg font-semibold text-foreground mb-2">{formatTodayDate()}</Text>

      {/* New layout: Calorie circle on left, macros on right */}
      <View className="flex-row">
        {/* Left side: Calorie circle */}
        <View className="flex-1 items-center justify-center">
          <CalorieCircleWithCaloriesLeft
            current={currentCalories}
            goal={macros.calories || 2000}
            caloriesLeft={caloriesLeft}
          />
        </View>

        {/* Right side: Macro stats */}
        <View className="flex-1 justify-center">
          {/* Protein Progress */}
          <View className="mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-purple-500 mr-1" />
                <Text className="font-medium text-foreground">Proteínas</Text>
              </View>
              <Text className="text-muted-foreground">
                {Math.round(currentProtein)} / {macros.protein || 0}g
              </Text>
            </View>
            <View className="h-2 bg-muted rounded-full overflow-hidden">
              <View
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${calculateProgress(currentProtein, macros.protein || 0)}%` }}
              />
            </View>
          </View>

          {/* Carbs Progress */}
          <View className="mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-yellow-500 mr-1" />
                <Text className="font-medium text-foreground">Carboidratos</Text>
              </View>
              <Text className="text-muted-foreground">
                {Math.round(currentCarbs)} / {macros.carbs || 0}g
              </Text>
            </View>
            <View className="h-2 bg-muted rounded-full overflow-hidden">
              <View
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${calculateProgress(currentCarbs, macros.carbs || 0)}%` }}
              />
            </View>
          </View>

          {/* Fats Progress */}
          <View>
            <View className="flex-row justify-between items-center mb-1">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
                <Text className="font-medium text-foreground">Gorduras</Text>
              </View>
              <Text className="text-muted-foreground">
                {Math.round(currentFat)} / {macros.fat || 0}g
              </Text>
            </View>
            <View className="h-2 bg-muted rounded-full overflow-hidden">
              <View
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${calculateProgress(currentFat, macros.fat || 0)}%` }}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// New component for the calorie circle with "calories left" display
function CalorieCircleWithCaloriesLeft({ current, goal, caloriesLeft }) {
  const { colors } = useTheme();

  // Calculate percentage
  const percentage = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  // Calculate circle properties
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Get color based on percentage
  const getProgressColor = () => {
    if (percentage <= 70) return "#3b82f6"; // Bright blue for under target
    if (percentage <= 100) return "#22c55e"; // Green for near target
    return "#ef4444"; // Red for over target
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

        {/* Centered Text - Calories Left */}
        <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
          <Text className="text-3xl font-bold text-white">{Math.round(caloriesLeft)}</Text>
          <Text className="text-xs text-white">restantes</Text>
        </View>
      </View>
      <Text className="text-muted-foreground mt-2">de {goal} calorias</Text>
    </View>
  );
}

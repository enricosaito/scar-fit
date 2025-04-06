// app/components/MacroSummary.tsx (updated)
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { MacroData } from "../models/user";
import CalorieProgress from "./CalorieProgress";

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

  return (
    <View className="bg-card rounded-xl border border-border p-4">
      {showDate && macros.updatedAt && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-foreground">
            {showProgress ? "Progresso de Hoje" : "Suas Metas"}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {new Date(macros.updatedAt).toLocaleDateString("pt-BR")}
          </Text>
        </View>
      )}

      {!showDate && (
        <Text className="text-lg font-semibold text-foreground mb-2">
          {showProgress ? "Progresso de Hoje" : "Suas Metas"}
        </Text>
      )}

      {/* Calorie display with circular progress */}
      <View className="items-center mb-4">
        <Text className="text-sm font-medium text-primary mb-1">Total Diário</Text>
        <CalorieProgress
          current={showProgress ? currentCalories : macros.calories || 0}
          goal={macros.calories || 2000}
          size={compact ? 100 : 140}
          strokeWidth={compact ? 8 : 12}
          compact={compact}
        />
        <Text className="text-muted-foreground mt-2">calorias</Text>
      </View>

      {/* Progress bars when showProgress is true */}
      {showProgress && (
        <View className="mb-4">
          {/* Protein Progress */}
          <View className="mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-medium text-foreground">Proteínas</Text>
              <Text className="text-muted-foreground">
                {Math.round(currentProtein)} / {macros.protein || 0}g
              </Text>
            </View>
            <View className="h-2 bg-muted rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${calculateProgress(currentProtein, macros.protein || 0)}%` }}
              />
            </View>
          </View>

          {/* Carbs Progress */}
          <View className="mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-medium text-foreground">Carboidratos</Text>
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
              <Text className="font-medium text-foreground">Gorduras</Text>
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
      )}

      {/* Three cards for macros */}
      {(!showProgress || !compact) && (
        <View className="flex-row justify-between mb-4">
          {/* Protein Card */}
          <View className="bg-card rounded-xl border border-border p-2 w-[31%] items-center">
            <View className="w-8 h-8 bg-blue-500/10 rounded-full items-center justify-center mb-1">
              <Feather name="award" size={16} color="#3b82f6" />
            </View>
            <Text className="text-base font-bold text-foreground">
              {showProgress ? Math.round(currentProtein) : macros.protein || 0}
            </Text>
            <Text className="text-xs text-muted-foreground">g proteína</Text>
            <Text className="text-xs text-blue-500 font-medium">{proteinPercentage}%</Text>
          </View>

          {/* Carbs Card */}
          <View className="bg-card rounded-xl border border-border p-2 w-[31%] items-center">
            <View className="w-8 h-8 bg-yellow-500/10 rounded-full items-center justify-center mb-1">
              <Feather name="box" size={16} color="#eab308" />
            </View>
            <Text className="text-base font-bold text-foreground">
              {showProgress ? Math.round(currentCarbs) : macros.carbs || 0}
            </Text>
            <Text className="text-xs text-muted-foreground">g carboidratos</Text>
            <Text className="text-xs text-yellow-500 font-medium">{carbsPercentage}%</Text>
          </View>

          {/* Fats Card */}
          <View className="bg-card rounded-xl border border-border p-2 w-[31%] items-center">
            <View className="w-8 h-8 bg-red-500/10 rounded-full items-center justify-center mb-1">
              <Feather name="droplet" size={16} color="#ef4444" />
            </View>
            <Text className="text-base font-bold text-foreground">
              {showProgress ? Math.round(currentFat) : macros.fat || 0}
            </Text>
            <Text className="text-xs text-muted-foreground">g gorduras</Text>
            <Text className="text-xs text-red-500 font-medium">{fatPercentage}%</Text>
          </View>
        </View>
      )}

      {!compact && !showProgress && (
        <View className="h-4 flex-row rounded-full overflow-hidden">
          <View className="h-full bg-blue-500" style={{ width: `${proteinPercentage}%` }} />
          <View className="h-full bg-yellow-500" style={{ width: `${carbsPercentage}%` }} />
          <View className="h-full bg-red-500" style={{ width: `${fatPercentage}%` }} />
        </View>
      )}
    </View>
  );
}

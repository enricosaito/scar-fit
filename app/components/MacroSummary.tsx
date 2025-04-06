// app/components/MacroSummary.tsx
import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { MacroData } from "../models/user";

interface MacroSummaryProps {
  macros: Partial<MacroData>;
  showDate?: boolean;
  compact?: boolean;
}

export default function MacroSummary({ macros, showDate = true, compact = false }: MacroSummaryProps) {
  const { colors } = useTheme();

  if (!macros) {
    return null;
  }

  // Calculate percentages
  const proteinCalories = (macros.protein || 0) * 4;
  const carbCalories = (macros.carbs || 0) * 4;
  const fatCalories = (macros.fat || 0) * 9;
  const totalCalories = macros.calories || 0;

  const proteinPercentage = Math.round((proteinCalories / totalCalories) * 100) || 0;
  const carbsPercentage = Math.round((carbCalories / totalCalories) * 100) || 0;
  const fatPercentage = Math.round((fatCalories / totalCalories) * 100) || 0;

  return (
    <View className="bg-card rounded-xl border border-border p-4">
      {showDate && macros.updatedAt && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-foreground">Seus Macronutrientes</Text>
          <Text className="text-xs text-muted-foreground">
            {new Date(macros.updatedAt).toLocaleDateString("pt-BR")}
          </Text>
        </View>
      )}

      {/* Calorie display */}
      <View className="items-center mb-4">
        <Text className="text-sm font-medium text-primary mb-1">Total Diário</Text>
        <Text className={`${compact ? "text-2xl" : "text-3xl"} font-bold text-foreground`}>{macros.calories || 0}</Text>
        <Text className="text-muted-foreground">calorias</Text>
      </View>

      {/* Three cards for macros */}
      <View className="flex-row justify-between mb-4">
        {/* Protein Card */}
        <View className="bg-card rounded-xl border border-border p-2 w-[31%] items-center">
          <View className="w-8 h-8 bg-blue-500/10 rounded-full items-center justify-center mb-1">
            <Feather name="award" size={16} color="#3b82f6" />
          </View>
          <Text className="text-base font-bold text-foreground">{macros.protein || 0}</Text>
          <Text className="text-xs text-muted-foreground">g proteína</Text>
          <Text className="text-xs text-blue-500 font-medium">{proteinPercentage}%</Text>
        </View>

        {/* Carbs Card */}
        <View className="bg-card rounded-xl border border-border p-2 w-[31%] items-center">
          <View className="w-8 h-8 bg-yellow-500/10 rounded-full items-center justify-center mb-1">
            <Feather name="box" size={16} color="#eab308" />
          </View>
          <Text className="text-base font-bold text-foreground">{macros.carbs || 0}</Text>
          <Text className="text-xs text-muted-foreground">g carboidratos</Text>
          <Text className="text-xs text-yellow-500 font-medium">{carbsPercentage}%</Text>
        </View>

        {/* Fats Card */}
        <View className="bg-card rounded-xl border border-border p-2 w-[31%] items-center">
          <View className="w-8 h-8 bg-red-500/10 rounded-full items-center justify-center mb-1">
            <Feather name="droplet" size={16} color="#ef4444" />
          </View>
          <Text className="text-base font-bold text-foreground">{macros.fat || 0}</Text>
          <Text className="text-xs text-muted-foreground">g gorduras</Text>
          <Text className="text-xs text-red-500 font-medium">{fatPercentage}%</Text>
        </View>
      </View>

      {!compact && (
        <View className="h-4 flex-row rounded-full overflow-hidden">
          <View className="h-full bg-blue-500" style={{ width: `${proteinPercentage}%` }} />
          <View className="h-full bg-yellow-500" style={{ width: `${carbsPercentage}%` }} />
          <View className="h-full bg-red-500" style={{ width: `${fatPercentage}%` }} />
        </View>
      )}
    </View>
  );
}

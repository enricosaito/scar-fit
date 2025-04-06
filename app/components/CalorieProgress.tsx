// app/components/CalorieProgress.tsx
import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

interface CalorieProgressProps {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  compact?: boolean;
}

export default function CalorieProgress({
  current,
  goal,
  size = 120,
  strokeWidth = 10,
  compact = false,
}: CalorieProgressProps) {
  const { colors } = useTheme();

  // Calculate percentage
  const percentage = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  // Calculate circle properties
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

      {/* Center Text */}
      <View className="absolute items-center">
        <Text className={compact ? "text-xl font-bold text-foreground" : "text-3xl font-bold text-foreground"}>
          {Math.round(current)}
        </Text>
        <Text className="text-xs text-muted-foreground">/{Math.round(goal)} kcal</Text>
      </View>
    </View>
  );
}

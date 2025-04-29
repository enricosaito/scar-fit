import React from "react";
import { View, Text } from "react-native";

interface CalorieTagProps {
  calories: number;
}

/**
 * A reusable component for displaying calorie information
 * @param calories - The number of calories to display
 */
export const CalorieTag: React.FC<CalorieTagProps> = ({ calories }) => {
  return (
    <View
      className="rounded-md px-2 py-0.5 mr-2 flex-row items-center justify-center"
      style={{ backgroundColor: "#3b82f680" }}
    >
      <Text className="text-xs font-medium text-white">{calories} kcal</Text>
    </View>
  );
};

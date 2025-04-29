import React from "react";
import { View, Text } from "react-native";

interface MacroTagProps {
  value: string | number;
  color: string;
  label: string;
  textColor?: string;
}

/**
 * A reusable component for displaying macro nutrient information
 * @param value - The numeric value of the macro
 * @param color - The background color of the tag
 * @param label - The label text (e.g. "prot.", "carb.", "gord.")
 * @param textColor - Optional text color, defaults to white
 */
export const MacroTag: React.FC<MacroTagProps> = ({ value, color, label, textColor = "white" }) => {
  return (
    <View
      className="rounded-md px-2 py-0.5 mr-2 flex-row items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <Text className="text-xs font-medium" style={{ color: textColor }}>
        {value}g {label}
      </Text>
    </View>
  );
};

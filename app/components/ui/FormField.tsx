// app/components/ui/FormField.tsx
import React, { forwardRef } from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

const FormField = forwardRef<TextInput, FormFieldProps>(({ label, error, hint, className = "", ...props }, ref) => {
  const { colors } = useTheme();

  return (
    <View className={`mb-4 ${className}`}>
      <Text className="font-medium text-foreground mb-2" accessibilityRole="text">
        {label}
      </Text>

      <TextInput
        ref={ref}
        className={`border ${error ? "border-red-500" : "border-border"} bg-card text-foreground rounded-md px-3 py-2`}
        placeholderTextColor={colors.mutedForeground}
        accessibilityRole="text"
        accessibilityLabel={label}
        {...props}
      />

      {error ? (
        <Text className="text-red-500 text-xs mt-1" accessibilityRole="text">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-xs text-muted-foreground mt-1" accessibilityRole="text">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

// Add display name for debugging
FormField.displayName = "FormField";

export default FormField;

// app/components/ui/AppleSignInButton.tsx
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View, Platform } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AppleSignInButtonProps {
  onPress: () => Promise<void>;
  loading?: boolean;
  text?: string;
  disabled?: boolean;
}

const AppleSignInButton = ({
  onPress,
  loading = false,
  text = "Entrar com Apple",
  disabled = false,
}: AppleSignInButtonProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      className="flex-row items-center justify-center bg-card border border-border rounded-lg py-3 mb-6"
      onPress={onPress}
      disabled={loading || disabled}
      accessibilityLabel={text}
      accessibilityRole="button"
      accessibilityState={{ disabled: loading || disabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.foreground} style={{ marginRight: 8 }} />
      ) : (
        <MaterialCommunityIcons name="apple" size={20} color={colors.foreground} />
      )}
      <Text className="text-foreground font-medium ml-2">{loading ? "Processando..." : text}</Text>
    </TouchableOpacity>
  );
};

export default AppleSignInButton;

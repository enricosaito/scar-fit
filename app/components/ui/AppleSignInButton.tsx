// app/components/ui/AppleSignInButton.tsx
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View, Platform, Image } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useTheme } from "../../context/ThemeContext";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

interface AppleSignInButtonProps {
  onPress: () => Promise<void>;
  loading?: boolean;
  text?: string;
}

const AppleSignInButton = ({ onPress, loading = false, text = "Entrar com Apple" }: AppleSignInButtonProps) => {
  const { colors } = useTheme();

  // On iOS, we'll now use a custom button to match Google's style
  return (
    <TouchableOpacity
      className="flex-row items-center justify-center bg-card border border-border rounded-lg py-3 mb-6"
      onPress={onPress}
      disabled={loading}
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

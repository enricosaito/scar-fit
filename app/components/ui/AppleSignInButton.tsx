// app/components/ui/AppleSignInButton.tsx
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useTheme } from "../../context/ThemeContext";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

interface AppleSignInButtonProps {
  onPress: () => Promise<void>;
  loading?: boolean;
  text?: string;
}

const AppleSignInButton = ({ onPress, loading = false, text = "Continuar com Apple" }: AppleSignInButtonProps) => {
  const { colors } = useTheme();

  // On iOS, use the native Apple Authentication button if available
  if (Platform.OS === "ios") {
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={8}
        style={styles.appleButton}
        onPress={onPress}
      />
    );
  }

  // Custom button for other platforms
  return (
    <TouchableOpacity
      className="flex-row items-center justify-center bg-card border border-border rounded-lg py-3 mb-6"
      style={{ backgroundColor: "#000" }}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
      ) : (
        <MaterialCommunityIcons name="apple-ios" size={20} color="#FFF" />
      )}
      <Text className="text-white font-medium ml-2">{loading ? "Processando..." : text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  appleButton: {
    width: "100%",
    height: 48,
    marginBottom: 24, // Equivalent to mb-6 in Tailwind
  },
});

export default AppleSignInButton;

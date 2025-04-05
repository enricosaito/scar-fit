// app/components/auth/AuthGuard.tsx - Update with simulator bypass
import React, { useEffect } from "react";
import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { shouldBypassNetworkChecks } from "../../lib/networkBypass";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();

  // Check if we should bypass auth checks in dev mode
  const bypassAuth = shouldBypassNetworkChecks() && __DEV__;

  useEffect(() => {
    if (!initialized) return;

    // Skip auth checks in simulator dev mode if needed
    if (bypassAuth) {
      console.log("Development mode: Bypassing auth checks in simulator");
      return;
    }

    const inAuthGroup = segments[0] === "auth";

    if (!user && !inAuthGroup) {
      // Redirect to login if user is not authenticated and not in auth group
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      // Redirect to home if user is authenticated and in auth group
      router.replace("/(tabs)");
    }
  }, [user, initialized, segments, bypassAuth]);

  if (!initialized) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // In dev mode on simulator, provide a bypass option
  if (bypassAuth && !user && segments[0] !== "auth") {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-yellow-500/20 p-4 m-4 rounded-lg">
          <Text className="text-yellow-500 mb-2">Modo Desenvolvimento (Simulador)</Text>
          <Text className="text-yellow-400 mb-4">
            Você está em um simulador no modo de desenvolvimento. A autenticação normal pode falhar devido a limitações
            do simulador.
          </Text>
          <TouchableOpacity
            className="bg-green-800/50 py-2 px-4 rounded-lg"
            onPress={() => router.replace("/auth/login")}
          >
            <Text className="text-green-400 text-center">Ir para Login</Text>
          </TouchableOpacity>
        </View>
        {children}
      </View>
    );
  }

  return <>{children}</>;
}

// app/components/auth/AuthGuard.tsx (updated)
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized, userProfile } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "screens" && segments[1] === "onboarding";

    if (!user && !inAuthGroup) {
      // Redirect to login if user is not authenticated and not in auth group
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      // Redirect to home if user is authenticated and in auth group
      router.replace("/(tabs)");
    } else if (user && !userProfile?.macros && !inOnboarding && !inAuthGroup) {
      // Redirect to onboarding if user is authenticated but doesn't have macros set
      router.replace("/screens/onboarding");
    }
  }, [user, initialized, segments, userProfile]);

  if (!initialized) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

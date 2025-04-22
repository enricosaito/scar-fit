// app/components/auth/AuthGuard.tsx
import React, { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { View, ActivityIndicator, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized, userProfile, loading, profileLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();
  const [navigated, setNavigated] = useState(false);

  // Clean approach that minimizes state changes and navigation attempts
  useEffect(() => {
    // Only proceed if fully initialized and not currently navigating
    if (!initialized || loading || profileLoading || navigated) {
      return;
    }

    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "screens" && segments[1] === "onboarding";
    const hasMacros = !!(userProfile?.macros && Object.keys(userProfile?.macros || {}).length > 0);

    // Store navigation decision in a single variable
    let shouldNavigateTo = null;

    // Determine if we need to navigate
    if (!user && !inAuthGroup) {
      shouldNavigateTo = "/auth/login";
    } else if (user && inAuthGroup) {
      shouldNavigateTo = "/(tabs)";
    } else if (user && !hasMacros && !inOnboarding && !inAuthGroup) {
      shouldNavigateTo = "/screens/onboarding";
    }

    // Only attempt navigation if absolutely necessary
    if (shouldNavigateTo) {
      console.log(`AuthGuard: Navigating to ${shouldNavigateTo}`);
      setNavigated(true);

      // Use a timeout to ensure component is fully mounted
      setTimeout(() => {
        try {
          router.replace(shouldNavigateTo);
        } catch (error) {
          console.error("Navigation error:", error);
        }

        // Reset navigation flag after a delay to allow for next check
        setTimeout(() => {
          setNavigated(false);
        }, 1000);
      }, 100);
    }
  }, [initialized, loading, profileLoading, user, userProfile, segments, navigated]);

  // Simple loading screen
  if (!initialized || loading || profileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-foreground mt-4">Carregando...</Text>
      </View>
    );
  }

  // Render app content
  return <>{children}</>;
}

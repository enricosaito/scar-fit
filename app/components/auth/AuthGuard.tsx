// app/components/auth/AuthGuard.tsx
import React, { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { View, ActivityIndicator, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized, userProfile, loading, profileLoading, onboardingCompleted } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();
  const [navigated, setNavigated] = useState(false);

  // Clean approach that minimizes state changes and navigation attempts
  useEffect(() => {
    // Only proceed if fully initialized and not currently navigating
    if (!initialized || navigated) {
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
    } else if (user && !hasMacros && !inOnboarding && !onboardingCompleted && !inAuthGroup) {
      // Only redirect to onboarding if the user doesn't have macros AND onboarding is not completed
      shouldNavigateTo = "/screens/onboarding";
    }

    // Only attempt navigation if absolutely necessary
    if (shouldNavigateTo) {
      console.log(`AuthGuard: Navigating to ${shouldNavigateTo}`);
      setNavigated(true);

      // Use a timeout to ensure component is fully mounted
      setTimeout(() => {
        try {
          // Cast the path to any to fix TypeScript error
          router.replace(shouldNavigateTo as any);
        } catch (error) {
          console.error("Navigation error:", error);
        }

        // Reset navigation flag after a delay to allow for next check
        setTimeout(() => {
          setNavigated(false);
        }, 1000);
      }, 100);
    }
  }, [initialized, user, userProfile, segments, navigated, onboardingCompleted]);

  // Always render the children instead of showing a full-screen loading state
  // This allows the current screen to be visible during login/logout transitions
  return <>{children}</>;
}

// app/components/auth/AuthGuard.tsx (simplified to keep users on current screen)
import React, { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized, userProfile, loading, profileLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // In AuthGuard.tsx
  useEffect(() => {
    // Don't do anything until fully initialized and not in a loading state
    if (!initialized || loading || profileLoading) {
      console.log(
        "AuthGuard: Not ready yet. initialized:",
        initialized,
        "loading:",
        loading,
        "profileLoading:",
        profileLoading
      );
      return;
    }

    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "screens" && segments[1] === "onboarding";

    // Check if user has macros already configured
    const hasMacros = userProfile?.macros && Object.keys(userProfile?.macros || {}).length > 0;

    console.log(
      "AuthGuard: Evaluating navigation. user:",
      !!user,
      "inAuthGroup:",
      inAuthGroup,
      "hasMacros:",
      hasMacros
    );

    // Only perform navigation if not already on the correct screen
    if (!user && !inAuthGroup) {
      console.log("AuthGuard: Redirecting to login");
      // Not logged in and not on auth screen - go to login
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      console.log("AuthGuard: Redirecting to home");
      // Logged in but on auth screen - go to home
      router.replace("/(tabs)");
    } else if (user && !hasMacros && !inOnboarding && !inAuthGroup) {
      console.log("AuthGuard: Redirecting to onboarding");
      // Logged in, no macros, not on onboarding - go to onboarding
      router.replace("/screens/onboarding");
    }
  }, [initialized, loading, profileLoading, user, userProfile, segments]);

  // Just render children - no loading screen
  return <>{children}</>;
}

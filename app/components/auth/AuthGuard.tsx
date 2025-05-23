// app/components/auth/AuthGuard.tsx
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { batchPreloadAvatarImages } from "../../utils/imageUpload";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized, userProfile, loading, profileLoading, onboardingCompleted } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [navigated, setNavigated] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Using a ref to track the last preloaded avatar URL to avoid redundant preloads
  const lastPreloadedUrl = useRef<string | undefined | null>(null);

  // Preload avatar when component mounts or when userProfile changes
  // Use a small delay to let the UI load first
  useEffect(() => {
    if (userProfile?.avatar_url && userProfile.avatar_url !== lastPreloadedUrl.current) {
      // Set a small delay to let the UI load first
      const timer = setTimeout(() => {
        // Batch preload the avatar image
        batchPreloadAvatarImages([userProfile.avatar_url])
          .then(() => {
            lastPreloadedUrl.current = userProfile.avatar_url;
          })
          .catch((err) => console.error("Error preloading avatar in AuthGuard:", err));
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [userProfile?.avatar_url]);

  // Handle routing logic
  useEffect(() => {
    // Only proceed if fully initialized, profile is loaded, and not currently navigating
    if (!initialized || profileLoading || navigated) {
      return;
    }

    const inAuthGroup = segments[0] === "auth";
    const isPublicScreen =
      segments[0] === "screens" && (segments[1] === "PrivacyPolicy" || segments[1] === "AboutScreen");

    const inOnboarding = segments[0] === "screens" && segments[1] === "onboarding";
    const hasMacros = !!(userProfile?.macros && Object.keys(userProfile?.macros || {}).length > 0);

    console.log("AuthGuard State:", {
      user: !!user,
      initialized,
      onboardingCompleted,
      hasMacros,
      currentPath: segments.join("/"),
      inAuthGroup,
      inOnboarding,
      profileLoading,
      userProfileLoaded: !!userProfile,
    });

    // Store navigation decision in a single variable
    let shouldNavigateTo = null;

    // Determine if we need to navigate
    if (!user && !inAuthGroup && !isPublicScreen) {
      shouldNavigateTo = "/auth/WelcomeScreen";
    } else if (user && inAuthGroup) {
      shouldNavigateTo = "/(tabs)";
    } else if (user && !onboardingCompleted && !inOnboarding && !inAuthGroup) {
      // Only redirect to onboarding if onboarding is not completed
      shouldNavigateTo = "/screens/onboarding";
    }

    // Only attempt navigation if absolutely necessary
    if (shouldNavigateTo) {
      console.log(`AuthGuard: Navigating to ${shouldNavigateTo}`);
      setNavigated(true);

      // Use a timeout to ensure component is fully mounted
      setTimeout(() => {
        try {
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

    // Mark first render as complete
    if (isFirstRender) {
      setIsFirstRender(false);
    }
  }, [initialized, user, userProfile, segments, navigated, onboardingCompleted, isFirstRender, profileLoading]);

  // Don't render anything until we've completed the first routing check
  if (isFirstRender) {
    return null;
  }

  return <>{children}</>;
}

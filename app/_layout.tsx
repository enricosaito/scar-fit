// app/_layout.tsx
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AddMenuProvider } from "./context/AddMenuContext";
import { ToastProvider } from "./context/ToastContext";
import AuthGuard from "./components/auth/AuthGuard";
import AddMenu from "./components/tracking/AddMenu";
import "../global.css";
import * as Linking from "expo-linking";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import InitialLoadingScreen from "./components/ui/InitialLoadingScreen";
import { View, Animated } from "react-native";

import {
  Manrope_200ExtraLight,
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { initialized } = useAuth();
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (initialized) {
      // Add a small delay for smooth transition
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowLoadingScreen(false);
        });
      }, 500);
    }
  }, [initialized, fadeAnim]);

  useEffect(() => {
    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      console.log("Deep link detected:", url);
      if (url.includes("auth/callback")) {
        console.log("Auth callback detected");
      }
    });
    return () => {
      linkingSubscription.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {showLoadingScreen && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: fadeAnim,
            zIndex: 1,
          }}
        >
          <InitialLoadingScreen />
        </Animated.View>
      )}
      <AuthGuard>
        <StatusBar style="light" />
        <AddMenu />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="screens/profile/ViewProfile" />
          <Stack.Screen name="screens/profile/EditProfile" />
          <Stack.Screen name="screens/profile/CustomGoal" />
          <Stack.Screen name="screens/NotificationsTab" />
          <Stack.Screen name="screens/ManageMeals" options={{ presentation: "modal" }} />
          <Stack.Screen name="screens/AddFoodSearch" />
          <Stack.Screen name="screens/AddFoodVoice" />
          <Stack.Screen name="screens/AddFoodBarcode" options={{ headerShown: false }} />
          <Stack.Screen name="screens/BarcodeScanner" options={{ headerShown: false }} />
          <Stack.Screen name="screens/ProSubscription" />
          <Stack.Screen name="screens/onboarding/index" />
          <Stack.Screen name="screens/LogExercise" />
          <Stack.Screen name="screens/AboutScreen" />
          <Stack.Screen name="screens/PrivacyPolicy" />
          <Stack.Screen name="auth" />
        </Stack>
      </AuthGuard>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Manrope-ExtraLight": Manrope_200ExtraLight,
    "Manrope-Light": Manrope_300Light,
    "Manrope-Regular": Manrope_400Regular,
    "Manrope-Medium": Manrope_500Medium,
    "Manrope-SemiBold": Manrope_600SemiBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-ExtraBold": Manrope_800ExtraBold,
  });

  useEffect(() => {
    const prepare = async () => {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    };
    prepare();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AddMenuProvider>
              <AppContent />
            </AddMenuProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

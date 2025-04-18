// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AddMenuProvider } from "./context/AddMenuContext";
import AuthGuard from "./components/auth/AuthGuard";
import AddMenu from "./components/tracking/AddMenu";
import "../global.css";
import * as Linking from "expo-linking";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Manrope-ExtraLight": Manrope_200ExtraLight,
    "Manrope-Light": Manrope_300Light,
    "Manrope-Regular": Manrope_400Regular,
    "Manrope-Medium": Manrope_500Medium,
    "Manrope-SemiBold": Manrope_600SemiBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-ExtraBold": Manrope_800ExtraBold,
  });

  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    hideSplash();
  }, [fontsLoaded]);

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <AddMenuProvider>
            <AuthGuard>
              <StatusBar style="light" />
              <AddMenu />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="screens/profile/profile" />
                <Stack.Screen name="screens/profile/edit" />
                <Stack.Screen name="screens/profile/password" />
                <Stack.Screen name="screens/notifications" />
                <Stack.Screen name="screens/tracking" options={{ presentation: "modal" }} />
                <Stack.Screen name="screens/food-tracker" />
                <Stack.Screen name="screens/exercise" />
                <Stack.Screen name="screens/pro-subscription" />
                <Stack.Screen name="screens/onboarding/index" />
                <Stack.Screen name="screens/voice-food-logger" />
                <Stack.Screen name="screens/barcode-scanner" options={{ headerShown: false }} />
                <Stack.Screen name="screens/barcode-product" options={{ headerShown: false }} />
                <Stack.Screen name="auth" />
              </Stack>
            </AuthGuard>
          </AddMenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

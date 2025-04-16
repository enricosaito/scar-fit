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
// Import font hooks and splash screen
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
// Import Manrope fonts
import {
  Manrope_200ExtraLight,
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load fonts
  const [fontsLoaded] = useFonts({
    "Manrope-ExtraLight": Manrope_200ExtraLight,
    "Manrope-Light": Manrope_300Light,
    "Manrope-Regular": Manrope_400Regular,
    "Manrope-Medium": Manrope_500Medium,
    "Manrope-SemiBold": Manrope_600SemiBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-ExtraBold": Manrope_800ExtraBold,
  });

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    hideSplash();
  }, [fontsLoaded]);

  // Deep link handling - MOVED BEFORE conditional return
  useEffect(() => {
    // Set up deep link handler
    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      console.log("Deep link detected:", url);
      // Handle the deep link if needed
      if (url.includes("auth/callback")) {
        console.log("Auth callback detected");
      }
    });
    return () => {
      linkingSubscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null; // Still loading fonts
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
                <Stack.Screen name="auth" />
              </Stack>
            </AuthGuard>
          </AddMenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

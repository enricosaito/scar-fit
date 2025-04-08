// app/_layout.tsx (updated)
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AddMenuProvider } from "./context/AddMenuContext";
import { ToastProvider } from "./context/ToastContext";
import AuthGuard from "./components/auth/AuthGuard";
import AddMenu from "./components/tracking/AddMenu";
import "../global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AddMenuProvider>
          <ToastProvider>
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
                <Stack.Screen name="auth" />
              </Stack>
            </AuthGuard>
          </ToastProvider>
        </AddMenuProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// app/_layout.tsx (updated)
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AddMenuProvider } from "./context/AddMenuContext";
import AuthGuard from "./components/auth/AuthGuard";
import AddMenu from "./components/AddMenu";
import "../global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AddMenuProvider>
          <AuthGuard>
            <StatusBar style="light" />
            <AddMenu />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="profile/edit" />
              <Stack.Screen name="profile/password" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="tracking" options={{ presentation: "modal" }} />
              <Stack.Screen name="food-tracker" /> 
              <Stack.Screen name="exercise" />
              <Stack.Screen name="pro-subscription" />
              <Stack.Screen name="auth" />
            </Stack>
          </AuthGuard>
        </AddMenuProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
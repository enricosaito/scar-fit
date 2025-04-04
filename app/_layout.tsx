// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import "../global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="profile"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="tracking"
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
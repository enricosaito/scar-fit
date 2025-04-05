// app/auth/login.tsx
import React, { useState } from "react";
import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import ENV from "../lib/env";
import { shouldBypassNetworkChecks } from "../lib/networkBypass";

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  // Check if we're in a simulator
  const isInSimulator =
    Platform.OS === "ios" && !Platform.isPad && !Platform.isTV && Platform.constants.uiMode === undefined;

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      // Skip network checks for simulators in development
      if (shouldBypassNetworkChecks()) {
        console.log("Development mode: Bypassing network checks in simulator");
        setConnectionStatus("Simulador detectado: modo desenvolvimento");
      }

      const { error } = await signIn(email, password);

      if (error) {
        // Special handling for network errors in simulator
        if (isInSimulator && error.message.includes("network")) {
          setErrorMessage("Erro de rede no simulador. Tente usar um dispositivo físico.");

          // In dev mode, you might want to bypass and continue
          if (__DEV__ && email === "test@example.com") {
            console.log("Development bypass: proceeding despite network error");
            router.replace("/(tabs)");
            return;
          }
        } else if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Email ou senha incorretos.");
        } else {
          setErrorMessage(error.message || "Erro ao fazer login.");
        }
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView className="flex-1 px-4">
          <View className="py-10 items-center mb-6">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
              <Feather name="activity" size={36} color="white" />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">Scar Fit</Text>
            <Text className="text-muted-foreground text-center">Sua saúde em primeiro lugar</Text>
          </View>

          <Text className="text-2xl font-bold text-foreground mb-6">Login</Text>

          {/* Simulator notice */}
          {isInSimulator && (
            <View className="mb-4 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
              <Text className="text-yellow-500">
                Você está usando um simulador iOS. Problemas de rede são comuns em simuladores.
                {__DEV__ ? " Modo desenvolvimento ativado." : ""}
              </Text>
            </View>
          )}

          {errorMessage ? (
            <View className="mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
              <Text className="text-red-500">{errorMessage}</Text>
            </View>
          ) : null}

          {connectionStatus ? (
            <View className="mb-4 bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
              <Text className="text-blue-500">{connectionStatus}</Text>
            </View>
          ) : null}

          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            secureTextEntry
          />

          <Button className="mb-4" onPress={handleLogin} disabled={loading || authLoading}>
            {loading || authLoading ? <ActivityIndicator size="small" color="white" /> : "Entrar"}
          </Button>

          <TouchableOpacity className="mb-6" onPress={() => router.push("/auth/forgot-password")}>
            <Text className="text-primary text-center">Esqueci minha senha</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-muted-foreground">Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text className="text-primary font-medium">Registre-se</Text>
            </TouchableOpacity>
          </View>

          {/* Development bypass button */}
          {__DEV__ && isInSimulator && (
            <TouchableOpacity
              className="mt-8 bg-green-800/50 py-3 px-4 rounded-lg"
              onPress={() => {
                console.log("Development mode: bypassing authentication");
                router.replace("/(tabs)");
              }}
            >
              <Text className="text-green-400 text-center font-medium">Bypass Login (Somente Dev)</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

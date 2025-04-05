// app/auth/login.tsx - Use the new devBypass method

import React, { useState } from "react";
import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { isRunningInSimulator } from "../lib/utils";

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn, loading, devBypass } = useAuth(); // Get the devBypass method

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setErrorMessage(error.message || "Erro ao fazer login. Tente novamente.");
      } else {
        // Redirect to home on successful login
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ocorreu um erro inesperado. Tente novamente.");
    }
  };

  // Development bypass function
  const handleDevBypass = () => {
    // Use the devBypass method from AuthContext
    devBypass();

    // Then navigate to the home screen
    router.replace("/(tabs)");
  };

  // Check if we should show the dev bypass button
  const showDevBypass = isRunningInSimulator();

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

          {errorMessage ? (
            <View className="mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
              <Text className="text-red-500">{errorMessage}</Text>
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

          <Button className="mb-4" onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="white" /> : "Entrar"}
          </Button>

          <TouchableOpacity className="mb-6" onPress={() => router.push("/auth/forgot-password")}>
            <Text className="text-primary text-center">Esqueci minha senha</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mb-10">
            <Text className="text-muted-foreground">Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text className="text-primary font-medium">Registre-se</Text>
            </TouchableOpacity>
          </View>

          {/* Dev Bypass Button - Only shown in iOS simulator and at the bottom */}
          {showDevBypass && (
            <View className="mt-auto pt-10 mb-4">
              <Button
                variant="outline"
                className="border-orange-500 bg-orange-500/10"
                textClassName="text-orange-500"
                onPress={handleDevBypass}
              >
                DEV: Ignorar Login (Apenas Simulador)
              </Button>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

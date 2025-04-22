// app/auth/login.tsx
import React, { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { supabase } from "../lib/supabase";

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn, signInWithGoogle } = useAuth();

  const [loading, setLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage("");
      console.log("Starting Google login flow...");

      // Show loading state
      setLoading(true);

      const { error } = await signInWithGoogle();

      if (error) {
        console.error("Google login error:", error);
        setErrorMessage(error.message || "Erro ao fazer login com Google. Tente novamente.");
        setLoading(false);
        return;
      }

      console.log("Google login successful, checking auth state...");

      // Check if we're actually signed in
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session:", sessionData?.session ? "Exists" : "None");

      if (sessionData?.session) {
        console.log("Session exists, redirecting...");
        // This ensures navigation happens if the auth state change doesn't trigger
        router.replace("/(tabs)");
      } else {
        console.log("No session found after successful flow");
        setErrorMessage("Login com Google bem-sucedido, mas a sessão não foi criada. Tente novamente.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView className="flex-1 px-4">
          <View className="py-10 items-center mb-6">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
              <Feather name="zap" size={36} color="white" />
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

          {/* Social Login Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-muted-foreground">ou continue com</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Google Sign-in Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-card border border-border rounded-lg py-3 mb-6"
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Image
              source={require("../../assets/images/google-logo.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
            <Text className="text-foreground font-medium ml-2">Entrar com Google</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-muted-foreground">Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text className="text-primary font-medium">Registre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

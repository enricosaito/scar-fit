// app/auth/LoginScreen.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import AppleSignInButton from "../components/ui/AppleSignInButton";
import FormField from "../components/ui/FormField";
import ErrorMessage from "../components/ui/ErrorMessage";

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn, signInWithGoogle, signInWithApple, isAppleAuthAvailable } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  // Form state
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Loading states centralized
  const [loading, setLoading] = useState({
    login: false,
    google: false,
    apple: false,
    anyLoading: false, // Derived property for "any loading state active"
  });

  // Error states
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  // Platform feature availability
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  // Update loading.anyLoading when any specific loading state changes
  useEffect(() => {
    setLoading((prev) => ({
      ...prev,
      anyLoading: prev.login || prev.google || prev.apple,
    }));
  }, [loading.login, loading.google, loading.apple]);

  // Check Apple authentication availability
  useEffect(() => {
    const checkAppleAuth = async () => {
      const available = await isAppleAuthAvailable();
      setAppleAuthAvailable(available);
    };

    checkAppleAuth();
  }, []);

  // Form input handlers with error clearing
  const handleInputChange = useCallback((field: "email" | "password", value: string) => {
    // Clear error for this field when user types
    setErrors((prev) => ({ ...prev, [field]: "", general: "" }));
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Validate email format
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validate form before submission
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newErrors = { email: "", password: "", general: "" };

    // Check email
    if (!form.email.trim()) {
      newErrors.email = "Email é obrigatório";
      isValid = false;
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Formato de email inválido";
      isValid = false;
    }

    // Check password
    if (!form.password) {
      newErrors.password = "Senha é obrigatória";
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [form, validateEmail]);

  // Login handler with validation
  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();

    if (!validateForm()) return;

    setLoading((prev) => ({ ...prev, login: true }));

    try {
      const { error } = await signIn(form.email, form.password);

      if (error) {
        // Determine the appropriate error message
        if (error.message?.includes("Invalid login credentials")) {
          setErrors({
            email: "",
            password: "",
            general: "Email ou senha incorretos. Tente novamente.",
          });
        } else {
          setErrors({
            email: "",
            password: "",
            general: error.message || "Erro ao fazer login. Tente novamente.",
          });
        }
      }
      // Don't redirect here - let AuthGuard handle it
    } catch (error: any) {
      setErrors({
        email: "",
        password: "",
        general: error.message || "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, login: false }));
    }
  }, [form, validateForm, signIn]);

  // Generic social login handler
  const handleSocialLogin = useCallback(
    async (provider: "google" | "apple") => {
      Keyboard.dismiss();

      // Clear any previous errors
      setErrors({ email: "", password: "", general: "" });

      // Set the appropriate loading state
      setLoading((prev) => ({
        ...prev,
        [provider]: true,
      }));

      try {
        const { error } = provider === "google" ? await signInWithGoogle() : await signInWithApple();

        if (error) {
          console.error(`${provider} login error:`, error);
          setErrors({
            email: "",
            password: "",
            general:
              error.message ||
              `Erro ao fazer login com ${provider === "google" ? "Google" : "Apple"}. Tente novamente.`,
          });
        }
        // Don't redirect or check session - let AuthGuard handle navigation
      } catch (error: any) {
        console.error("Unexpected error:", error);
        setErrors({
          email: "",
          password: "",
          general: "Ocorreu um erro inesperado. Tente novamente.",
        });
      } finally {
        setLoading((prev) => ({
          ...prev,
          [provider]: false,
        }));
      }
    },
    [signInWithGoogle, signInWithApple]
  );

  const handleForgotPassword = useCallback(() => {
    router.push("/auth/ForgotPassword");
  }, [router]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="py-10 items-center mb-4">
            <Image
              source={require("../../assets/images/SCARFIT_LOGO_W.png")}
              style={{ width: 80, height: 80, marginBottom: 16 }}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="Logo Scar Fit"
            />
            <Text className="text-3xl font-bold text-foreground mb-2">Scar Fit</Text>
            <Text className="text-muted-foreground text-center">Sua saúde em primeiro lugar</Text>
          </View>

          <Text className="text-2xl font-bold text-foreground mb-6">Login</Text>

          {errors.general ? <ErrorMessage message={errors.general} /> : null}

          <FormField
            label="Email"
            value={form.email}
            onChangeText={(text) => handleInputChange("email", text)}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={errors.email}
            blurOnSubmit={false}
            accessibilityLabel="Campo de email"
            accessibilityHint="Digite seu endereço de email"
          />

          <FormField
            ref={passwordRef}
            label="Senha"
            value={form.password}
            onChangeText={(text) => handleInputChange("password", text)}
            placeholder="Sua senha"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            error={errors.password}
            accessibilityLabel="Campo de senha"
            accessibilityHint="Digite sua senha"
          />

          <Button
            className="mb-4"
            onPress={handleLogin}
            disabled={loading.anyLoading}
            accessibilityLabel="Botão de login"
            accessibilityHint="Clique para entrar na sua conta"
          >
            {loading.login ? <ActivityIndicator size="small" color="white" /> : "Entrar"}
          </Button>

          <TouchableOpacity
            className="mb-6"
            onPress={handleForgotPassword}
            disabled={loading.anyLoading}
            accessibilityLabel="Esqueci minha senha"
            accessibilityRole="button"
          >
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
            onPress={() => handleSocialLogin("google")}
            disabled={loading.anyLoading}
            accessibilityLabel="Entrar com Google"
            accessibilityRole="button"
          >
            {loading.google ? (
              <ActivityIndicator size="small" color={colors.foreground} style={{ marginRight: 8 }} />
            ) : (
              <Image
                source={require("../../assets/images/google-logo.png")}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            )}
            <Text className="text-foreground font-medium ml-2">
              {loading.google ? "Processando..." : "Entrar com Google"}
            </Text>
          </TouchableOpacity>

          {/* Apple Sign-in Button */}
          {appleAuthAvailable && (
            <AppleSignInButton
              onPress={() => handleSocialLogin("apple")}
              loading={loading.apple}
              disabled={loading.anyLoading}
            />
          )}

          {/* Terms and Privacy Policy Agreement */}
          <Text className="text-center text-muted-foreground text-xs mt-2 mb-6 px-4">
            Ao continuar, você concorda com nossos Termos de Serviço e{" "}
            <Text
              className="text-primary"
              onPress={() => router.push("/screens/PrivacyPolicy")}
              accessibilityRole="link"
            >
              Política de Privacidade
            </Text>
            .
          </Text>

          <View className="flex-row justify-center items-center mb-4">
            <Text className="text-muted-foreground">Não tem uma conta? </Text>
            <TouchableOpacity
              onPress={() => router.push("/auth/RegisterScreen")}
              accessibilityLabel="Registre-se"
              accessibilityRole="button"
              disabled={loading.anyLoading}
            >
              <Text className="text-primary font-medium">Registre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

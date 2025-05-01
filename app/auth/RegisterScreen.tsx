// app/auth/register.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
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

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUp, signIn, signInWithGoogle, signInWithApple, isAppleAuthAvailable } = useAuth();

  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [loading, setLoading] = useState({
    register: false,
    google: false,
    apple: false,
    anyLoading: false,
  });

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  // Update loading.anyLoading when any specific loading state changes
  useEffect(() => {
    setLoading((prev) => ({
      ...prev,
      anyLoading: prev.register || prev.google || prev.apple,
    }));
  }, [loading.register, loading.google, loading.apple]);

  // Check Apple authentication availability
  useEffect(() => {
    const checkAppleAuth = async () => {
      const available = await isAppleAuthAvailable();
      setAppleAuthAvailable(available);
    };

    checkAppleAuth();
  }, []);

  const validate = useCallback((): boolean => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    };

    if (!form.email.trim()) {
      newErrors.email = "O email é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Formato de email inválido";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "A senha é obrigatória";
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
      isValid = false;
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [form]);

  const handleInputChange = useCallback((field: "email" | "password" | "confirmPassword", value: string) => {
    setErrors((prev) => ({ ...prev, [field]: "", general: "" }));
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRegister = useCallback(async () => {
    Keyboard.dismiss();

    if (!validate()) return;

    setLoading((prev) => ({ ...prev, register: true }));

    try {
      const { error } = await signUp(form.email, form.password);

      if (error) {
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Erro ao criar conta. Tente novamente.",
        }));
      } else {
        const signInResult = await signIn(form.email, form.password);

        if (!signInResult.error) {
          router.replace("/screens/onboarding");
        } else {
          router.replace("/auth/LoginScreen");
        }
      }
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Ocorreu um erro inesperado. Tente novamente.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, register: false }));
    }
  }, [form, validate, signUp, signIn]);

  const handleSocialRegister = useCallback(
    async (provider: "google" | "apple") => {
      Keyboard.dismiss();

      setErrors((prev) => ({ ...prev, general: "" }));
      setLoading((prev) => ({ ...prev, [provider]: true }));

      try {
        const { error } = provider === "google" ? await signInWithGoogle() : await signInWithApple();

        if (error) {
          setErrors((prev) => ({
            ...prev,
            general:
              error.message ||
              `Erro ao se cadastrar com ${provider === "google" ? "Google" : "Apple"}. Tente novamente.`,
          }));
        } else {
          router.replace("/screens/onboarding");
        }
      } catch (error: any) {
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [provider]: false }));
      }
    },
    [signInWithGoogle, signInWithApple]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 px-6" onTouchStart={Keyboard.dismiss}>
          <View className="py-6">
            <TouchableOpacity onPress={() => router.back()} className="mb-4 p-2 w-10">
              <Feather name="arrow-left" size={24} color={colors.foreground} />
            </TouchableOpacity>

            <View className="items-center mb-6">
              <Image
                source={require("../../assets/images/SCARFIT_LOGO_W.png")}
                style={{ width: 90, height: 90 }}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="Logo Scar Fit"
              />
              <Text className="text-2xl font-bold text-foreground mb-2">Scar Fit</Text>
              <Text className="text-sm text-muted-foreground text-center px-8">
                Comece sua jornada fitness de forma inteligente
              </Text>
            </View>

            <Text className="text-2xl font-bold text-foreground mb-4">Criar Conta</Text>

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
              error={errors.email}
              accessibilityLabel="Campo de email"
              accessibilityHint="Digite seu endereço de email"
            />

            <FormField
              label="Senha"
              value={form.password}
              onChangeText={(text) => handleInputChange("password", text)}
              placeholder="Crie uma senha"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              error={errors.password}
              accessibilityLabel="Campo de senha"
              accessibilityHint="Digite sua senha"
            />

            <FormField
              label="Confirmar Senha"
              value={form.confirmPassword}
              onChangeText={(text) => handleInputChange("confirmPassword", text)}
              placeholder="Confirme sua senha"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              error={errors.confirmPassword}
              accessibilityLabel="Campo de confirmação de senha"
              accessibilityHint="Digite sua senha novamente"
            />

            <Button
              className="mb-4"
              onPress={handleRegister}
              disabled={loading.anyLoading}
              loading={loading.register}
              loadingText="Criando conta..."
              accessibilityLabel="Criar conta"
              accessibilityHint="Clique para criar sua conta"
            >
              Criar Conta
            </Button>

            {/* Social Login Divider */}
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-muted-foreground">ou continue com</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Google Sign-up Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-card border border-border rounded-lg py-3 mb-4"
              onPress={() => handleSocialRegister("google")}
              disabled={loading.anyLoading}
              accessibilityLabel="Criar conta com Google"
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
                {loading.google ? "Processando..." : "Continuar com Google"}
              </Text>
            </TouchableOpacity>

            {/* Apple Sign-up Button */}
            {appleAuthAvailable && (
              <AppleSignInButton
                onPress={() => handleSocialRegister("apple")}
                loading={loading.apple}
                disabled={loading.anyLoading}
                text="Continuar com Apple"
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

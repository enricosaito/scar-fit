// app/auth/register.tsx
import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import AppleSignInButton from "../components/ui/AppleSignInButton";
import FormField from "../components/ui/FormField";

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUp, signIn, signInWithGoogle, signInWithApple, isAppleAuthAvailable, loading } = useAuth();

  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!email) {
      newErrors.email = "O email é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Formato de email inválido";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "A senha é obrigatória";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    const checkAppleAuth = async () => {
      const available = await isAppleAuthAvailable();
      setAppleAuthAvailable(available);
    };

    checkAppleAuth();
  }, []);

  const handleRegister = async () => {
    // Reset error message
    setErrorMessage("");

    // Validation
    if (!validate()) {
      return;
    }

    try {
      const { error } = await signUp(email, password);

      if (error) {
        setErrorMessage(error.message || "Erro ao criar conta. Tente novamente.");
      } else {
        const signInResult = await signIn(email, password);

        if (!signInResult.error) {
          router.replace("/screens/onboarding");
        } else {
          router.replace("/auth/LoginScreen");
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ocorreu um erro inesperado. Tente novamente.");
    }
  };

  const handleAppleSignUp = async () => {
    try {
      setErrorMessage("");
      setAppleLoading(true);

      const { error } = await signInWithApple();

      if (error) {
        setErrorMessage(error.message || "Erro ao se cadastrar com Apple. Tente novamente.");
      } else {
        // Redirect to onboarding
        router.replace("/screens/onboarding");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setErrorMessage("");
      const { error } = await signInWithGoogle();

      if (error) {
        setErrorMessage(error.message || "Erro ao se cadastrar com Google. Tente novamente.");
      } else {
        // Redirect to onboarding (or home with AuthGuard handling)
        router.replace("/screens/onboarding");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ocorreu um erro inesperado. Tente novamente.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4">
        <View className="py-10 items-center mb-6">
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
            <Feather name="activity" size={36} color="white" />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">Scar Fit</Text>
          <Text className="text-muted-foreground text-center">Sua saúde em primeiro lugar</Text>
        </View>

        <Text className="text-2xl font-bold text-foreground mb-6">Criar Conta</Text>

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
          error={errors.email}
        />

        <FormField
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Crie uma senha"
          secureTextEntry
          error={errors.password}
        />

        <FormField
          label="Confirmar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirme sua senha"
          secureTextEntry
          error={errors.confirmPassword}
        />

        <Button className="mb-6" onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="white" /> : "Criar Conta"}
        </Button>

        {/* Social Login Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-border" />
          <Text className="mx-4 text-muted-foreground">ou continue com</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* Google Sign-up Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-card border border-border rounded-lg py-3 mb-6"
          onPress={handleGoogleSignUp}
          disabled={loading}
        >
          <Image
            source={require("../../assets/images/google-logo.png")}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
          <Text className="text-foreground font-medium ml-2">Continuar com Google</Text>
        </TouchableOpacity>

        {/* Apple Sign-up Button */}
        {appleAuthAvailable && (
          <AppleSignInButton onPress={handleAppleSignUp} loading={appleLoading} text="Continuar com Apple" />
        )}

        <View className="flex-row justify-center items-center">
          <Text className="text-muted-foreground">Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/LoginScreen")}>
            <Text className="text-primary font-medium">Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

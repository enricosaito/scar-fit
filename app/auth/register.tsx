// app/auth/register.tsx (updated)
import React, { useState } from "react";
import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUp, signIn, loading } = useAuth(); // <-- Add signIn here

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
        // On success, sign in automatically and redirect to onboarding
        const signInResult = await signIn(email, password);

        if (!signInResult.error) {
          router.replace("/screens/onboarding");
        } else {
          // If sign in fails, just go to login screen
          router.replace("/auth/login");
        }
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

        <View className="flex-row justify-center items-center">
          <Text className="text-muted-foreground">Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text className="text-primary font-medium">Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

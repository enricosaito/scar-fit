// app/auth/register.tsx
import React, { useState } from "react";
import { Text, View, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUp, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const handleRegister = async () => {
    // Reset error message
    setErrorMessage("");
    
    // Validation
    if (!email || !password || !confirmPassword) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setErrorMessage(error.message || "Erro ao criar conta. Tente novamente.");
      } else {
        // On success, show confirmation message or redirect
        router.replace("/auth/login");
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
        
        <View className="mb-4">
          <Text className="font-medium text-foreground mb-2">Email</Text>
          <TextInput
            className="border border-border bg-card text-foreground rounded-md px-3 py-2"
            placeholder="seu@email.com"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        
        <View className="mb-4">
          <Text className="font-medium text-foreground mb-2">Senha</Text>
          <TextInput
            className="border border-border bg-card text-foreground rounded-md px-3 py-2"
            placeholder="Crie uma senha"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        
        <View className="mb-6">
          <Text className="font-medium text-foreground mb-2">Confirmar Senha</Text>
          <TextInput
            className="border border-border bg-card text-foreground rounded-md px-3 py-2"
            placeholder="Confirme sua senha"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        
        <Button
          className="mb-6"
          onPress={handleRegister}
          disabled={loading}
        >
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
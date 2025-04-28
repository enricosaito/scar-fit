// app/auth/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";

export default function ResetPassword() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Check if the necessary URL parameters exist
    if (!params.access_token) {
      setMessage("Link de recuperação inválido ou expirado.");
      setIsError(true);
    }
  }, [params]);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
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
  
  const handleResetPassword = async () => {
    if (!validate()) return;
    
    setLoading(true);
    setMessage("");
    setIsError(false);
    
    try {
      // Use the access token from URL parameters to update the password
      const { error } = await supabase.auth.updateUser({ 
        password: password
      });
      
      if (error) {
        setMessage(error.message || "Erro ao redefinir a senha.");
        setIsError(true);
      } else {
        setMessage("Senha redefinida com sucesso!");
        setIsError(false);
        
        // Redirect to login after success
        setTimeout(() => {
          router.replace("/auth/LoginScreen");
        }, 2000);
      }
    } catch (error: any) {
      setMessage(error.message || "Ocorreu um erro inesperado.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4">
        <View className="py-10 items-center mb-6">
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
            <Feather name="lock" size={36} color="white" />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">Redefinir Senha</Text>
          <Text className="text-muted-foreground text-center">Crie uma nova senha para sua conta</Text>
        </View>
        
        {message ? (
          <View 
            className={`mb-4 p-3 rounded-lg border ${
              isError 
                ? "bg-red-500/10 border-red-500/30" 
                : "bg-green-500/10 border-green-500/30"
            }`}
          >
            <Text className={isError ? "text-red-500" : "text-green-500"}>{message}</Text>
          </View>
        ) : null}
        
        <FormField
          label="Nova Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Digite sua nova senha"
          secureTextEntry
          error={errors.password}
        />
        
        <FormField
          label="Confirmar Nova Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirme sua nova senha"
          secureTextEntry
          error={errors.confirmPassword}
        />
        
        <Button
          className="mb-6"
          onPress={handleResetPassword}
          disabled={loading || !params.access_token}
        >
          {loading ? <ActivityIndicator size="small" color="white" /> : "Redefinir Senha"}
        </Button>
        
        <TouchableOpacity 
          className="flex-row justify-center items-center" 
          onPress={() => router.push("/auth/LoginScreen")}
        >
          <Text className="text-primary font-medium">Voltar para o Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
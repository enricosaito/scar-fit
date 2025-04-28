// app/auth/forgot-password.tsx (updated)
import React, { useState } from "react";
import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";

export default function ForgotPassword() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  
  const handleResetPassword = async () => {
    if (!email) {
      setMessage("Por favor, informe seu email.");
      setIsError(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'scar-fit://reset-password',
      });
      
      if (error) {
        setMessage(error.message || "Erro ao enviar email de recuperação.");
        setIsError(true);
      } else {
        setMessage("Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.");
        setIsError(false);
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
        <View className="py-6">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mb-4 p-2 w-10"
          >
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          
          <Text className="text-2xl font-bold text-foreground mb-2">Recuperar Senha</Text>
          <Text className="text-muted-foreground mb-6">
            Informe seu email e enviaremos um link para redefinir sua senha.
          </Text>
          
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
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Button
            className="mb-6"
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color="white" /> : "Enviar Link de Recuperação"}
          </Button>
          
          <TouchableOpacity 
            className="flex-row justify-center items-center" 
            onPress={() => router.push("/auth/LoginScreen")}
          >
            <Feather name="arrow-left" size={16} color={colors.primary} />
            <Text className="text-primary font-medium ml-1">Voltar para o Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
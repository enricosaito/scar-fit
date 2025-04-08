// app/profile/password.tsx
import React, { useState } from "react";
import { Text, View, SafeAreaView, Pressable, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";

export default function ChangePassword() {
  const router = useRouter();
  const { colors } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = "A senha atual é obrigatória";
    }

    if (!newPassword) {
      newErrors.newPassword = "A nova senha é obrigatória";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "A senha deve ter pelo menos 6 caracteres";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirme sua nova senha";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      // First, try to login with current password to validate it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setMessage("Senha atual incorreta");
        setIsError(true);
        setLoading(false);
        return;
      }

      // Then update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage(error.message || "Erro ao atualizar senha");
        setIsError(true);
      } else {
        setMessage("Senha atualizada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Navigate back after success
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } catch (error: any) {
      setMessage(error.message || "Ocorreu um erro inesperado");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Alterar Senha</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {message ? (
          <View
            className={`mb-4 p-3 rounded-lg border ${
              isError ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"
            }`}
          >
            <Text className={isError ? "text-red-500" : "text-green-500"}>{message}</Text>
          </View>
        ) : null}

        <View className="mb-6">
          <Text className="text-muted-foreground">
            Para alterar sua senha, insira sua senha atual e depois a nova senha.
          </Text>
        </View>

        <FormField
          label="Senha atual"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          error={errors.currentPassword}
          placeholder="Digite sua senha atual"
        />

        <FormField
          label="Nova senha"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          error={errors.newPassword}
          placeholder="Digite sua nova senha"
          hint="Use pelo menos 6 caracteres"
        />

        <FormField
          label="Confirmar nova senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={errors.confirmPassword}
          placeholder="Digite novamente sua nova senha"
        />

        <Button className="mt-4" onPress={handleChangePassword} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="white" /> : "Atualizar Senha"}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

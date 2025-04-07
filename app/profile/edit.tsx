// app/profile/edit.tsx (updated to include password change)
import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, TextInput, Pressable, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../models/user";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import FormField from "../components/ui/FormField";

export default function ProfileEdit() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, userProfile, refreshProfile } = useAuth();

  // Profile info state
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "");
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      await updateUserProfile(user.id, { full_name: fullName });
      await refreshProfile();

      setMessage("Perfil atualizado com sucesso!");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage(error.message || "Erro ao atualizar perfil");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (): boolean => {
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
    if (!validatePassword()) return;

    setPasswordLoading(true);
    setPasswordMessage("");
    setPasswordError(false);

    try {
      // First, try to login with current password to validate it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setPasswordMessage("Senha atual incorreta");
        setPasswordError(true);
        setPasswordLoading(false);
        return;
      }

      // Then update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordMessage(error.message || "Erro ao atualizar senha");
        setPasswordError(true);
      } else {
        setPasswordMessage("Senha atualizada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Hide password section after success
        setTimeout(() => {
          setShowPasswordChange(false);
        }, 1500);
      }
    } catch (error: any) {
      setPasswordMessage(error.message || "Ocorreu um erro inesperado");
      setPasswordError(true);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Editar Perfil</Text>
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

        <View className="mb-6 items-center">
          <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-4">
            <Feather name="user" size={40} color={colors.primary} />
          </View>
          <Pressable>
            <Text className="text-primary">Alterar foto</Text>
          </Pressable>
        </View>

        <View className="mb-4">
          <Text className="font-medium text-foreground mb-2">Nome completo</Text>
          <TextInput
            className="border border-border bg-card text-foreground rounded-md px-3 py-2"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Seu nome completo"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        <View className="mb-4">
          <Text className="font-medium text-foreground mb-2">Email</Text>
          <TextInput
            className="border border-border bg-card text-foreground rounded-md px-3 py-2"
            value={user?.email || ""}
            editable={false}
            placeholderTextColor={colors.mutedForeground}
          />
          <Text className="text-xs text-muted-foreground mt-1">O email não pode ser alterado.</Text>
        </View>

        <Button className="mt-4 mb-6" onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="white" /> : "Salvar alterações"}
        </Button>

        {!showPasswordChange ? (
          <Pressable className="flex-row items-center justify-center mt-2" onPress={() => setShowPasswordChange(true)}>
            <Feather name="lock" size={16} color={colors.primary} />
            <Text className="text-primary ml-2">Alterar Senha</Text>
          </Pressable>
        ) : (
          <View className="mt-6 pt-6 border-t border-border">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-foreground">Alterar Senha</Text>
              <Pressable onPress={() => setShowPasswordChange(false)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {passwordMessage ? (
              <View
                className={`mb-4 p-3 rounded-lg border ${
                  passwordError ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"
                }`}
              >
                <Text className={passwordError ? "text-red-500" : "text-green-500"}>{passwordMessage}</Text>
              </View>
            ) : null}

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

            <Button className="mt-4" onPress={handleChangePassword} disabled={passwordLoading}>
              {passwordLoading ? <ActivityIndicator size="small" color="white" /> : "Atualizar Senha"}
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

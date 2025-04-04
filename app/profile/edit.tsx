// app/profile/edit.tsx
import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, TextInput, Pressable, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../models/user";
import Button from "../components/ui/Button";

export default function ProfileEdit() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, userProfile, refreshProfile } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  
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
          <Text className="text-xs text-muted-foreground mt-1">
            O email não pode ser alterado.
          </Text>
        </View>

        <Button
          className="mt-4"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator size="small" color="white" /> : "Salvar alterações"}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
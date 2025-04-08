// app/profile.tsx (updated with ScrollView)
import React from "react";
import { Text, View, SafeAreaView, Pressable, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import MacroSummary from "../../components/tracking/MacroSummary";
import { resetUserMacros } from "../../models/user";

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut, userProfile, refreshProfile } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim, sair",
          style: "destructive",
          onPress: signOut,
        },
      ],
      { cancelable: true }
    );
  };

  const handleResetMacros = () => {
    Alert.alert(
      "Resetar Macros",
      "Tem certeza que deseja apagar seus dados de macronutrientes?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim, resetar",
          style: "destructive",
          onPress: async () => {
            try {
              if (user) {
                await resetUserMacros(user.id);
                await refreshProfile();
                Alert.alert("Sucesso", "Seus dados foram resetados com sucesso.");
              }
            } catch (error) {
              console.error("Error resetting macros:", error);
              Alert.alert("Erro", "Não foi possível resetar seus dados. Tente novamente.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Meu Perfil</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-6 items-center">
          <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-4">
            <Feather name="user" size={40} color={colors.primary} />
          </View>

          <Text className="text-2xl font-bold text-foreground mb-1">
            {user?.user_metadata?.name || userProfile?.full_name || "Usuário"}
          </Text>
          <Text className="text-muted-foreground mb-6">{user?.email}</Text>

          <Pressable
            className="w-full bg-primary py-2 px-4 rounded-lg mb-4"
            onPress={() => router.push("/screens/profile/edit")}
          >
            <Text className="text-white text-center font-medium">Editar Perfil</Text>
          </Pressable>

          <Pressable
            className="w-full bg-transparent border border-red-500 py-2 px-4 rounded-lg flex-row justify-center items-center"
            onPress={handleLogout}
          >
            <Feather name="log-out" size={18} color="#ef4444" className="mr-2" />
            <Text className="text-red-500 text-center font-medium ml-2">Sair</Text>
          </Pressable>
        </View>

        <View className="px-6 pb-6">
          {userProfile?.macros && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-foreground">Suas Metas Nutricionais</Text>
                <Pressable onPress={handleResetMacros}>
                  <Text className="text-primary text-sm">Resetar</Text>
                </Pressable>
              </View>
              <MacroSummary macros={userProfile.macros} compact={true} />
            </View>
          )}

          <Text className="text-lg font-bold text-foreground mb-4">Estatísticas</Text>

          <View className="flex-row mb-4">
            <View className="flex-1 bg-card rounded-xl border border-border p-4 mr-2">
              <Text className="text-muted-foreground">Dias Ativos</Text>
              <Text className="text-2xl font-bold text-foreground">0</Text>
            </View>

            <View className="flex-1 bg-card rounded-xl border border-border p-4 ml-2">
              <Text className="text-muted-foreground">Refeições</Text>
              <Text className="text-2xl font-bold text-foreground">0</Text>
            </View>
          </View>

          <View className="bg-card rounded-xl border border-border p-4 mb-6">
            <Text className="text-muted-foreground mb-2">Plano Atual</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-foreground">Gratuito</Text>
              <View className="bg-primary py-1 px-3 rounded-full">
                <Text className="text-white text-xs font-medium">Upgrade</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

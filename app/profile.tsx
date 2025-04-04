// app/profile.tsx
import React from "react";
import { Text, View, SafeAreaView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut } = useAuth();

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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Meu Perfil</Text>
      </View>

      <View className="p-6 items-center">
        <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-4">
          <Feather name="user" size={40} color={colors.primary} />
        </View>

        <Text className="text-2xl font-bold text-foreground mb-1">
          {user?.user_metadata?.name || 'Usuário'}
        </Text>
        <Text className="text-muted-foreground mb-6">{user?.email}</Text>

        <Pressable className="w-full bg-primary py-2 px-4 rounded-lg mb-2">
          <Text className="text-white text-center font-medium">Editar Perfil</Text>
        </Pressable>
        
        <Pressable className="w-full bg-transparent border border-border py-2 px-4 rounded-lg" onPress={handleLogout}>
          <Text className="text-foreground text-center font-medium">Sair</Text>
        </Pressable>
      </View>

      <View className="p-6">
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

        <View className="bg-card rounded-xl border border-border p-4">
          <Text className="text-muted-foreground mb-2">Plano Atual</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-foreground">Gratuito</Text>
            <View className="bg-primary py-1 px-3 rounded-full">
              <Text className="text-white text-xs font-medium">Upgrade</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

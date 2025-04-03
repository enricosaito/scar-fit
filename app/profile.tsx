// app/profile.tsx
import React from "react";
import { Text, View, SafeAreaView, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "./context/ThemeContext";

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();

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

        <Text className="text-2xl font-bold text-foreground mb-1">Usuário</Text>
        <Text className="text-muted-foreground mb-6">usuario@email.com</Text>

        <View className="w-full bg-primary py-2 px-4 rounded-lg">
          <Text className="text-white text-center font-medium">Editar Perfil</Text>
        </View>
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

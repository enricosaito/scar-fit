// app/notifications.tsx
import React from "react";
import { Text, View, SafeAreaView, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "./context/ThemeContext";

export default function Notifications() {
  const router = useRouter();
  const { colors } = useTheme();

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      title: "Lembrete de Refeição",
      message: "Não esqueça de registrar suas refeições de hoje!",
      time: "Agora",
      read: false,
    },
    {
      id: 2,
      title: "Novas Receitas",
      message: "Confira as novas receitas adicionadas esta semana.",
      time: "2h atrás",
      read: true,
    },
    {
      id: 3,
      title: "Atualização do App",
      message: "NutriMacros foi atualizado com novos recursos!",
      time: "1d atrás",
      read: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Notificações</Text>
      </View>

      <ScrollView className="flex-1">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <View
              key={notification.id}
              className={`p-4 border-b border-border ${notification.read ? "bg-background" : "bg-primary/5"}`}
            >
              <View className="flex-row items-start">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    notification.read ? "bg-muted" : "bg-primary/20"
                  }`}
                >
                  <Feather name="bell" size={18} color={notification.read ? colors.mutedForeground : colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className={`font-medium ${notification.read ? "text-foreground" : "text-foreground"}`}>
                    {notification.title}
                  </Text>
                  <Text className="text-muted-foreground mt-1">{notification.message}</Text>
                  <Text className="text-muted-foreground text-xs mt-2">{notification.time}</Text>
                </View>
                <Feather name="more-vertical" size={18} color={colors.mutedForeground} />
              </View>
            </View>
          ))
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
              <Feather name="bell" size={24} color={colors.mutedForeground} />
            </View>
            <Text className="text-lg font-medium mb-2 text-center text-foreground">Nenhuma notificação</Text>
            <Text className="text-muted-foreground text-center">Você não tem notificações no momento</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

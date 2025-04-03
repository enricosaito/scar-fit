// app/(tabs)/more.tsx
import React from "react";
import { Text, View, SafeAreaView, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Define the type for Feather icon names
type FeatherIconName = "settings" | "moon" | "help-circle" | "info" | "star" | "share-2" | "log-out" | "chevron-right";

interface MenuItem {
  icon: FeatherIconName;
  title: string;
  route: string;
  action?: () => void;
  subtitle?: string;
}

export default function More() {
  const { colors, theme, toggleTheme } = useTheme();

  const menuItems: MenuItem[] = [
    { icon: "settings", title: "Configurações", route: "/settings" },
    {
      icon: "moon",
      title: "Tema",
      route: "/theme",
      action: toggleTheme,
      subtitle: theme === "dark" ? "Escuro" : "Claro",
    },
    { icon: "help-circle", title: "Ajuda", route: "/help" },
    { icon: "info", title: "Sobre o app", route: "/about" },
    { icon: "star", title: "Versão Premium", route: "/premium" },
    { icon: "share-2", title: "Compartilhar", route: "/share" },
    { icon: "log-out", title: "Sair", route: "/logout" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-2xl font-bold text-foreground mb-6">Mais Opções</Text>

          {menuItems.map((item, index) => (
            <Pressable key={index} className="flex-row items-center py-4 border-b border-border" onPress={item.action}>
              <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
                <Feather name={item.icon} size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground">{item.title}</Text>
                {item.subtitle && <Text className="text-xs text-muted-foreground">{item.subtitle}</Text>}
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </Pressable>
          ))}

          {/* App Version */}
          <View className="mt-6 items-center">
            <Text className="text-muted-foreground text-sm">NutriMacros v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

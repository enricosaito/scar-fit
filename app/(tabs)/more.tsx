// Update app/(tabs)/more.tsx
import React from "react";
import { Text, View, SafeAreaView, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";

// Define the type for Feather icon names
type FeatherIconName =
  | "settings"
  | "moon"
  | "help-circle"
  | "info"
  | "star"
  | "share-2"
  | "log-out"
  | "chevron-right"
  | "activity"
  | "sliders"
  | "zap"; // Add zap icon

interface MenuItem {
  icon: FeatherIconName;
  title: string;
  route: string;
  action?: () => void;
  subtitle?: string;
  isPro?: boolean;
}

export default function More() {
  const { colors, theme, toggleTheme } = useTheme();
  const { signOut, user, loading } = useAuth();
  const router = useRouter();

  // Golden colors for premium feel (copied from pro-subscription)
  const goldColor = "#F7B955"; // Icon color for text and icons
  const goldBg = "rgba(247, 185, 85, 0.2)"; // Translucent gold background (20% opacity)

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

  const menuItems: MenuItem[] = [
    {
      icon: "zap",
      title: "ScarFit",
      route: "/screens/pro-subscription",
      action: () => router.push("/screens/pro-subscription"),
      isPro: true,
    },
    {
      icon: "sliders",
      title: "Calcular Macros",
      route: "/screens/onboarding/index",
      action: () => router.push("/screens/onboarding"),
    },
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
    { icon: "share-2", title: "Compartilhar", route: "/share" },
    {
      icon: "log-out",
      title: "Sair",
      route: "/logout",
      action: handleLogout,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-2xl font-bold text-foreground mb-6">Mais Opções</Text>

          {/* User Info Section */}
          {user && (
            <View className="bg-card rounded-xl border border-border p-4 mb-6 flex-row items-center">
              <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-3">
                <Feather name="user" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground">{user.email}</Text>
                <Text className="text-xs text-muted-foreground">
                  Membro desde {new Date(user.created_at || Date.now()).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <Pressable onPress={() => router.push("/screens/profile/profile")}>
                <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
          )}

          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              className={`flex-row items-center py-4 border-b border-border ${item.isPro ? "mb-2" : ""}`}
              onPress={item.action || (() => router.push(item.route))}
              disabled={loading && item.icon === "log-out"}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{
                  backgroundColor: item.isPro ? `${goldColor}20` : colors.primary + "10",
                }}
              >
                {loading && item.icon === "log-out" ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Feather name={item.icon} size={20} color={item.isPro ? goldColor : colors.primary} />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text
                    className="text-base font-medium text-foreground"
                    style={item.isPro ? { color: goldColor } : {}}
                  >
                    {item.icon === "log-out" && loading ? "Saindo..." : item.title}
                  </Text>
                  {item.isPro && (
                    <View
                      className="ml-2 px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: goldBg,
                      }}
                    >
                      <Text className="text-xs font-medium" style={{ color: goldColor }}>
                        PRO
                      </Text>
                    </View>
                  )}
                </View>
                {item.subtitle && <Text className="text-xs text-muted-foreground">{item.subtitle}</Text>}
              </View>
              <Feather name="chevron-right" size={20} color={item.isPro ? goldColor : colors.mutedForeground} />
            </Pressable>
          ))}

          {/* App Version */}
          <View className="mt-6 items-center">
            <Text className="text-muted-foreground text-sm">ScarFit v1.0.0</Text>
            {user && <Text className="text-muted-foreground text-xs mt-1">Logado como: {user.email}</Text>}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// app/components/AddMenu.tsx
import React from "react";
import { View, Text, Pressable, Modal, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAddMenu } from "../context/AddMenuContext";

export default function AddMenu() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isMenuVisible, hideMenu } = useAddMenu();

  const menuItems = [
    {
      id: "food-search",
      icon: "search",
      title: "Adicionar Alimento",
      subtitle: "Pesquisar no banco de dados",
      action: () => {
        hideMenu();
        router.push("/food-tracker"); 
      },
      pro: false,
    },
    {
      id: "food-barcode",
      icon: "maximize",
      title: "Escanear Código de Barras",
      subtitle: "Adicionar alimento por código de barras",
      action: () => {
        hideMenu();
        router.push("/pro-subscription");
      },
      pro: true,
    },
    {
      id: "food-photo",
      icon: "camera",
      title: "Detectar Alimento por Foto",
      subtitle: "Identificar alimento por imagem",
      action: () => {
        hideMenu();
        router.push("/pro-subscription");
      },
      pro: true,
    },
    {
      id: "exercise",
      icon: "activity",
      title: "Adicionar Exercício",
      subtitle: "Registrar atividade física",
      action: () => {
        hideMenu();
        router.push("/exercise");
      },
      pro: false,
    },
  ];

  return (
    <Modal
      visible={isMenuVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={hideMenu}
    >
      <SafeAreaView className="flex-1 bg-background/95">
        <View className="flex-1 justify-end">
          <View className="px-4 pb-8">
            <Text className="text-2xl font-bold text-foreground mb-6">Adicionar</Text>
            
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                className="flex-row items-center bg-card mb-3 p-4 rounded-xl border border-border"
                onPress={item.action}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Feather name={item.icon} size={22} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-lg font-medium text-foreground">{item.title}</Text>
                    {item.pro && (
                      <View className="ml-2 px-2 py-0.5 bg-primary/20 rounded">
                        <Text className="text-xs text-primary font-medium">PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-muted-foreground">{item.subtitle}</Text>
                </View>
                <Feather name="chevron-right" size={22} color={colors.mutedForeground} />
              </Pressable>
            ))}
            
            <Pressable
              className="bg-card p-4 items-center rounded-xl border border-border mt-4"
              onPress={hideMenu}
            >
              <Text className="text-primary font-medium">Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
// app/components/tracking/AddMenu.tsx (minimal fixes)
import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Modal, SafeAreaView, Animated, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAddMenu } from "../../context/AddMenuContext";

export default function AddMenu() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isMenuVisible, hideMenu } = useAddMenu();

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const menuTranslateY = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (isMenuVisible) {
      // Animate in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true, // This is fine for opacity
        }),
        Animated.spring(menuTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true, // This is fine for translations
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(menuTranslateY, {
          toValue: 200,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isMenuVisible]);

  const menuItems = [
    {
      id: "food-search",
      icon: "search",
      title: "Adicionar Alimento",
      subtitle: "Pesquisar no banco de dados",
      action: () => {
        hideMenu();
        router.push("/screens/food-tracker");
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
        router.push("/screens/pro-subscription");
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
        router.push("/screens/pro-subscription");
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
        router.push("/screens/exercise");
      },
      pro: false,
    },
  ];

  return (
    <Modal visible={isMenuVisible} transparent={true} animationType="none" onRequestClose={hideMenu}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: "transparent" }}>
        {/* Backdrop */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
            opacity: backdropOpacity,
          }}
        >
          <Pressable onPress={hideMenu} style={{ flex: 1 }} />
        </Animated.View>

        {/* Menu Content */}
        <View className="flex-1 justify-end">
          <Animated.View
            style={[
              {
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                transform: [{ translateY: menuTranslateY }],
              },
              // Replace boxShadow with platform-specific shadow styling
              Platform.OS === "ios"
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                  }
                : {
                    elevation: 10,
                  },
            ]}
          >
            {/* Handle Indicator */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 rounded-full bg-border" />
            </View>

            <View className="px-4 pb-8">
              <Text className="text-2xl font-bold text-foreground mb-6">Adicionar</Text>

              {menuItems.map((item) => (
                <Pressable
                  key={item.id}
                  className="flex-row items-center bg-card mb-3 p-4 rounded-xl border border-border"
                  style={[
                    // Platform specific shadow styling
                    Platform.OS === "ios"
                      ? {
                          shadowColor: colors.primary,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 8,
                        }
                      : {
                          elevation: 2,
                        },
                  ]}
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

              <Pressable className="bg-card p-4 items-center rounded-xl border border-border mt-4" onPress={hideMenu}>
                <Text className="text-primary font-medium">Cancelar</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

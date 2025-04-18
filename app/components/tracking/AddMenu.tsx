// app/components/tracking/AddMenu.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Modal, Animated, Dimensions, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAddMenu } from "../../context/AddMenuContext";

export default function AddMenu() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isMenuVisible, hideMenu } = useAddMenu();

  // Get device height to ensure full rendering
  const { height: screenHeight } = Dimensions.get("window");

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const menuTranslateY = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (isMenuVisible) {
      // Animate in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(menuTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
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
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isMenuVisible, screenHeight]);

  const menuItems = [
    {
      id: "food-search",
      icon: "search",
      title: "Adicionar Alimento",
      action: () => {
        hideMenu();
        router.push("/screens/food-tracker");
      },
      color: colors.primary,
    },
    {
      id: "food-voice",
      icon: "mic",
      title: "Detectar por Áudio",
      action: () => {
        hideMenu();
        router.push("/screens/voice-food-logger");
      },
      color: "#8b5cf6", // Purple
    },
    {
      id: "food-photo",
      icon: "camera",
      title: "Detectar por Foto",
      action: () => {
        hideMenu();
        router.push("/screens/pro-subscription");
      },
      color: "#f59e0b", // Amber
    },
    {
      id: "exercise",
      icon: "activity",
      title: "Adicionar Exercício",
      action: () => {
        hideMenu();
        router.push("/screens/exercise");
      },
      color: "#ef4444", // Red
    },
  ];

  // Add extra padding for iOS devices with notch/dynamic island
  const bottomSafeArea = Platform.OS === "ios" ? 34 : 0;

  return (
    <Modal
      visible={isMenuVisible}
      transparent={true}
      animationType="none"
      onRequestClose={hideMenu}
      statusBarTranslucent={true}
    >
      <View className="flex-1" style={{ backgroundColor: "transparent" }}>
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
          onTouchEnd={hideMenu}
        />

        {/* Menu Content */}
        <View className="flex-1 justify-end">
          <Animated.View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 10,
              transform: [{ translateY: menuTranslateY }],
              maxHeight: screenHeight * 0.85, // Limiting max height
            }}
          >
            {/* Handle Indicator */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 rounded-full bg-border" />
            </View>

            <View className="px-4 pb-8" style={{ paddingBottom: 8 + bottomSafeArea }}>
              <Text className="text-2xl font-bold text-foreground mb-6">Adicionar</Text>

              {/* Card-style Grid Layout */}
              <View className="flex-row flex-wrap justify-between">
                {menuItems.map((item) => (
                  <Pressable
                    key={item.id}
                    className="w-[48%] bg-card mb-4 rounded-xl border border-border overflow-hidden"
                    style={{
                      shadowColor: item.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                    onPress={item.action}
                  >
                    <View className="p-4 items-center">
                      <View
                        className="w-16 h-16 rounded-full items-center justify-center mb-3"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <Feather name={item.icon} size={28} color={item.color} />
                      </View>
                      <Text className="text-foreground text-center font-medium">{item.title}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              <Pressable className="bg-card p-4 items-center rounded-xl border border-border mt-4" onPress={hideMenu}>
                <Text className="text-primary font-medium">Cancelar</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

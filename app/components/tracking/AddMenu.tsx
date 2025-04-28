// app/components/tracking/AddMenu.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  Platform,
  AccessibilityInfo,
  Easing,
  PanResponder,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAddMenu } from "../../context/AddMenuContext";

export default function AddMenu() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isMenuVisible, hideMenu } = useAddMenu();

  const { height: screenHeight } = Dimensions.get("window");

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const menuTranslateY = useRef(new Animated.Value(screenHeight)).current;

  const [localVisible, setLocalVisible] = useState(false);
  const goldColor = "#F7B955";

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          menuTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || (gestureState.vy > 0.5 && gestureState.dy > 50)) {
          hideMenu();
        } else {
          Animated.timing(menuTranslateY, {
            toValue: 0,
            duration: 200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Updated menu items with new icons and colors
  const menuItems = [
    {
      id: "food-search",
      icon: "search",
      iconFamily: "Feather",
      title: "Procurar Alimento",
      action: () => {
        hideMenu();
        router.push("/screens/AddFoodSearch");
      },
      color: colors.primary,
      isPro: false,
      order: 1,
    },
    {
      id: "barcode-scan",
      icon: "barcode-scan",
      iconFamily: "MaterialIcons",
      title: "Escanear Código",
      action: () => {
        hideMenu();
        router.push("/screens/BarcodeScanner");
      },
      color: "#ef4444",
      isPro: false,
      order: 2,
    },
    {
      id: "food-voice",
      icon: "mic",
      iconFamily: "Feather",
      title: "Detectar por Áudio",
      action: () => {
        hideMenu();
        router.push("/screens/AddFoodVoice");
      },
      color: goldColor,
      isPro: true,
      order: 3,
    },
    {
      id: "food-photo",
      icon: "camera",
      iconFamily: "Feather",
      title: "Detectar por Foto",
      action: () => {
        hideMenu();
        router.push("/screens/ProSubscription");
      },
      color: goldColor,
      isPro: true,
      order: 4,
    },
  ];

  // Sort items by order
  const sortedMenuItems = [...menuItems].sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (isMenuVisible) {
      // Prepare animation values before showing
      menuTranslateY.setValue(screenHeight);
      backdropOpacity.setValue(0);
      setLocalVisible(true);

      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 0.7,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(menuTranslateY, {
            toValue: 0,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Animate out and hide modal after
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(menuTranslateY, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setLocalVisible(false);
      });
    }
  }, [isMenuVisible]);

  const bottomSafeArea = Platform.OS === "ios" ? 34 : 0;

  return (
    <Modal
      visible={localVisible}
      transparent={true}
      animationType="none"
      onRequestClose={hideMenu}
      statusBarTranslucent={true}
      onShow={() => {
        if (Platform.OS === "ios") {
          AccessibilityInfo.announceForAccessibility("Menu de adição aberto");
        }
      }}
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
              maxHeight: screenHeight * 0.8,
            }}
            {...panResponder.panHandlers}
          >
            <View className="pb-2 pt-5" />
            <View className="px-4 pb-8" style={{ paddingBottom: 8 + bottomSafeArea }}>
              <Text className="text-2xl font-bold text-foreground mb-6">Registrar Refeição</Text>

              <View className="flex-row flex-wrap justify-between">
                {sortedMenuItems.map((item) => (
                  <View key={item.id} style={{ width: "48%" }}>
                    <Pressable
                      className="bg-card mb-4 rounded-xl border border-border overflow-hidden"
                      style={{
                        shadowColor: item.color,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                      onPress={item.action}
                      accessible={true}
                      accessibilityLabel={item.title}
                      accessibilityHint={`Toque para ${item.title.toLowerCase()}`}
                      android_ripple={{ color: `${item.color}20` }}
                    >
                      <View className="p-4 items-center">
                        {/* PRO badge for premium features */}
                        {item.isPro && (
                          <View
                            className="absolute top-2 right-2 px-2 py-0.5 rounded-md z-10"
                            style={{ backgroundColor: `${goldColor}20` }}
                          >
                            <Text className="text-xs font-bold" style={{ color: goldColor }}>
                              PRO
                            </Text>
                          </View>
                        )}

                        <View
                          className="w-16 h-16 rounded-full items-center justify-center mb-3"
                          style={{
                            backgroundColor: `${item.color}20`,
                            borderWidth: 0,
                          }}
                        >
                          {(() => {
                            const size = 28;
                            const color = item.color;
                            switch (item.iconFamily) {
                              case "Feather":
                                return (
                                  <Feather
                                    name={item.icon as keyof typeof Feather.glyphMap}
                                    size={size}
                                    color={color}
                                  />
                                );
                              case "MaterialCommunityIcons":
                              default:
                                return (
                                  <MaterialCommunityIcons
                                    name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                                    size={size}
                                    color={color}
                                  />
                                );
                            }
                          })()}
                        </View>

                        <Text className="text-foreground text-center font-medium">{item.title}</Text>
                      </View>
                    </Pressable>
                  </View>
                ))}
              </View>

              <Pressable
                className="bg-card p-4 items-center rounded-xl border border-border mt-4"
                onPress={hideMenu}
                accessible={true}
                accessibilityLabel="Cancelar"
                accessibilityHint="Toque para fechar o menu"
              >
                <Text className="text-primary font-medium">Cancelar</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

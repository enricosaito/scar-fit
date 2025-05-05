// app/components/ui/InitialLoadingScreen.tsx
import React from "react";
import { View, Image, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function InitialLoadingScreen() {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
      <View className="items-center">
        <Image
          source={require("../../../assets/images/SCARFIT_LOGO_W.png")}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
          accessibilityLabel="Logo Scar Fit"
        />
        <Text className="text-foreground text-lg font-medium mt-6">Carregando...</Text>
      </View>
    </View>
  );
}

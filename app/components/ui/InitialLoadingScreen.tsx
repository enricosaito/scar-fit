import React from "react";
import { View, Image } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function InitialLoadingScreen() {
  const { colors } = useTheme();

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <View className="w-32 h-32 items-center justify-center">
        <Image
          source={require("../../../assets/images/SCARFIT_LOGO_W.png")}
          className="w-24 h-24"
          resizeMode="contain"
          accessibilityLabel="Logo Scar Fit"
        />
      </View>
    </View>
  );
}

// app/screens/BarcodeScanner.tsx
import React, { useState } from "react";
import { Text, View, SafeAreaView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, CameraType, BarcodeScanningResult } from "expo-camera";

import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";

const BarcodeScanner = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>("back");
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);

    router.push({
      pathname: "/screens/AddFoodBarcode",
      params: { barcode: data },
    });
  };

  // Permission loading state
  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-foreground mt-4">Solicitando permissão da câmera...</Text>
      </SafeAreaView>
    );
  }

  // Permission denied state
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center p-4 border-b border-border">
          <Pressable onPress={() => router.back()} className="p-2">
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Scanner de Código</Text>
        </View>

        <View className="flex-1 items-center justify-center p-6">
          <Feather name="camera-off" size={60} color={colors.mutedForeground} />
          <Text className="text-foreground text-lg font-medium mt-4 mb-2 text-center">Acesso à câmera negado</Text>
          <Text className="text-muted-foreground text-center mb-6">
            Para escanear códigos de barras, é necessário permitir o acesso à câmera do dispositivo nas configurações.
          </Text>
          <Button onPress={requestPermission}>Permitir Acesso</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Scanner de Código</Text>
      </View>

      {/* Camera Scanner */}
      <View className="flex-1">
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View
              style={{
                width: 280,
                height: 280,
                borderWidth: 2,
                borderColor: "white",
                borderRadius: 10,
                opacity: 0.8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="maximize" size={100} color="rgba(255, 255, 255, 0.5)" />
              <Text style={{ color: "white", marginTop: 8, fontWeight: "500", textAlign: "center" }}>
                Posicione o código de barras dentro da área
              </Text>
            </View>
          </View>
        </CameraView>

        {/* Loading Overlay */}
        {scanned && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-background/75 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-foreground mt-4 text-center">Buscando informações do produto...</Text>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View className="p-6 bg-card border-t border-border">
        <Text className="text-muted-foreground text-center mb-4">
          Escaneie o código de barras de um alimento para adicionar automaticamente ao seu diário.
        </Text>
        <Button variant="outline" onPress={() => router.push("/screens/AddFoodSearch")}>
          Digitar Manualmente
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default BarcodeScanner;

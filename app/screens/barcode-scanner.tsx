// app/screens/barcode-scanner.tsx
import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setLoading(true);

    // Navigate to product screen with the barcode
    setTimeout(() => {
      router.push({
        pathname: "/screens/barcode-product",
        params: { barcode: data },
      });
    }, 500);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-foreground mt-4">Solicitando permissão da câmera...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
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
          <Button onPress={() => router.back()}>Voltar</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Scanner de Código</Text>
      </View>

      <View className="flex-1">
        {!scanned ? (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          >
            <View className="flex-1 justify-center items-center">
              {/* Scanner overlay */}
              <View className="w-72 h-72 border-2 border-white rounded-lg opacity-80 justify-center items-center">
                <Feather name="maximize" size={100} color="rgba(255, 255, 255, 0.5)" />
                <Text className="text-white mt-2 font-medium text-center">
                  Posicione o código de barras dentro da área
                </Text>
              </View>
            </View>
          </BarCodeScanner>
        ) : (
          <View className="flex-1 justify-center items-center bg-background p-6">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-foreground mt-4 text-center">Buscando informações do produto...</Text>
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <View className="p-6 bg-card border-t border-border">
        <Text className="text-muted-foreground text-center mb-4">
          Escaneie o código de barras de um alimento para adicionar automaticamente ao seu diário.
        </Text>
        <Button variant="outline" onPress={() => router.push("/screens/food-tracker")}>
          Digitar Manualmente
        </Button>
      </View>
    </SafeAreaView>
  );
}

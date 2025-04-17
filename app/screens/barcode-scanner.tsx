// app/screens/barcode-scanner.tsx
import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (!scanning) return;

    setScanned(true);
    setScanning(false);
    setLoading(true);
    setError(null);

    try {
      // We'll implement the API call in the next step
      router.push({
        pathname: "/screens/barcode-product",
        params: { barcode: data },
      });
    } catch (err) {
      console.error("Error scanning barcode:", err);
      setError("Ocorreu um erro ao processar o código de barras. Tente novamente.");
      setLoading(false);
      setScanned(false);
      setScanning(true);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanning(true);
    setLoading(false);
    setError(null);
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
        {!scanned && (
          <Camera
            style={{ flex: 1 }}
            type={Camera.Constants.Type.back}
            barCodeScannerSettings={{
              barCodeTypes: [BarCodeScanner.Constants.BarCodeType.ean13, BarCodeScanner.Constants.BarCodeType.ean8],
            }}
            onBarCodeScanned={handleBarCodeScanned}
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
          </Camera>
        )}

        {scanned && loading && (
          <View className="flex-1 justify-center items-center bg-background p-6">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-foreground mt-4 text-center">Buscando informações do produto...</Text>
          </View>
        )}

        {error && (
          <View className="flex-1 justify-center items-center bg-background p-6">
            <Feather name="alert-circle" size={60} color={colors.mutedForeground} />
            <Text className="text-foreground text-lg font-medium mt-4 mb-2 text-center">Ops! Algo deu errado</Text>
            <Text className="text-muted-foreground text-center mb-6">{error}</Text>
            <Button onPress={handleScanAgain}>Tentar Novamente</Button>
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

import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6">
        <View className="items-center pt-10 pb-6">
          <Image
            source={require("../../assets/images/SCARFIT_LOGO_W.png")}
            style={{ width: 90, height: 90 }}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Logo Scar Fit"
          />
          <Text className="text-2xl font-bold text-foreground mb-2">Scar Fit</Text>
          <Text className="text-sm text-muted-foreground text-center px-8">
            Comece sua jornada fitness de forma inteligente
          </Text>
        </View>

        <View className="flex-1 justify-center">
          <Button
            className="mb-4"
            onPress={() => router.push("/auth/RegisterScreen")}
            accessibilityLabel="Criar conta"
            accessibilityHint="Clique para criar uma nova conta"
          >
            Criar Conta
          </Button>

          <Button
            variant="outline"
            className="mb-6"
            onPress={() => router.push("/auth/LoginScreen")}
            accessibilityLabel="Entrar"
            accessibilityHint="Clique para entrar na sua conta existente"
          >
            Entrar
          </Button>

          <Text className="text-center text-muted-foreground text-xs px-4">
            Ao continuar, você concorda com nossos{" "}
            <Text className="text-primary" onPress={() => router.push("/screens/PrivacyPolicy")}>
              Termos de Serviço
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

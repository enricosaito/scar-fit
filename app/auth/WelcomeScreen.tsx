// app/auth/WelcomeScreen.tsx
import React, { useCallback } from "react";
import { Text, View, SafeAreaView, Image, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleLogin = useCallback(() => {
    router.push("/auth/LoginScreen");
  }, [router]);

  const handleRegister = useCallback(() => {
    router.push("/auth/RegisterScreen");
  }, [router]);

  const handlePrivacyPolicy = useCallback(() => {
    router.push("/screens/PrivacyPolicy");
  }, [router]);

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 justify-between">
          {/* Top Logo Section */}
          <View className="items-center pt-12 pb-6">
            <View className="w-32 h-32 bg-primary/20 items-center justify-center rounded-full mb-6">
              <Image
                source={require("../../assets/images/SCARFIT_LOGO_W.png")}
                className="w-24 h-24"
                resizeMode="contain"
                accessibilityLabel="Logo Scar Fit"
              />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-3">Scar Fit</Text>
            <Text className="text-base text-muted-foreground text-center px-8">
              Transforme sua saúde e alcance seus objetivos
            </Text>
          </View>

          {/* Middle Feature Section */}
          <View className="py-6">
            <FeatureItem
              icon="zap"
              title="Macronutrientes Personalizados"
              description="Dieta ajustada para suas necessidades"
              colors={colors}
            />
            <FeatureItem
              icon="activity"
              title="Acompanhamento Diário"
              description="Monitore seu progresso fitness"
              colors={colors}
            />
            <FeatureItem
              icon="coffee"
              title="Milhares de Alimentos"
              description="Banco de dados completo de nutrição"
              colors={colors}
            />
          </View>

          {/* Bottom Action Section - Simplified */}
          <View className="bg-background pb-8">
            <Button className="mb-4 py-3.5" onPress={handleRegister} accessibilityLabel="Criar Conta">
              Criar Conta
            </Button>

            <Button
              variant="outline"
              className="mb-6 py-3.5"
              onPress={handleLogin}
              accessibilityLabel="Já tenho uma conta"
            >
              Já tenho uma conta
            </Button>

            {/* Terms and Privacy Policy - Simple text approach */}
            <Text className="text-center text-muted-foreground text-xs px-4">
              Ao continuar, você concorda com nossos Termos de Serviço e{" "}
              <Text className="text-primary" onPress={handlePrivacyPolicy} accessibilityRole="link">
                Política de Privacidade
              </Text>
              .
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// Simplified Feature item component with better spacing
const FeatureItem = ({ icon, title, description, colors }) => {
  return (
    <View className="flex-row items-center mb-5">
      <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-4">
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-semibold text-base">{title}</Text>
        <Text className="text-muted-foreground text-xs mt-0.5">{description}</Text>
      </View>
    </View>
  );
};

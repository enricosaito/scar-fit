// app/auth/WelcomeScreen.tsx
import React, { useCallback } from "react";
import { Text, View, SafeAreaView, Image, StatusBar, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";

interface FeatureItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  colors: {
    primary: string;
  };
}

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

  const handleTermsOfService = useCallback(() => {
    // Add terms of service screen when available
    router.push("/screens/PrivacyPolicy"); // Temporary redirect to privacy policy
  }, [router]);

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 justify-between">
          {/* Big Headline at Top */}
          <View className="pt-16">
            <Text className="text-4xl font-bold text-foreground text-center mb-4">
              Dieta inteligente,{"\n"}sem feitiços mágicos
            </Text>
          </View>

          {/* Middle Section with Logo and Features */}
          <View className="py-6">
            <View className="items-center mb-12">
              <View className="w-32 h-32 bg-primary/20 items-center justify-center rounded-full mb-6">
                <Image
                  source={require("../../assets/images/SCARFIT_LOGO_W.png")}
                  className="w-24 h-24"
                  resizeMode="contain"
                  accessibilityLabel="Logo Scar Fit"
                />
              </View>
              <Text className="text-3xl font-bold text-foreground mb-3">Scar Fit</Text>
            </View>

            {/* Feature Items */}
            <FeatureItem
              icon="zap"
              title="Macros ajustados pra você"
              description="Dieta personalizada para suas necessidades"
              colors={colors}
            />
            <FeatureItem
              icon="activity"
              title="Acompanhamento diário"
              description="Monitore seu progresso e crie hábitos"
              colors={colors}
            />
            <FeatureItem
              icon="coffee"
              title="Milhares de alimentos e receitas"
              description="Banco de dados completo de nutrição"
              colors={colors}
            />
          </View>

          {/* Bottom Action Section */}
          <View className="pb-8">
            {/* Already have an account? Log In. section */}
            <View className="mb-8">
              <Text className="text-center text-foreground">
                Já tem uma conta?{" "}
                <Text className="underline font-semibold" onPress={handleLogin} accessibilityRole="link">
                  Entrar.
                </Text>
              </Text>
            </View>

            {/* Get Started Button */}
            <Pressable className="bg-primary rounded py-5 mb-8" onPress={handleRegister} accessibilityLabel="Começar">
              <Text className="text-center text-white font-bold text-xl">Começar agora</Text>
            </Pressable>

            {/* Terms and Privacy Policy */}
            <Text className="text-center text-muted-foreground text-xs px-4">
              Ao continuar, você concorda com nossos{" "}
              <Text className="underline" onPress={handleTermsOfService} accessibilityRole="link">
                Termos de Serviço
              </Text>{" "}
              e{" "}
              <Text className="underline" onPress={handlePrivacyPolicy} accessibilityRole="link">
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

const FeatureItem = ({ icon, title, description, colors }: FeatureItemProps) => {
  return (
    <View className="flex-row items-center mb-5" accessibilityRole="none">
      <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-4" accessibilityRole="image">
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-semibold text-base" accessibilityRole="header">
          {title}
        </Text>
        <Text className="text-muted-foreground text-xs mt-0.5">{description}</Text>
      </View>
    </View>
  );
};

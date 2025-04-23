// app/screens/pro-subscription.tsx (mixed theme)
import React, { useState } from "react";
import { Text, View, SafeAreaView, Pressable, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";

export default function ProSubscription() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");

  // Golden colors for premium feel
  const goldColor = "#F7B955";
  const goldBg = "rgba(247, 185, 85, 0.2)";

  // Core premium features to highlight
  const features = [
    {
      icon: "mic",
      title: "Transcrição de Áudios",
      description: "Adicione alimentos usando comandos de voz",
    },
    {
      icon: "camera",
      title: "Detecção por Fotografia",
      description: "Identifique pratos automaticamente por fotos",
    },
    {
      icon: "book",
      title: "500+ Receitas Inteligentes",
      description: "Sugestões personalizadas de cardápios",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />

      {/* Close button with better spacing */}
      <View className="absolute top-12 right-6 z-10">
        <Pressable
          className="w-10 h-10 bg-card/80 rounded-full items-center justify-center"
          onPress={() => router.back()}
        >
          <Feather name="x" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <View className="flex-1 px-6 py-8">
        {/* Simplified title section with gold accent */}
        <View className="items-center mb-8 mt-4">
          <Text className="text-2xl font-bold text-foreground text-center">
            Desbloqueie todo o potencial com <Text style={{ color: goldColor }}>ScarFit Pro</Text> ⚡️
          </Text>
        </View>
        {/* Premium features section - vertical list with golden icons */}
        <View className="mb-6">
          {features.map((feature, index) => (
            <View key={index} className="flex-row items-center bg-card/60 rounded-xl p-4 mb-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${goldColor}20` }} // Transparent gold background
              >
                <Feather name={feature.icon as keyof typeof Feather.glyphMap} size={20} color={goldColor} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground font-medium mb-1">{feature.title}</Text>
                  <View
                    className="px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: goldBg, // Translucent background
                    }}
                  >
                    <Text className="text-xs font-medium" style={{ color: goldColor }}>
                      PRO
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-muted-foreground">{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
        {/* Other benefits - keep blue */}
        <View className="bg-card/40 rounded-xl p-3 mb-6">
          <Text className="text-foreground font-medium mb-2">Mais benefícios:</Text>
          <View className="flex-row flex-wrap">
            <View className="flex-row items-center w-1/2 mb-2">
              <Feather name="trending-up" size={14} color={colors.primary} />
              <Text className="text-sm text-foreground ml-2">Análises avançadas</Text>
            </View>
            <View className="flex-row items-center w-1/2 mb-2">
              <Feather name="calendar" size={14} color={colors.primary} />
              <Text className="text-sm text-foreground ml-2">Planejamento</Text>
            </View>
            <View className="flex-row items-center w-1/2 mb-2">
              <Feather name="zap" size={14} color={colors.primary} />
              <Text className="text-sm text-foreground ml-2">Metas personalizadas</Text>
            </View>
            <View className="flex-row items-center w-1/2 mb-2">
              <Feather name="user" size={14} color={colors.primary} />
              <Text className="text-sm text-foreground ml-2">Suporte prioritário</Text>
            </View>
          </View>
        </View>

        {/* Pricing plans section - refined based on feedback */}
        <Text className="text-lg font-bold text-foreground mb-6 text-center">
          Escolha seu plano e comece um teste grátis.
        </Text>
        <View className="flex-row justify-between mb-8">
          {/* Annual Plan (with centered tag above) */}
          <View className="w-[48%] relative">
            {/* Best Value Tag - now centered above entire card */}
            <View className="absolute -top-3 left-0 w-full items-center z-10">
              <View className="px-3 py-0.5 rounded-full" style={{ backgroundColor: colors.primary }}>
                <Text className="text-xs font-bold text-black">50% OFF</Text>
              </View>
            </View>

            <Pressable
              className={`border ${
                selectedPlan === "annual" ? "border-primary bg-primary/10" : "border-border"
              } rounded-xl pt-6 pb-4 px-4 items-center justify-center`}
              style={{
                shadowColor: selectedPlan === "annual" ? colors.primary : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: selectedPlan === "annual" ? 0.2 : 0,
                shadowRadius: 4,
                elevation: selectedPlan === "annual" ? 3 : 0,
              }}
              onPress={() => setSelectedPlan("annual")}
            >
              <Text className="text-2xl font-extrabold mb-1 text-foreground">ANUAL</Text>

              <Text className="text-lg font-semibold text-muted-foreground">R$129,90/ano</Text>
            </Pressable>
          </View>

          {/* Monthly Plan (right) */}
          <Pressable
            className={`w-[48%] border ${
              selectedPlan === "monthly" ? "border-primary bg-primary/10" : "border-border"
            } rounded-xl pt-6 pb-4 px-4 items-center justify-center`}
            style={{
              shadowColor: selectedPlan === "monthly" ? colors.primary : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: selectedPlan === "monthly" ? 0.2 : 0,
              shadowRadius: 4,
              elevation: selectedPlan === "monthly" ? 3 : 0,
            }}
            onPress={() => setSelectedPlan("monthly")}
          >
            <Text className="text-2xl font-extrabold mb-1 text-foreground">MENSAL</Text>

            <Text className="text-lg font-semibold text-muted-foreground">R$21,90/mês</Text>
          </Pressable>
        </View>

        {/* Keep blue button for free trial */}
        <Button onPress={() => router.back()}>Iniciar availiação gratuita de 7 dias</Button>
      </View>
    </SafeAreaView>
  );
}

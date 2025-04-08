// app/pro-subscription.tsx
import React from "react";
import { Text, View, SafeAreaView, Pressable, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "./context/ThemeContext";
import Button from "./components/ui/Button";

export default function ProSubscription() {
  const router = useRouter();
  const { colors } = useTheme();

  const features = [
    {
      icon: "maximize",
      title: "Escaneamento de Código de Barras",
      description: "Adicione alimentos rapidamente escaneando o código de barras",
    },
    {
      icon: "camera",
      title: "Detecção por Foto",
      description: "Identifique alimentos automaticamente através de fotos",
    },
    {
      icon: "trending-up",
      title: "Análise Avançada",
      description: "Relatórios detalhados do seu progresso e hábitos alimentares",
    },
    {
      icon: "calendar",
      title: "Planejamento de Refeições",
      description: "Crie e salve planos de refeições personalizados",
    },
    {
      icon: "zap",
      title: "Sem Anúncios",
      description: "Experiência sem interrupções de anúncios",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">ScarFit Pro</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-2">
              <Feather name="star" size={36} color="white" />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-1">Desbloqueie Todos os Recursos</Text>
            <Text className="text-center text-muted-foreground">
              Maximize seus resultados com recursos exclusivos do ScarFit Pro
            </Text>
          </View>

          <View className="bg-card rounded-xl border border-border p-6 mb-6">
            {features.map((feature, index) => (
              <View key={index} className="flex-row mb-4 items-start">
                <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
                  <Feather name={feature.icon} size={16} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-medium mb-1">{feature.title}</Text>
                  <Text className="text-muted-foreground text-sm">{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View className="bg-card rounded-xl border border-border p-6 mb-6">
            <Text className="text-xl font-bold text-foreground mb-4 text-center">Escolha Seu Plano</Text>
            
            <Pressable className="border-2 border-primary rounded-xl p-4 mb-3 bg-primary/5">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-foreground">Anual</Text>
                <View className="bg-primary px-2 py-1 rounded">
                  <Text className="text-xs text-white font-medium">MELHOR VALOR</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-primary mb-1">R$ 99,90/ano</Text>
              <Text className="text-muted-foreground">Equivalente a R$ 8,32/mês</Text>
            </Pressable>
            
            <Pressable className="border border-border rounded-xl p-4 mb-3">
              <Text className="text-lg font-bold text-foreground mb-2">Mensal</Text>
              <Text className="text-2xl font-bold text-foreground mb-1">R$ 14,90/mês</Text>
              <Text className="text-muted-foreground">Cobrado mensalmente</Text>
            </Pressable>
          </View>

          <Button className="mb-3">Começar Teste Gratuito de 7 Dias</Button>
          <Button variant="outline" onPress={() => router.back()}>Continuar com Versão Gratuita</Button>

          <Text className="text-xs text-muted-foreground text-center mt-6">
            A assinatura será renovada automaticamente. Você pode cancelar a qualquer momento nas configurações da sua conta.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
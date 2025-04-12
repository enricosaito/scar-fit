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
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  // Golden colors for premium feel
  const goldColor = "#F7B955"; // Icon color
  const goldDark = "#E6A845"; // Darker gold for best value tag

  // Core premium features to highlight
  const features = [
    {
      icon: "maximize",
      title: "Adição por Código de Barras",
      description: "Escaneie códigos para adicionar alimentos instantaneamente",
    },
    {
      icon: "camera",
      title: "Detecção de Fotos",
      description: "Identifique alimentos automaticamente por fotos",
    },
    {
      icon: "mic",
      title: "Registro por Áudio",
      description: "Adicione alimentos usando comandos de voz",
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
                <Feather name={feature.icon} size={20} color={goldColor} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-medium mb-1">{feature.title}</Text>
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
              <Text className="text-sm text-foreground ml-2">Sem anúncios</Text>
            </View>
            <View className="flex-row items-center w-1/2 mb-2">
              <Feather name="user" size={14} color={colors.primary} />
              <Text className="text-sm text-foreground ml-2">Suporte prioritário</Text>
            </View>
          </View>
        </View>

        {/* Pricing plans - keep blue for buttons */}
        <Text className="text-lg font-bold text-foreground mb-3 text-center">Escolha Seu Plano</Text>
        <View className="flex-row justify-between mb-8">
          {/* Monthly Plan */}
          <Pressable 
            className={`w-[48%] h-36 border ${selectedPlan === 'monthly' ? 'border-primary bg-primary/5' : 'border-border'} rounded-xl p-4 items-center justify-center`}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text className="text-lg font-bold text-foreground mb-1">Mensal</Text>
            <Text className={`text-2xl font-bold ${selectedPlan === 'monthly' ? 'text-primary' : 'text-foreground'}`}>R$14,90</Text>
            <Text className="text-xs text-muted-foreground text-center">Cobrado mensalmente</Text>
          </Pressable>

          {/* Annual Plan */}
          <Pressable 
            className={`w-[48%] h-36 border ${selectedPlan === 'annual' ? 'border-primary bg-primary/5' : 'border-border'} rounded-xl p-4 items-center justify-center`}
            onPress={() => setSelectedPlan('annual')}
          >
            <View 
              className="px-2 py-0.5 rounded-full mb-1"
              style={{ backgroundColor: goldDark }} // Only this tag is gold
            >
              <Text className="text-xs text-white font-medium">MELHOR VALOR</Text>
            </View>
            <Text className="text-lg font-bold text-foreground">Anual</Text>
            <Text className={`text-2xl font-bold ${selectedPlan === 'annual' ? 'text-primary' : 'text-foreground'}`}>R$99,90</Text>
            <Text className="text-xs text-muted-foreground text-center">R$8,32/mês</Text>
          </Pressable>
        </View>

        {/* Keep blue button for free trial */}
        <Button onPress={() => router.back()}>
          Iniciar Teste Gratuito de 7 Dias
        </Button>
      </View>
    </SafeAreaView>
  );
}
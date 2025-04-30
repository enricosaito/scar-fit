// File: app/screens/about.tsx
import React from "react";
import { Text, View, SafeAreaView, Pressable, ScrollView, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function About() {
  const router = useRouter();
  const { colors } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Erro ao abrir link:", err));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Sobre o App</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
            <Feather name="zap" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">ScarFit</Text>
          <Text className="text-sm text-muted-foreground">Versão 1.0.0</Text>
        </View>

        <Text className="text-foreground text-lg font-medium mb-3">Visão Geral</Text>
        <Text className="text-muted-foreground mb-6">
          ScarFit é um aplicativo completo de nutrição que ajuda você a atingir seus objetivos de fitness. Monitore
          facilmente seus macronutrientes, refeições e treinos para alcançar resultados reais, mantendo um estilo de
          vida saudável.
        </Text>

        <Text className="text-foreground text-lg font-medium mb-3">Principais Funcionalidades</Text>
        <View className="mb-6">
          <View className="flex-row mb-2">
            <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
              <Feather name="pie-chart" size={16} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-medium">Monitoramento de Macros</Text>
              <Text className="text-muted-foreground">
                Calcule e acompanhe sua ingestão diária de proteínas, carboidratos e gorduras.
              </Text>
            </View>
          </View>

          <View className="flex-row mb-2">
            <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
              <Feather name="search" size={16} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-medium">Banco de Alimentos</Text>
              <Text className="text-muted-foreground">
                Pesquise milhares de alimentos verificados com informações nutricionais detalhadas da TACO.
              </Text>
            </View>
          </View>

          <View className="flex-row mb-2">
            <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
              <Feather name="book" size={16} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-medium">Sugestões de Receitas</Text>
              <Text className="text-muted-foreground">
                Veja recomendações inteligentes de receitas para atingir seus objetivos.
              </Text>
            </View>
          </View>

          <View className="flex-row mb-2">
            <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
              <Feather name="camera" size={16} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-medium">Escaneamento de Código de Barras</Text>
              <Text className="text-muted-foreground">
                Registre rapidamente produtos com códigos de barras conectados às APIs de alimentos.
              </Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
              <Feather name="mic" size={16} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-medium">Detecção por Áudio</Text>
              <Text className="text-muted-foreground">
                Registre refeições facilmente usando comandos de voz nativos.
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-foreground text-lg font-medium mb-3">Tecnologias</Text>
        <Text className="text-muted-foreground mb-6">ScarFit foi construído com as seguintes tecnologias:</Text>
        <Text className="text-muted-foreground mb-1">• Frontend: React Native, Expo Router, NativeWind</Text>
        <Text className="text-muted-foreground mb-1">
          • Backend: TypeScript, Supabase (Autenticação, Banco de Dados)
        </Text>
        <Text className="text-muted-foreground mb-6">
          • APIs: OpenFoodFacts API, TACO (Tabela Brasileira de Composição de Alimentos)
        </Text>

        <Text className="text-foreground text-lg font-medium mb-3">Equipe</Text>
        <Text className="text-muted-foreground mb-4">
          ScarFit foi criado por uma equipe dedicada de desenvolvedores e especialistas em nutrição, comprometidos em
          ajudar pessoas a viverem vidas mais saudáveis através de tecnologia acessível.
        </Text>

        <Text className="text-foreground text-lg font-medium mb-3">Contato</Text>
        <Text className="text-muted-foreground mb-3">
          Temos orgulho de oferecer suporte excepcional aos nossos usuários. Se você tiver dúvidas, sugestões ou
          precisar de ajuda, entre em contato conosco:
        </Text>

        <Pressable className="flex-row items-center mb-2" onPress={() => openLink("mailto:contato@scarfit.com.br")}>
          <Feather name="mail" size={16} color={colors.primary} style={{ marginRight: 8 }} />
          <Text className="text-primary">contato@scarfit.com.br</Text>
        </Pressable>

        <Pressable className="flex-row items-center mb-2" onPress={() => openLink("https://scarfit.com.br")}>
          <Feather name="globe" size={16} color={colors.primary} style={{ marginRight: 8 }} />
          <Text className="text-primary">www.scarfit.com.br</Text>
        </Pressable>

        <Pressable className="flex-row items-center mb-6" onPress={() => openLink("https://instagram.com/scarfit")}>
          <Feather name="instagram" size={16} color={colors.primary} style={{ marginRight: 8 }} />
          <Text className="text-primary">@scarfit</Text>
        </Pressable>

        <Text className="text-foreground text-lg font-medium mb-3">Política de Privacidade</Text>
        <Text className="text-muted-foreground mb-3">
          Para mais informações sobre como tratamos seus dados, consulte nossa Política de Privacidade.
        </Text>

        <Pressable className="flex-row items-center mb-6" onPress={() => router.push("/screens/PrivacyPolicy")}>
          <Feather name="shield" size={16} color={colors.primary} style={{ marginRight: 8 }} />
          <Text className="text-primary">Ver Política de Privacidade</Text>
        </Pressable>

        <Text className="text-muted-foreground text-center mb-6">© 2025 ScarFit. Todos os direitos reservados.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

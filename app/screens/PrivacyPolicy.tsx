// app/screens/PrivacyPolicy.tsx
import React from "react";
import { Text, View, SafeAreaView, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function PrivacyPolicy() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Política de Privacidade</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <Text className="text-xl font-bold text-foreground mb-4">Política de Privacidade do ScarFit</Text>
        <Text className="text-sm text-muted-foreground mb-6">Última atualização: 30 de Abril, 2025</Text>

        <Text className="text-foreground font-medium mb-2">1. Informações que Coletamos</Text>
        <Text className="text-muted-foreground mb-4">
          Para proporcionar a melhor experiência possível, coletamos os seguintes tipos de informações:
        </Text>
        <Text className="text-muted-foreground mb-1">• Informações da conta: email e senha</Text>
        <Text className="text-muted-foreground mb-1">• Informações de perfil: nome, foto de perfil</Text>
        <Text className="text-muted-foreground mb-1">
          • Informações físicas: idade, peso, altura, nível de atividade
        </Text>
        <Text className="text-muted-foreground mb-1">• Dados de uso: alimentos registrados, refeições, progresso</Text>
        <Text className="text-muted-foreground mb-4">
          • Dados técnicos: tipo de dispositivo, versão do sistema operacional
        </Text>

        <Text className="text-foreground font-medium mb-2">2. Como Usamos Suas Informações</Text>
        <Text className="text-muted-foreground mb-4">Utilizamos suas informações para:</Text>
        <Text className="text-muted-foreground mb-1">• Fornecer, manter e melhorar nossos serviços</Text>
        <Text className="text-muted-foreground mb-1">• Personalizar sua experiência e suas metas nutricionais</Text>
        <Text className="text-muted-foreground mb-1">• Processar transações de assinatura</Text>
        <Text className="text-muted-foreground mb-1">• Comunicar mudanças ou atualizações</Text>
        <Text className="text-muted-foreground mb-4">• Prevenir atividades fraudulentas e melhorar a segurança</Text>

        <Text className="text-foreground font-medium mb-2">3. Compartilhamento de Informações</Text>
        <Text className="text-muted-foreground mb-4">
          Não vendemos seus dados pessoais. Compartilhamos informações apenas nas seguintes situações:
        </Text>
        <Text className="text-muted-foreground mb-1">
          • Com provedores de serviços que nos ajudam a operar o aplicativo
        </Text>
        <Text className="text-muted-foreground mb-1">• Para cumprir obrigações legais</Text>
        <Text className="text-muted-foreground mb-4">• Com seu consentimento explícito</Text>

        <Text className="text-foreground font-medium mb-2">4. Segurança de Dados</Text>
        <Text className="text-muted-foreground mb-4">
          Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados pessoais contra acesso
          não autorizado, alteração, divulgação ou destruição acidental. Todos os dados são armazenados em servidores
          seguros e criptografados durante a transmissão.
        </Text>

        <Text className="text-foreground font-medium mb-2">5. Seus Direitos</Text>
        <Text className="text-muted-foreground mb-4">Você tem direito a:</Text>
        <Text className="text-muted-foreground mb-1">• Acessar, corrigir ou excluir seus dados pessoais</Text>
        <Text className="text-muted-foreground mb-1">• Restringir ou se opor ao processamento de seus dados</Text>
        <Text className="text-muted-foreground mb-1">• Portabilidade dos dados</Text>
        <Text className="text-muted-foreground mb-4">• Retirar o consentimento a qualquer momento</Text>

        <Text className="text-foreground font-medium mb-2">6. Retenção de Dados</Text>
        <Text className="text-muted-foreground mb-4">
          Mantemos seus dados pessoais apenas pelo tempo necessário para os fins estabelecidos nesta Política de
          Privacidade. Se você excluir sua conta, seus dados pessoais serão removidos dentro de 30 dias, exceto quando a
          lei exigir a retenção.
        </Text>

        <Text className="text-foreground font-medium mb-2">7. Crianças</Text>
        <Text className="text-muted-foreground mb-4">
          O ScarFit não é destinado a menores de 16 anos. Não coletamos intencionalmente informações de crianças. Se
          você acredita que um menor forneceu dados pessoais, entre em contato conosco para que possamos remover essas
          informações.
        </Text>

        <Text className="text-foreground font-medium mb-2">8. Alterações nesta Política</Text>
        <Text className="text-muted-foreground mb-4">
          Podemos atualizar nossa Política de Privacidade ocasionalmente. A versão mais recente estará sempre disponível
          no aplicativo, com a data da última atualização. Recomendamos que você revise periodicamente esta política.
        </Text>

        <Text className="text-foreground font-medium mb-2">9. Contato</Text>
        <Text className="text-muted-foreground mb-6">
          Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade ou sobre como tratamos seus dados,
          entre em contato conosco através do email: contato@scarfit.com.br
        </Text>

        <View className="items-center mb-4">
          <Pressable onPress={() => router.back()} className="bg-primary px-6 py-3 rounded-lg">
            <Text className="text-white font-medium">Voltar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

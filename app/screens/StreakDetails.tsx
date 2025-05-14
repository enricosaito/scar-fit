// app/screens/streak-details.tsx
import React, { useEffect, useState } from "react";
import { Text, View, SafeAreaView, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getUserStreakData } from "../models/streak";

export default function StreakDetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState<{
    current_streak: number;
    longest_streak: number;
    today_completed: boolean;
    last_streak_date: string;
  } | null>(null);

  useEffect(() => {
    const loadStreakDetails = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const data = await getUserStreakData(user.id);
        setStreakData(data);
      } catch (error) {
        console.error("Error loading streak details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStreakDetails();
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Detalhes do Streak</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {loading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : streakData ? (
          <>
            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-4">
                <Feather name="zap" size={40} color={colors.primary} />
              </View>
              <Text className="text-3xl font-bold text-foreground mb-2">{streakData.current_streak} dias</Text>
              <Text className="text-muted-foreground text-center">
                {streakData.today_completed
                  ? "Você já completou seu streak hoje!"
                  : "Registre refeições hoje para manter seu streak"}
              </Text>
            </View>

            <View className="bg-card rounded-xl border border-border p-6 mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">Seu streak</Text>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-foreground">Streak atual</Text>
                <Text className="text-foreground font-semibold">{streakData.current_streak} dias</Text>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-foreground">Seu recorde</Text>
                <Text className="text-foreground font-semibold">{streakData.longest_streak} dias</Text>
              </View>

              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-foreground">Última atualização</Text>
                <Text className="text-foreground font-semibold">
                  {new Date(streakData.last_streak_date).toLocaleDateString("pt-BR")}
                </Text>
              </View>
            </View>

            <View className="bg-card rounded-xl border border-border p-6 mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">Como funcionam os streaks</Text>
              <Text className="text-muted-foreground mb-3">
                Registre pelo menos uma refeição por dia para manter seu streak ativo.
              </Text>
              <Text className="text-muted-foreground mb-3">
                Seu streak aumenta a cada dia que você registra pelo menos uma refeição.
              </Text>
              <Text className="text-muted-foreground">
                Se você ficar um dia sem registrar refeições, seu streak volta para zero.
              </Text>
            </View>
          </>
        ) : (
          <View className="items-center py-8">
            <Text className="text-muted-foreground">Nenhum dado de streak encontrado</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

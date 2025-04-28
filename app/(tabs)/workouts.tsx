// app/(tabs)/workouts.tsx
import React from "react";
import { Text, View, SafeAreaView, ScrollView, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/ui/Header";
import EmptyState from "../components/ui/EmptyState";

export default function Workouts() {
  const router = useRouter();
  const { colors } = useTheme();

  // Sample workout categories
  const categories = [
    { id: 1, title: "Força", icon: "anchor" },
    { id: 2, title: "Cardio", icon: "activity" },
    { id: 3, title: "Flexibilidade", icon: "minimize" },
    { id: 4, title: "HIIT", icon: "zap" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title="Treinos" />

      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-2xl font-bold text-foreground mb-6">Seus Treinos</Text>

          <EmptyState
            icon="clipboard"
            title="Em Desenvolvimento"
            description="Estamos trabalhando para trazer treinos personalizados para você em breve!"
            buttonText="Explorar Exercícios"
            onButtonPress={() => router.push("/screens/LogExercise")}
          />

          <View className="mt-8">
            <Text className="text-lg font-bold text-foreground mb-4">Categorias</Text>
            <View className="flex-row flex-wrap justify-between">
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  className="bg-card w-[48%] rounded-xl border border-border p-4 mb-4 items-center"
                  onPress={() => router.push("/screens/LogExercise")}
                >
                  <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-2">
                    <Feather name={category.icon as keyof typeof Feather.glyphMap} size={24} color={colors.primary} />
                  </View>
                  <Text className="text-foreground font-medium">{category.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// app/exercise.tsx
import React, { useState } from "react";
import { Text, View, SafeAreaView, Pressable, ScrollView, TextInput, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";

type ExerciseCategory = "cardio" | "strength" | "flexibility" | "sports" | "other";

interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  caloriesPerMinute: number;
  icon: string;
}

export default function ExercisePage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);

  // Sample exercise data
  const exercises: Exercise[] = [
    { id: "1", name: "Caminhada", category: "cardio", caloriesPerMinute: 5, icon: "trending-up" },
    { id: "2", name: "Corrida", category: "cardio", caloriesPerMinute: 10, icon: "zap" },
    { id: "3", name: "Ciclismo", category: "cardio", caloriesPerMinute: 7, icon: "activity" },
    { id: "4", name: "Natação", category: "cardio", caloriesPerMinute: 8, icon: "droplet" },
    { id: "5", name: "Musculação", category: "strength", caloriesPerMinute: 6, icon: "anchor" },
    { id: "6", name: "Yoga", category: "flexibility", caloriesPerMinute: 3, icon: "sun" },
    { id: "7", name: "Futebol", category: "sports", caloriesPerMinute: 8, icon: "target" },
    { id: "8", name: "Basquete", category: "sports", caloriesPerMinute: 9, icon: "target" },
    { id: "9", name: "Dança", category: "other", caloriesPerMinute: 6, icon: "music" },
  ];

  const categories = [
    { id: "cardio", name: "Cardio", icon: "activity" },
    { id: "strength", name: "Força", icon: "anchor" },
    { id: "flexibility", name: "Flexibilidade", icon: "sun" },
    { id: "sports", name: "Esportes", icon: "target" },
    { id: "other", name: "Outros", icon: "grid" },
  ];

  // Filter exercises based on search and category
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? exercise.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Exercícios</Text>
      </View>

      <View className="p-4">
        <View className="flex-row items-center bg-card rounded-lg border border-border px-3 py-2 mb-4">
          <Feather name="search" size={20} color={colors.mutedForeground} />
          <TextInput
            className="ml-2 flex-1 text-foreground"
            placeholder="Pesquisar exercícios..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <Pressable
            className={`mr-2 px-3 py-2 rounded-full flex-row items-center ${
              selectedCategory === null ? "bg-primary" : "bg-card border border-border"
            }`}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              className={selectedCategory === null ? "text-white" : "text-foreground"}
            >
              Todos
            </Text>
          </Pressable>
          
          {categories.map((category) => (
            <Pressable
              key={category.id}
              className={`mr-2 px-3 py-2 rounded-full flex-row items-center ${
                selectedCategory === category.id ? "bg-primary" : "bg-card border border-border"
              }`}
              onPress={() => setSelectedCategory(category.id as ExerciseCategory)}
            >
              <Feather
                name={category.icon}
                size={16}
                color={selectedCategory === category.id ? "white" : colors.foreground}
                style={{ marginRight: 4 }}
              />
              <Text
                className={selectedCategory === category.id ? "text-white" : "text-foreground"}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4">
        <Text className="text-lg font-bold text-foreground mb-3">Exercícios Populares</Text>
        
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <Pressable
              key={exercise.id}
              className="bg-card rounded-lg border border-border p-4 mb-3 flex-row items-center"
              onPress={() => {
                // This would navigate to a detailed exercise log screen
                // For now just go back as it's a placeholder
                router.back();
              }}
            >
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Feather name={exercise.icon} size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-medium">{exercise.name}</Text>
                <Text className="text-muted-foreground text-xs">Aprox. {exercise.caloriesPerMinute} kcal/min</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </Pressable>
          ))
        ) : (
          <View className="py-8 items-center">
            <Feather name="search" size={48} color={colors.mutedForeground} />
            <Text className="text-muted-foreground mt-2 text-center">
              Nenhum exercício encontrado. Tente outra pesquisa.
            </Text>
          </View>
        )}

        <View className="bg-accent rounded-xl p-6 my-4">
          <Text className="text-lg font-semibold text-accent-foreground mb-2">Registre Seus Exercícios</Text>
          <Text className="text-accent-foreground">
            Acompanhar suas atividades físicas junto com sua alimentação ajuda a manter um balanço energético ideal para seus objetivos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
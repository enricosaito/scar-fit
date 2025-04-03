// app/(tabs)/recipes.tsx
import React from "react";
import { Text, View, SafeAreaView, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Define the type for Feather icon names
type FeatherIconName =
  | "search"
  | "coffee"
  | "calendar"
  | "moon"
  | "pie-chart"
  | "gift"
  | "aperture"
  | "image"
  | "clock"
  | "bar-chart"
  | "star";

interface RecipeCategory {
  name: string;
  icon: FeatherIconName;
}

interface RecipeMacros {
  cals: number;
  p: number;
  c: number;
  f: number;
}

interface Recipe {
  id: number;
  title: string;
  macros: RecipeMacros;
  time: string;
  difficulty: string;
}

export default function Recipes() {
  const { colors } = useTheme();

  const recipeCategories: RecipeCategory[] = [
    { name: "Café da Manhã", icon: "coffee" },
    { name: "Almoço", icon: "calendar" },
    { name: "Jantar", icon: "moon" },
    { name: "Snacks", icon: "pie-chart" },
    { name: "Sobremesas", icon: "gift" },
    { name: "Bebidas", icon: "aperture" },
  ];

  const featuredRecipes: Recipe[] = [
    {
      id: 1,
      title: "Smoothie de Proteína",
      macros: { cals: 320, p: 30, c: 42, f: 5 },
      time: "5 min",
      difficulty: "Fácil",
    },
    {
      id: 2,
      title: "Bowl de Quinoa",
      macros: { cals: 450, p: 18, c: 65, f: 15 },
      time: "15 min",
      difficulty: "Médio",
    },
    {
      id: 3,
      title: "Frango Grelhado com Legumes",
      macros: { cals: 380, p: 40, c: 20, f: 12 },
      time: "20 min",
      difficulty: "Fácil",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          {/* Search bar */}
          <Pressable className="flex-row items-center bg-card rounded-lg border border-border px-3 py-2 mb-6">
            <Feather name="search" size={20} color={colors.mutedForeground} />
            <Text className="ml-2 text-muted-foreground">Pesquisar receitas...</Text>
          </Pressable>

          {/* Categories */}
          <Text className="text-xl font-bold text-foreground mb-4">Categorias</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            className="mb-6"
          >
            {recipeCategories.map((category, index) => (
              <Pressable key={index} className="mr-4 items-center">
                <View className="h-16 w-16 rounded-full bg-primary/10 items-center justify-center mb-2">
                  <Feather name={category.icon} size={22} color={colors.primary} />
                </View>
                <Text className="text-foreground text-sm">{category.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Featured Recipes */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-foreground">Destaques</Text>
            <Pressable>
              <Text className="text-primary">Ver Todos</Text>
            </Pressable>
          </View>

          {featuredRecipes.map((recipe) => (
            <Pressable key={recipe.id} className="bg-card rounded-xl border border-border mb-4 overflow-hidden">
              <View className="h-32 bg-primary/10 items-center justify-center">
                <Feather name="image" size={36} color={colors.mutedForeground} />
              </View>
              <View className="p-4">
                <Text className="text-lg font-medium text-foreground mb-2">{recipe.title}</Text>

                <View className="flex-row justify-between mb-3">
                  <View className="flex-row items-center">
                    <Feather name="clock" size={14} color={colors.mutedForeground} />
                    <Text className="text-muted-foreground text-xs ml-1">{recipe.time}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Feather name="bar-chart" size={14} color={colors.mutedForeground} />
                    <Text className="text-muted-foreground text-xs ml-1">{recipe.difficulty}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between pt-3 border-t border-border">
                  <View>
                    <Text className="text-xs text-muted-foreground">Calorias</Text>
                    <Text className="text-sm font-medium text-foreground">{recipe.macros.cals} kcal</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted-foreground">Proteínas</Text>
                    <Text className="text-sm font-medium text-foreground">{recipe.macros.p}g</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted-foreground">Carbos</Text>
                    <Text className="text-sm font-medium text-foreground">{recipe.macros.c}g</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted-foreground">Gorduras</Text>
                    <Text className="text-sm font-medium text-foreground">{recipe.macros.f}g</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}

          {/* Premium Banner */}
          <View className="bg-primary rounded-xl p-6 mb-6">
            <View className="flex-row items-center mb-3">
              <Feather name="star" size={20} color="white" />
              <Text className="ml-2 text-lg font-bold text-white">Premium</Text>
            </View>
            <Text className="text-white mb-4">
              Desbloqueie receitas exclusivas e personalizadas para seus objetivos de fitness!
            </Text>
            <Pressable className="bg-white py-2 rounded-lg">
              <Text className="text-center text-primary font-medium">Ver Planos</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

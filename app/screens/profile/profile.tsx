// app/screens/profile/profile.tsx (updated without MacroSummary)
import React, { useState } from "react";
import { Text, View, SafeAreaView, Pressable, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { resetUserMacros } from "../../models/user";
import { Goal, ActivityLevel } from "../../screens/onboarding/context/OnboardingContext";

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut, userProfile, refreshProfile, loading, setOnboardingCompleted } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim, sair",
          style: "destructive",
          onPress: async () => {
            setLogoutLoading(true);
            try {
              await signOut();
              // The AuthGuard will handle the navigation
            } catch (error) {
              console.error("Error signing out:", error);
              setLogoutLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleResetMacros = () => {
    Alert.alert(
      "Resetar Macros",
      "Tem certeza que deseja apagar seus dados de macronutrientes?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim, resetar",
          style: "destructive",
          onPress: async () => {
            try {
              if (user) {
                await resetUserMacros(user.id);
                // Also reset the onboarding status
                setOnboardingCompleted(false);
                await refreshProfile();
                Alert.alert("Sucesso", "Seus dados foram resetados com sucesso.");
              }
            } catch (error) {
              console.error("Error resetting macros:", error);
              Alert.alert("Erro", "Não foi possível resetar seus dados. Tente novamente.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Format user's goal to display in Portuguese
  const formatGoal = (goal: Goal | undefined): string => {
    if (!goal) return "";
    const goals: Record<Goal, string> = {
      lose: "Perder Peso",
      maintain: "Manter Peso",
      gain: "Ganhar Massa",
    };
    return goals[goal] || "";
  };

  // Format activity level to display in Portuguese
  const formatActivityLevel = (level: ActivityLevel | undefined): string => {
    if (!level) return "";
    const levels: Record<ActivityLevel, string> = {
      sedentary: "Sedentário",
      light: "Levemente Ativo",
      moderate: "Moderadamente Ativo",
      active: "Muito Ativo",
      extreme: "Extremamente Ativo",
    };
    return levels[level] || "";
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Meu Perfil</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-6 items-center">
          {user && !loading ? (
            <>
              <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-4">
                <Feather name="user" size={40} color={colors.primary} />
              </View>

              <Text className="text-2xl font-bold text-foreground mb-1">
                {user?.user_metadata?.name || userProfile?.full_name || "Usuário"}
              </Text>
              <Text className="text-muted-foreground mb-6">{user?.email}</Text>

              <Pressable
                className="w-full bg-primary py-2 px-4 rounded-lg mb-4"
                onPress={() => router.push("/screens/profile/edit")}
              >
                <Text className="text-white text-center font-medium">Editar Perfil</Text>
              </Pressable>
            </>
          ) : (
            // Show a loading placeholder when logging out
            <View className="w-24 h-24 bg-muted rounded-full items-center justify-center mb-4">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          <Pressable
            className="w-full bg-transparent border border-red-500 py-2 px-4 rounded-lg flex-row justify-center items-center"
            onPress={handleLogout}
            disabled={logoutLoading}
          >
            {logoutLoading ? (
              <ActivityIndicator size="small" color="#ef4444" style={{ marginRight: 8 }} />
            ) : (
              <Feather name="log-out" size={18} color="#ef4444" />
            )}
            <Text className="text-red-500 text-center font-medium ml-2">{logoutLoading ? "Saindo..." : "Sair"}</Text>
          </Pressable>
        </View>

        <View className="px-6 pb-6">
          {userProfile?.macros && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-foreground">Suas Metas Nutricionais</Text>
                <View className="flex-row">
                  {/* Recalculate button */}
                  <Pressable onPress={() => router.push("/screens/onboarding")} className="mr-4">
                    <Text className="text-primary text-sm">Recalcular</Text>
                  </Pressable>
                  <Pressable onPress={handleResetMacros}>
                    <Text className="text-primary text-sm">Resetar</Text>
                  </Pressable>
                </View>
              </View>

              {/* Simple, non-graphical macros display */}
              <View className="bg-card rounded-xl border border-border p-4">
                {/* Calories target */}
                <View className="border-b border-border pb-3 mb-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-full bg-primary/15 items-center justify-center mr-2">
                        <Feather name="battery-charging" size={16} color={colors.primary} />
                      </View>
                      <Text className="text-foreground font-medium">Calorias</Text>
                    </View>
                    <Text className="text-2xl font-bold text-foreground">{userProfile.macros.calories}</Text>
                  </View>
                  <Text className="text-xs text-muted-foreground mt-1">
                    {formatGoal(userProfile.macros.goal as Goal)} •{" "}
                    {formatActivityLevel(userProfile.macros.activityLevel as ActivityLevel)}
                  </Text>
                </View>

                {/* Macros breakdown */}
                <View className="flex-row justify-between">
                  {/* Protein */}
                  <View className="items-center flex-1 border-r border-border pr-2">
                    <View className="w-6 h-6 rounded-full bg-purple-500/20 items-center justify-center mb-1">
                      <Feather name="award" size={12} color="#a855f7" />
                    </View>
                    <Text className="text-xs text-muted-foreground">Proteínas</Text>
                    <Text className="text-lg font-bold text-foreground">{userProfile.macros.protein}g</Text>
                    <Text className="text-xs text-purple-500">
                      {Math.round((userProfile.macros.protein * 4 * 100) / userProfile.macros.calories)}%
                    </Text>
                  </View>

                  {/* Carbs */}
                  <View className="items-center flex-1 border-r border-border px-2">
                    <View className="w-6 h-6 rounded-full bg-yellow-500/20 items-center justify-center mb-1">
                      <Feather name="pie-chart" size={12} color="#eab308" />
                    </View>
                    <Text className="text-xs text-muted-foreground">Carboidratos</Text>
                    <Text className="text-lg font-bold text-foreground">{userProfile.macros.carbs}g</Text>
                    <Text className="text-xs text-yellow-500">
                      {Math.round((userProfile.macros.carbs * 4 * 100) / userProfile.macros.calories)}%
                    </Text>
                  </View>

                  {/* Fat */}
                  <View className="items-center flex-1 pl-2">
                    <View className="w-6 h-6 rounded-full bg-red-500/20 items-center justify-center mb-1">
                      <Feather name="droplet" size={12} color="#ef4444" />
                    </View>
                    <Text className="text-xs text-muted-foreground">Gorduras</Text>
                    <Text className="text-lg font-bold text-foreground">{userProfile.macros.fat}g</Text>
                    <Text className="text-xs text-red-500">
                      {Math.round((userProfile.macros.fat * 9 * 100) / userProfile.macros.calories)}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <Text className="text-lg font-bold text-foreground mb-4">Estatísticas</Text>

          <View className="bg-card rounded-xl border border-border p-4 mb-6">
            <Text className="text-muted-foreground mb-2">Plano Atual</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-foreground">Gratuito</Text>
              <View className="bg-primary py-1 px-3 rounded-full">
                <Text className="text-white text-xs font-medium">Upgrade</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Updated app/screens/profile/profile.tsx
import React, { useState } from "react";
import { Text, View, SafeAreaView, Pressable, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Goal, ActivityLevel } from "../../screens/onboarding/context/OnboardingContext";

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut, userProfile, refreshProfile, loading, setOnboardingCompleted } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Golden colors for premium feature (consistent with existing PRO styling)
  const goldColor = "#F7B955";
  const goldBg = "rgba(247, 185, 85, 0.2)";

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

  const handleCustomGoalPress = () => {
    // Check if user is on free plan
    if (userProfile?.plan !== "premium") {
      router.push("/screens/pro-subscription");
    } else {
      // If user is premium, navigate to custom goal screen
      router.push("/screens/profile/custom-goal");
    }
  };

  // Check if user is premium
  const isPremium = userProfile?.plan === "premium";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between p-4 border-b border-border relative">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>

        <Text className="text-lg font-medium text-foreground absolute left-1/2 -translate-x-1/2">Meu Perfil</Text>

        <Pressable onPress={handleLogout} disabled={logoutLoading} className="p-2">
          {logoutLoading ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Feather name="log-out" size={22} color="#ef4444" />
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        <View className="p-6 items-center">
          {user && !loading ? (
            <>
              {/* User avatar with conditional gold border for premium users */}
              <View
                className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${
                  isPremium ? "border-2" : "bg-primary/20"
                }`}
                style={isPremium ? { borderColor: goldColor, backgroundColor: `${goldColor}10` } : {}}
              >
                <Feather name="user" size={40} color={isPremium ? goldColor : colors.primary} />
                {isPremium && (
                  <View
                    className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: goldBg }}
                  >
                    <Text className="text-xs font-bold" style={{ color: goldColor }}>
                      PRO
                    </Text>
                  </View>
                )}
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
        </View>

        <View className="px-6 pb-6">
          {userProfile?.macros && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-foreground">Suas Metas Nutricionais</Text>
              </View>

              {/* Action buttons - now styled as proper buttons */}
              <View className="flex-row mb-4">
                <Pressable
                  onPress={() => router.push("/screens/onboarding")}
                  className="flex-1 py-2 rounded-lg flex-row items-center justify-center mr-2"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <Feather name="refresh-cw" size={16} color={colors.primary} />
                  <Text className="text-primary font-medium ml-2">Recalcular</Text>
                </Pressable>

                <Pressable
                  onPress={handleCustomGoalPress}
                  className="flex-1 py-2 rounded-lg flex-row items-center justify-center"
                  style={{ backgroundColor: isPremium ? goldBg : "#33415520" }}
                >
                  <Feather name="feather" size={16} color={isPremium ? goldColor : colors.mutedForeground} />
                  <Text className="font-medium ml-2" style={{ color: isPremium ? goldColor : colors.mutedForeground }}>
                    Personalizar
                  </Text>
                  {!isPremium && (
                    <View className="ml-1 px-1 rounded" style={{ backgroundColor: goldBg }}>
                      <Text className="text-xs" style={{ color: goldColor }}>
                        PRO
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>

              {/* Simple, non-graphical macros display */}
              <View
                className={`bg-card rounded-xl border border-border p-4 ${
                  isPremium && userProfile.macros.isCustom ? "border-2" : ""
                }`}
                style={isPremium && userProfile.macros.isCustom ? { borderColor: goldColor } : {}}
              >
                {/* Calories target */}
                <View className="border-b border-border pb-3 mb-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-2"
                        style={{
                          backgroundColor: `${colors.primary}15`,
                        }}
                      >
                        <Feather name="zap" size={16} color={colors.primary} />
                      </View>
                      <Text className="text-foreground font-medium">Calorias</Text>
                    </View>
                    <Text className="text-2xl font-bold text-foreground">{userProfile.macros.calories}</Text>
                  </View>
                  <Text className="text-xs text-muted-foreground mt-1">
                    {formatGoal(userProfile.macros.goal as Goal)} •{" "}
                    {formatActivityLevel(userProfile.macros.activityLevel as ActivityLevel)}
                    {userProfile.macros.isCustom && <Text style={{ color: goldColor }}> • Meta Personalizada</Text>}
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
          <View className="bg-card rounded-xl border border-border p-4 mb-6">
            <Text className="text-muted-foreground mb-2">Plano Atual</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold" style={{ color: isPremium ? goldColor : colors.foreground }}>
                {isPremium ? "Premium" : "Gratuito"}
              </Text>
              {!isPremium && (
                <Pressable
                  className="py-1 px-3 rounded-full"
                  style={{ backgroundColor: goldBg }}
                  onPress={() => router.push("/screens/pro-subscription")}
                >
                  <Text className="text-xs font-medium" style={{ color: goldColor }}>
                    Fazer Upgrade
                  </Text>
                </Pressable>
              )}
            </View>
            {isPremium && (
              <View
                className="mt-2 py-1 px-2 rounded border flex-row items-center"
                style={{ backgroundColor: goldBg, borderColor: goldColor + "20" }}
              >
                <Feather name="zap" size={14} color={goldColor} style={{ marginRight: 4 }} />
                <Text className="text-xs font-medium" style={{ color: goldColor }}>
                  Assinatura PRO
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// app/components/ui/Header.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import Avatar from "./Avatar";

interface HeaderProps {
  title?: string;
  showProfile?: boolean;
  showNotifications?: boolean;
}

export default function Header({ title = "Scar Fit", showProfile = true, showNotifications = true }: HeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { userProfile } = useAuth();

  // Check if user is premium
  const isPremium = userProfile?.plan === "premium";
  // Gold color for premium users
  const goldColor = "#F7B955";

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border shadow-sm">
      {showProfile ? (
        <Pressable onPress={() => router.push("/screens/profile/profile")} className="p-1">
          <View
            className={`${isPremium ? "border-2" : ""}`}
            style={isPremium ? { borderColor: goldColor, borderRadius: 9999 } : {}}
          >
            <Avatar url={userProfile?.avatar_url} size={40} />
          </View>
        </Pressable>
      ) : (
        <View className="w-10" />
      )}

      <Text className="text-base font-semibold text-center text-foreground">
        {title}
        {title === "Scar Fit" && <Text className="text-primary"> ⚡</Text>}
      </Text>

      {showNotifications ? (
        <Pressable onPress={() => router.push("/screens/notifications")} className="p-1">
          <View className="w-10 h-10 rounded-full bg-primary/15 items-center justify-center">
            <Feather name="bell" size={20} color={colors.primary} />
          </View>
        </Pressable>
      ) : (
        <View className="w-10" />
      )}
    </View>
  );
}

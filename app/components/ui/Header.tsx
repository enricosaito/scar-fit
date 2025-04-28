// app/components/ui/Header.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import Avatar from "./Avatar";
import { getAvatarUrlWithCacheBusting } from "../../utils/imageUpload";

interface HeaderProps {
  title?: string;
  showProfile?: boolean;
  showNotifications?: boolean;
}

export default function Header({ title = "Scar Fit", showProfile = true, showNotifications = true }: HeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { userProfile, profileLoading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  // Check if user is premium
  const isPremium = userProfile?.plan === "premium";
  // Gold color for premium users
  const goldColor = "#F7B955";

  // Update avatar URL when profile changes or loading completes
  useEffect(() => {
    if (userProfile?.avatar_url) {
      // Use cache busting to ensure we get the latest avatar
      const cacheBustedUrl = getAvatarUrlWithCacheBusting(userProfile.avatar_url);
      setAvatarUrl(cacheBustedUrl);
    } else {
      setAvatarUrl(undefined);
    }
  }, [userProfile?.avatar_url, profileLoading]);

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border shadow-sm">
      {showProfile ? (
        <Pressable
          onPress={() => router.push("/screens/profile/ViewProfile")}
          className="p-1"
          // Force a refresh of the avatar when pressed
          onLongPress={() => {
            if (userProfile?.avatar_url) {
              // Force a refresh by setting the URL to undefined briefly
              setAvatarUrl(undefined);
              setTimeout(() => {
                if (userProfile?.avatar_url) {
                  const refreshedUrl = getAvatarUrlWithCacheBusting(userProfile.avatar_url);
                  setAvatarUrl(refreshedUrl);
                }
              }, 50);
            }
          }}
        >
          <View
            className={`${isPremium ? "border-2" : ""}`}
            style={isPremium ? { borderColor: goldColor, borderRadius: 9999 } : {}}
          >
            <Avatar
              url={avatarUrl}
              size={40}
              // Force unique key to ensure re-rendering when avatar changes
              key={`avatar-${avatarUrl || "none"}`}
            />
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
        <Pressable onPress={() => router.push("/screens/NotificationsTab")} className="p-1">
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

import React, { useState } from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/utils";
import { getAvatarUrlWithCacheBusting } from "../../utils/imageUpload";
import { Image } from "expo-image";

// Define a placeholder blurhash for smooth loading
const AVATAR_PLACEHOLDER = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface AvatarProps {
  url?: string | null;
  size?: number;
  className?: string;
}

export default function Avatar({ url, size = 40, className }: AvatarProps) {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);

  // Use cache-busting URL to ensure avatar is refreshed after updates
  const cacheBustingUrl = getAvatarUrlWithCacheBusting(url);

  // If no URL or image fails to load, show default icon
  if (!cacheBustingUrl || imageError) {
    return (
      <View
        className={cn(`bg-primary/20 items-center justify-center rounded-full`, className)}
        style={{ width: size, height: size }}
      >
        <Feather name="user" size={size * 0.5} color={colors.primary} />
      </View>
    );
  }

  return (
    <View className={cn("rounded-full overflow-hidden", className)} style={{ width: size, height: size }}>
      <Image
        source={{ uri: cacheBustingUrl }}
        style={{ width: size, height: size }}
        contentFit="cover"
        transition={200}
        placeholder={AVATAR_PLACEHOLDER}
        cachePolicy="memory-disk"
        onError={() => setImageError(true)}
      />
    </View>
  );
}

import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
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
  const [isLoading, setIsLoading] = useState(false);

  // Create a stable URL reference that won't change with every render
  // This prevents cache busting on every render, but still respects URL changes
  const [stableUrl, setStableUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Only update the stable URL when the input URL changes
    // Don't add cache busting here - only when the URL actually changes
    if (url !== undefined && url !== null && url !== stableUrl?.split("?")[0]) {
      setStableUrl(url);
      // Reset error state when URL changes
      setImageError(false);
    }
  }, [url]);

  // If no URL or image fails to load, show default icon
  if (!stableUrl || imageError) {
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
      {isLoading && (
        <View className="absolute inset-0 flex-1 items-center justify-center bg-primary/10 z-10">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
      <Image
        source={{ uri: stableUrl }}
        style={{ width: size, height: size }}
        contentFit="cover"
        transition={100}
        placeholder={AVATAR_PLACEHOLDER}
        cachePolicy="memory-disk"
        recyclingKey={stableUrl} // Use the URL as recycling key for better caching
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.error("Failed to load image:", stableUrl);
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </View>
  );
}

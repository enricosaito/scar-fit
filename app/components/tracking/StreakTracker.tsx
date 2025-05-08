// app/components/tracking/StreakTracker.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import * as Haptics from "expo-haptics";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  onPress?: () => void;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({ currentStreak, longestStreak, todayCompleted, onPress }) => {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Determine celebration level
  const isMilestone = currentStreak > 0 && currentStreak % 5 === 0; // Every 5 days is a milestone
  const streakColor = isMilestone ? "#F7B955" : colors.primary; // Gold color for milestones

  // Pulse animation
  useEffect(() => {
    // Only animate when todayCompleted is true
    if (todayCompleted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [todayCompleted, currentStreak]);

  // Lightning bolt animation
  useEffect(() => {
    if (todayCompleted) {
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [todayCompleted]);

  // Handle streak count tap - trigger haptic feedback
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [-0.1, 0, 0.1],
    outputRange: ["-5deg", "0deg", "5deg"],
  });

  return (
    <Pressable onPress={handlePress} className="bg-card rounded-xl border border-border p-4 mb-4">
      <View className="flex-row items-center">
        {/* Streak Counter with Lightning Icon */}
        <Animated.View
          className={`flex-row items-center px-3 py-2 rounded-full ${
            isMilestone ? "bg-yellow-500/20" : "bg-primary/20"
          }`}
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Animated.View
            style={{
              transform: [{ rotate }],
            }}
          >
            <Feather name="zap" size={20} color={streakColor} />
          </Animated.View>
          <Text className="text-primary font-bold text-lg ml-1" style={{ color: streakColor }}>
            {currentStreak}
          </Text>
        </Animated.View>

        {/* Streak Text */}
        <View className="ml-3 flex-1">
          <Text className="text-foreground font-medium">
            {isMilestone
              ? `Incrível! ${currentStreak} dias consecutivos! 🔥`
              : currentStreak > 1
              ? `${currentStreak} dias consecutivos!`
              : currentStreak === 1
              ? "Primeiro dia! Continue assim!"
              : "Comece seu streak hoje!"}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {todayCompleted ? "Metas de hoje alcançadas! Volte amanhã!" : "Registre refeições para manter seu streak"}
          </Text>
          {longestStreak > currentStreak && (
            <Text className="text-muted-foreground text-xs">Seu recorde: {longestStreak} dias</Text>
          )}
        </View>

        {/* Today's Status */}
        <View className={`p-2 rounded-full ${todayCompleted ? "bg-green-500/20" : "bg-muted"}`}>
          <Feather
            name={todayCompleted ? "check" : "clock"}
            size={16}
            color={todayCompleted ? "#22c55e" : colors.mutedForeground}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default StreakTracker;

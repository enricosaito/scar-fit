// app/(tabs)/analytics.tsx
import React from "react";
import { Text, View, SafeAreaView, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/ui/Header";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

export default function Analytics() {
  const router = useRouter();
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;

  // Sample data - this would come from your backend
  const achievements = [
    { id: 1, title: "First Workout", icon: "award", progress: 100 },
    { id: 2, title: "7 Day Streak", icon: "zap", progress: 85 },
    { id: 3, title: "Weight Goal", icon: "trending-down", progress: 60 },
  ];

  const recentLogs = [
    { id: 1, date: "2024-03-20", type: "Workout", duration: "45 min" },
    { id: 2, date: "2024-03-19", type: "Meal", calories: "1800" },
    { id: 3, date: "2024-03-18", type: "Weight", value: "75kg" },
  ];

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: (opacity = 1) => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title="Analytics" />

      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          {/* Streak Section */}
          <View className="bg-card rounded-xl p-4 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-2">Current Streak</Text>
            <View className="flex-row items-center">
              <Feather name="zap" size={24} color={colors.primary} />
              <Text className="text-3xl font-bold text-primary ml-2">7 days</Text>
            </View>
          </View>

          {/* Progress Chart */}
          <View className="bg-card rounded-xl p-4 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Weekly Progress</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => colors.primary,
                labelColor: (opacity = 1) => colors.foreground,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: colors.primary,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>

          {/* Achievements Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">Achievements</Text>
            <View className="space-y-4">
              {achievements.map((achievement) => (
                <Pressable
                  key={achievement.id}
                  className="bg-card rounded-xl p-4 border border-border"
                  onPress={() => {}}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                        <Feather
                          name={achievement.icon as keyof typeof Feather.glyphMap}
                          size={24}
                          color={colors.primary}
                        />
                      </View>
                      <Text className="text-foreground font-medium ml-4">{achievement.title}</Text>
                    </View>
                    <View className="w-20 h-2 bg-border rounded-full">
                      <View className="h-full bg-primary rounded-full" style={{ width: `${achievement.progress}%` }} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Recent Logs Section */}
          <View>
            <Text className="text-xl font-bold text-foreground mb-4">Recent Logs</Text>
            <View className="space-y-4">
              {recentLogs.map((log) => (
                <Pressable key={log.id} className="bg-card rounded-xl p-4 border border-border" onPress={() => {}}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-foreground font-medium">{log.type}</Text>
                      <Text className="text-muted-foreground">{log.date}</Text>
                    </View>
                    <Text className="text-foreground">{log.duration || log.calories || log.value}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// app/(tabs)/_layout.tsx (improved tab positioning)
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

export default function TabLayout() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 70, // Increased height for more space
          paddingVertical: 15, // Added vertical padding to center the content
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarIconStyle: {
          marginTop: 0, // Adjusted to move icons up
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 0, // Adjusted to reduce spacing between icon and label
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Feather name="home" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: "Calcular",
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Feather name="sliders" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <View className="bg-primary h-14 w-14 rounded-full items-center justify-center -mt-3 mb-1 shadow-lg">
              <Feather name="plus" size={28} color="white" />
            </View>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            // Navigate directly to search
            router.push({
              pathname: "/tracking",
              params: { showSearch: "true" },
            });
          },
        })}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Receitas",
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <FontAwesome5 name="utensils" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Mais",
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Feather name="more-horizontal" size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

// app/(tabs)/_layout.tsx
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
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        // Add common header elements
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.foreground,
        headerLeft: () => (
          <Pressable onPress={() => router.push("/profile")} className="ml-4 p-2">
            <Feather name="user" size={22} color={colors.foreground} />
          </Pressable>
        ),
        headerRight: () => (
          <Pressable onPress={() => router.push("/notifications")} className="mr-4 p-2">
            <Feather name="bell" size={22} color={colors.foreground} />
          </Pressable>
        ),
        headerTitle: "Scar Fit",
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: "Calculadora",
          tabBarIcon: ({ color }) => <Feather name="sliders" size={24} color={color} />,
          headerShown: false, // Hide header for calculator
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <View className="bg-primary h-14 w-14 rounded-full items-center justify-center -mt-5 shadow-lg">
              <Feather name="plus" size={28} color="white" />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            // Navigate to tracking with "add" mode
            router.push("/tracking?mode=add");
          },
        })}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Receitas",
          // Use FontAwesome5 for chef-hat icon
          tabBarIcon: ({ color }) => <FontAwesome5 name="utensils" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Mais",
          tabBarIcon: ({ color }) => <Feather name="more-horizontal" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

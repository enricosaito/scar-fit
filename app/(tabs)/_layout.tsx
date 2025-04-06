// app/(tabs)/_layout.tsx (updated)
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
          height: 56, // Reduced from 60 to move it up a bit
          paddingTop: 8, // Increased padding to move icons up
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 4, // Adjust to position text better
        },
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
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <View className="bg-primary h-14 w-14 rounded-full items-center justify-center -mt-4 shadow-lg">
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

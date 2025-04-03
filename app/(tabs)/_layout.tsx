// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: { backgroundColor: "white" },
        tabBarActiveTintColor: "#1eb866",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Calculadora",
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Receitas",
          tabBarIcon: ({ color }) => <Feather name="book" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

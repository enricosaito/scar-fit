// app/(tabs)/_layout.tsx (updated)
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useAddMenu } from "../context/AddMenuContext";

export default function TabLayout() {
  const { colors } = useTheme();
  const { showMenu } = useAddMenu();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 70,
          paddingVertical: 15,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 0,
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
          tabBarButton: (props) => (
            <Pressable
              {...props}
              onPress={showMenu}
              className="h-full justify-center items-center"
            >
              <View className="bg-primary h-14 w-14 rounded-full items-center justify-center -mt-5 shadow-lg">
                <Feather name="plus" size={28} color="white" />
              </View>
            </Pressable>
          ),
        }}
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
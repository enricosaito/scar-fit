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
        name="workouts"
        options={{
          title: "Treinos",
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Feather name="activity" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default tab navigation behavior
            e.preventDefault();
            // Show the menu instead
            showMenu();
          },
        })}
        options={{
          title: "",
          tabBarButton: (props) => (
            <Pressable
              {...props}
              onPress={(e) => {
                // Prevent navigation
                e.preventDefault();
                // Show the menu
                showMenu();
              }}
              className="h-full justify-center items-center"
            >
              <View
                className="bg-primary rounded-full items-center justify-center -mt-5 shadow-lg"
                style={{
                  width: 56,
                  height: 56,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
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

// app/profile.tsx
import React from "react";
import { Text, View, SafeAreaView } from "react-native";
import "../global.css";

export default function Profile() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center">
        <Text className="text-foreground text-lg">Perfil do Usuário</Text>
        <Text className="text-muted-foreground mt-2">Em breve: Gerencie seu perfil e preferências</Text>
      </View>
    </SafeAreaView>
  );
}

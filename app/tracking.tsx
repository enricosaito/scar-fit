// app/tracking.tsx
import React from "react";
import { Text, View, SafeAreaView } from "react-native";
import "../global.css";

export default function Tracking() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center">
        <Text className="text-foreground text-lg">Acompanhamento de Refeições</Text>
        <Text className="text-muted-foreground mt-2">Em breve: Acompanhe seu consumo diário de macros</Text>
      </View>
    </SafeAreaView>
  );
}

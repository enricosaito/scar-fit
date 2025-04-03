// app/(tabs)/add.tsx
import React from "react";
import { View, Text } from "react-native";

// This file exists just to make the tab navigation work correctly
// The actual navigation to the add meal screen is handled in _layout.tsx
export default function Add() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Redirecting...</Text>
    </View>
  );
}

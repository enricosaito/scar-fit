// app/(tabs)/add.tsx (updated)
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import AddMenu from "../components/AddMenu";

export default function Add() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(true);

  const handleClose = () => {
    setShowMenu(false);
    // Navigate back to home tab when menu is closed
    router.replace("/(tabs)");
  };

  // Show menu when this tab is focused
  useEffect(() => {
    setShowMenu(true);
  }, []);

  return (
    <View className="flex-1">
      <AddMenu visible={showMenu} onClose={handleClose} />
    </View>
  );
}
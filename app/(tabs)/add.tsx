// app/(tabs)/add.tsx
import React from "react";
import { View } from "react-native";
import { useEffect } from "react";
import { useRouter, usePathname } from "expo-router";
import { useAddMenu } from "../context/AddMenuContext";

export default function Add() {
  const router = useRouter();
  const pathname = usePathname();
  const { showMenu } = useAddMenu();

  // If the user navigates directly to this route, show menu and go back to home
  useEffect(() => {
    // Show the menu
    showMenu();

    // If we're directly on the add route, redirect to the home tab
    if (pathname === "/(tabs)/add") {
      router.replace("/(tabs)");
    }

    // Return a cleanup function that does nothing
    return () => {};
  }, [pathname, router, showMenu]);

  // This component doesn't render anything meaningful
  return <View className="hidden" />;
}

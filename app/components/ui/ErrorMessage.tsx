// app/components/ui/ErrorMessage.tsx
import React from "react";
import { View, Text } from "react-native";

interface ErrorMessageProps {
  message: string;
  type?: "error" | "warning" | "success";
}

const ErrorMessage = ({ message, type = "error" }: ErrorMessageProps) => {
  if (!message) return null;

  const bgColor = type === "error" ? "bg-red-500/10" : type === "warning" ? "bg-yellow-500/10" : "bg-green-500/10";

  const borderColor =
    type === "error" ? "border-red-500/30" : type === "warning" ? "border-yellow-500/30" : "border-green-500/30";

  const textColor = type === "error" ? "text-red-500" : type === "warning" ? "text-yellow-500" : "text-green-500";

  return (
    <View className={`mb-4 p-3 rounded-lg border ${bgColor} ${borderColor}`}>
      <Text className={textColor}>{message}</Text>
    </View>
  );
};

export default ErrorMessage;

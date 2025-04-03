// app/components/ui/Button.tsx
import React from "react";
import { Text, Pressable, PressableProps } from "react-native";

interface ButtonProps extends PressableProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
}

export default function Button({
  variant = "default",
  size = "default",
  className,
  textClassName,
  children,
  disabled,
  ...props
}: ButtonProps) {
  // Get variant styles
  const getButtonStyle = () => {
    switch (variant) {
      case "default":
        return "bg-primary";
      case "outline":
        return "bg-transparent border border-gray-300";
      case "secondary":
        return "bg-gray-100";
      case "ghost":
        return "bg-transparent";
      default:
        return "bg-primary";
    }
  };

  // Get text styles
  const getTextStyle = () => {
    switch (variant) {
      case "default":
        return "text-white";
      case "outline":
        return "text-gray-900";
      case "secondary":
        return "text-gray-900";
      case "ghost":
        return "text-gray-900";
      default:
        return "text-white";
    }
  };

  // Get size styles
  const getSizeStyle = () => {
    switch (size) {
      case "default":
        return "py-2 px-4";
      case "sm":
        return "py-1 px-2";
      case "lg":
        return "py-3 px-6";
      default:
        return "py-2 px-4";
    }
  };

  return (
    <Pressable
      disabled={disabled}
      className={`flex flex-row items-center justify-center rounded-md 
        ${getButtonStyle()} ${getSizeStyle()} 
        ${disabled ? "opacity-50" : "opacity-100"} 
        ${className || ""}`}
      {...props}
    >
      <Text className={`font-medium ${getTextStyle()} ${textClassName || ""}`}>{children}</Text>
    </Pressable>
  );
}

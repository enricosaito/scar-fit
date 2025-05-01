// app/components/ui/Button.tsx
import React from "react";
import { Text, Pressable, PressableProps, ActivityIndicator } from "react-native";

interface ButtonProps extends PressableProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  loading?: boolean;
  loadingText?: string;
}

export default function Button({
  variant = "default",
  size = "default",
  className,
  textClassName,
  children,
  disabled,
  loading = false,
  loadingText,
  accessibilityLabel,
  ...props
}: ButtonProps) {
  // Get variant styles
  const getButtonStyle = () => {
    switch (variant) {
      case "default":
        return "bg-primary";
      case "outline":
        return "bg-transparent border border-border";
      case "secondary":
        return "bg-secondary";
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
        return "text-primary-foreground";
      case "outline":
        return "text-foreground";
      case "secondary":
        return "text-secondary-foreground";
      case "ghost":
        return "text-foreground";
      default:
        return "text-primary-foreground";
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

  // Convert ReactNode to string for accessibility label if needed
  const getAccessibilityLabel = (): string | undefined => {
    if (accessibilityLabel) return accessibilityLabel as string;
    if (typeof children === "string") return children;
    return undefined;
  };

  return (
    <Pressable
      disabled={disabled || loading}
      className={`flex flex-row items-center justify-center rounded-md 
        ${getButtonStyle()} ${getSizeStyle()} 
        ${disabled || loading ? "opacity-50" : "opacity-100"} 
        ${className || ""}`}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...props}
    >
      {loading ? (
        <>
          <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
          {loadingText && <Text className={`font-medium ${getTextStyle()} ${textClassName || ""}`}>{loadingText}</Text>}
        </>
      ) : (
        <Text className={`font-medium ${getTextStyle()} ${textClassName || ""}`}>{children}</Text>
      )}
    </Pressable>
  );
}

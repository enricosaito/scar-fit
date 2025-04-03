// app/components/ui/Button.tsx
import React from "react";
import { Text, Pressable, PressableProps, View } from "react-native";
import { cn } from "@/app/lib/utils";

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
  const baseStyles = "flex flex-row items-center justify-center rounded-md";

  const variantStyles = {
    default: "bg-primary",
    outline: "border border-border bg-transparent",
    secondary: "bg-secondary",
    ghost: "bg-transparent",
  };

  const sizeStyles = {
    default: "px-4 py-2",
    sm: "px-2 py-1 text-sm",
    lg: "px-6 py-3 text-lg",
  };

  const textStyles = {
    default: "text-primary-foreground font-medium",
    outline: "text-foreground font-medium",
    secondary: "text-secondary-foreground font-medium",
    ghost: "text-foreground font-medium",
  };

  return (
    <Pressable
      disabled={disabled}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], disabled && "opacity-50", className)}
      {...props}
    >
      <Text className={cn(textStyles[variant], textClassName)}>{children}</Text>
    </Pressable>
  );
}

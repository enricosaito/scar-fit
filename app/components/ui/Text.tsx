// app/components/ui/Text.tsx
import React from "react";
import { Text as RNText, TextProps } from "react-native";
import { cn } from "../../lib/utils";

interface TextComponentProps extends TextProps {
  className?: string;
  children: React.ReactNode;
}

const Text = ({ className = "", style, children, ...props }: TextComponentProps) => {
  return (
    <RNText className={cn("font-sans", className)} style={style} {...props}>
      {children}
    </RNText>
  );
};

export default Text;

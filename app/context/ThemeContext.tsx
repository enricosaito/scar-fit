// app/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { colors } from "../theme/colors";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: typeof colors.light;
}

const defaultTheme: ThemeType = "light";

export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  toggleTheme: () => {},
  colors: colors.light,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceTheme = (useColorScheme() as ThemeType) || defaultTheme;
  const [theme, setTheme] = useState<ThemeType>(deviceTheme);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        colors: colors[theme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Create a default export object that includes all the exports
const ThemeExports = {
  ThemeContext,
  ThemeProvider,
  useTheme,
};

export default ThemeExports;

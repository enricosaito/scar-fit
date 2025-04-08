// app/context/AddMenuContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { BackHandler } from "react-native";
import { useEffect } from "react";

interface AddMenuContextType {
  isMenuVisible: boolean;
  showMenu: () => void;
  hideMenu: () => void;
}

const AddMenuContext = createContext<AddMenuContextType | undefined>(undefined);

export function AddMenuProvider({ children }: { children: React.ReactNode }) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const showMenu = useCallback(() => {
    setIsMenuVisible(true);
  }, []);

  const hideMenu = useCallback(() => {
    setIsMenuVisible(false);
  }, []);

  // Handle back button press on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isMenuVisible) {
        hideMenu();
        return true; // Prevent default behavior (closing the app)
      }
      return false; // Let the default behavior happen (go back or exit app)
    });

    return () => backHandler.remove();
  }, [isMenuVisible, hideMenu]);

  return <AddMenuContext.Provider value={{ isMenuVisible, showMenu, hideMenu }}>{children}</AddMenuContext.Provider>;
}

export function useAddMenu() {
  const context = useContext(AddMenuContext);
  if (context === undefined) {
    throw new Error("useAddMenu must be used within an AddMenuProvider");
  }
  return context;
}

export default AddMenuProvider;

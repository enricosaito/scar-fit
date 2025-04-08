// app/context/AddMenuContext.tsx
import React, { createContext, useContext, useState } from "react";

interface AddMenuContextType {
  isMenuVisible: boolean;
  showMenu: () => void;
  hideMenu: () => void;
}

const AddMenuContext = createContext<AddMenuContextType | undefined>(undefined);

export function AddMenuProvider({ children }: { children: React.ReactNode }) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const showMenu = () => setIsMenuVisible(true);
  const hideMenu = () => setIsMenuVisible(false);

  return (
    <AddMenuContext.Provider value={{ isMenuVisible, showMenu, hideMenu }}>
      {children}
    </AddMenuContext.Provider>
  );
}

export function useAddMenu() {
  const context = useContext(AddMenuContext);
  if (context === undefined) {
    throw new Error("useAddMenu must be used within an AddMenuProvider");
  }
  return context;
}
// Modify app/screens/onboarding/context/OnboardingContext.tsx
import React, { createContext, useContext, ReactNode } from "react";

// Types
export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "extreme";
export type Goal = "lose" | "maintain" | "gain";

export interface OnboardingFormData {
  gender: Gender;
  age: string;
  weight: string;
  height: string;
  activityLevel: ActivityLevel;
  goal: Goal;
}

interface OnboardingProviderProps {
  children: ReactNode;
  value: OnboardingContextType;
}

interface OnboardingContextType {
  formData: OnboardingFormData;
  updateFormData: (key: keyof OnboardingFormData, value: any) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children, value }: OnboardingProviderProps) => {
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

// Add default export
export default { OnboardingContext, OnboardingProvider, useOnboarding };

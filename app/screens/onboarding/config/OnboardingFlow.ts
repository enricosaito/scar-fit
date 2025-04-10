// /app/screens/onboarding/config/onboardingFlow.ts

import { ReactNode } from "react";
import Welcome from "../steps/Welcome";
import PersonalInfo from "../steps/PersonalInfo";
import ActivityLevel from "../steps/ActivityLevel";
import Goal from "../steps/Goal";
import Results from "../steps/Results";

// This makes it easy to reorder steps or add/remove steps
export interface OnboardingStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  animationIn?: string; // Animation when entering
  animationOut?: string; // Animation when leaving
  delay?: number; // Delay before animation starts
  skipEnabled?: boolean; // Whether step can be skipped
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo",
    component: Welcome,
    animationIn: "fadeIn",
    animationOut: "fadeOut",
    skipEnabled: false,
  },
  {
    id: "personal",
    title: "Dados Pessoais",
    component: PersonalInfo,
    animationIn: "slideInRight",
    animationOut: "slideOutLeft",
    skipEnabled: false,
  },
  {
    id: "activity",
    title: "Nível de Atividade",
    component: ActivityLevel,
    animationIn: "slideInRight",
    animationOut: "slideOutLeft",
    skipEnabled: false,
  },
  {
    id: "goal",
    title: "Objetivo",
    component: Goal,
    animationIn: "slideInRight",
    animationOut: "slideOutLeft",
    skipEnabled: false,
  },
  {
    id: "results",
    title: "Resultados",
    component: Results,
    animationIn: "fadeIn",
    animationOut: "fadeOut",
    skipEnabled: false,
  },
];

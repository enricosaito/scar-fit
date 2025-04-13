// app/screens/onboarding.tsx
import React from "react";
import { Redirect } from "expo-router";

export default function OnboardingRedirect() {
  return <Redirect href="/screens/onboarding/index" />;
}

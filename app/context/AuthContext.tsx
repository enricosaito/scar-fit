// app/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { createUserProfile, getUserProfile, updateUserProfile, UserProfile } from "../models/user";
import { signInWithGoogle } from "../lib/googleAuth";
import { isAppleAuthAvailable, signInWithApple } from "../lib/appleAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { preloadAvatarImage } from "../utils/imageUpload";

const ONBOARDING_COMPLETED_KEY = "onboardingCompleted";

interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  initialized: boolean;
  onboardingCompleted: boolean;
}

type AuthResult = { error: Error | null };

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  isAppleAuthAvailable: () => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<number | void>;
  setOnboardingCompleted: (completed: boolean) => void;
  loading: boolean;
  profileLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialAuthState: AuthState = {
  user: null,
  session: null,
  userProfile: null,
  initialized: false,
  onboardingCompleted: false,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const [authLoading, setAuthLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchUserProfile = async (userId: string | null) => {
    if (!userId) return;
    setProfileLoading(true);
    try {
      const profile = await getUserProfile(userId);
      const hasMacros = !!(profile?.macros && Object.keys(profile.macros).length > 0);

      // Preload the avatar image if it exists
      if (profile?.avatar_url) {
        preloadAvatarImage(profile.avatar_url).catch((err) => console.error("Error preloading avatar:", err));
      }

      // Check stored onboarding status
      let storedOnboardingStatus = false;
      try {
        const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        storedOnboardingStatus = storedValue === "true";
      } catch (error) {
        console.error("Error reading onboarding status:", error);
      }

      // If the user has macros or the onboarding is already marked completed, set it as completed
      const onboardingCompleted = hasMacros || storedOnboardingStatus;

      setState((prev) => ({
        ...prev,
        userProfile: profile,
        onboardingCompleted,
      }));

      // Save the status to storage if user has macros but onboarding status isn't saved yet
      if (hasMacros && !storedOnboardingStatus) {
        try {
          await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
        } catch (error) {
          console.error("Error saving onboarding status:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const setOnboardingCompleted = async (completed: boolean) => {
    setState((prev) => ({ ...prev, onboardingCompleted: completed }));
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, completed ? "true" : "false");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load onboarding status from storage
        let storedOnboardingStatus = false;
        try {
          const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
          storedOnboardingStatus = storedValue === "true";
        } catch (error) {
          console.error("Error reading onboarding status:", error);
        }

        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          const { session } = data;
          setState({
            user: session.user,
            session,
            userProfile: null,
            initialized: true,
            onboardingCompleted: storedOnboardingStatus,
          });
          fetchUserProfile(session.user.id);
        } else {
          setState({
            ...initialAuthState,
            initialized: true,
            onboardingCompleted: storedOnboardingStatus,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setState({ ...initialAuthState, initialized: true });
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Load onboarding status from storage
      let storedOnboardingStatus = false;
      try {
        const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        storedOnboardingStatus = storedValue === "true";
      } catch (error) {
        console.error("Error reading onboarding status:", error);
      }

      setState((prev) => ({
        ...prev,
        user: session?.user || null,
        session: session || null,
        initialized: true,
        onboardingCompleted: session ? prev.onboardingCompleted : storedOnboardingStatus,
      }));

      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState((prev) => ({
          ...prev,
          userProfile: null,
          onboardingCompleted: storedOnboardingStatus,
        }));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!state.user) return;

    setProfileLoading(true);
    try {
      // Force a new profile fetch to get updated data
      const profile = await getUserProfile(state.user.id);
      const hasMacros = !!(profile?.macros && Object.keys(profile.macros).length > 0);

      // Preload the avatar image if it exists
      if (profile?.avatar_url) {
        preloadAvatarImage(profile.avatar_url).catch((err) => console.error("Error preloading avatar:", err));
      }

      setState((prev) => ({
        ...prev,
        userProfile: profile,
        onboardingCompleted: hasMacros || prev.onboardingCompleted,
      }));

      // Return a timestamp to ensure components are updated
      return Date.now();
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (!error && data.user) await createUserProfile(data.user.id, email);
      return { error: error || null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setAuthLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) await fetchUserProfile(data.user.id);
      return { error: error || null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setAuthLoading(false);
    }
  };

  // Inside AuthProvider component
  const handleAppleSignIn = async (): Promise<AuthResult> => {
    setAuthLoading(true);
    try {
      const { data, error } = await signInWithApple();
      if (error) {
        const err =
          error instanceof Error
            ? error
            : new Error(
                typeof error === "object" && error !== null && "message" in error
                  ? (error as any).message
                  : "Erro desconhecido"
              );
        return { error: err };
      }
      if (!data?.session) {
        return { error: new Error("Falha na autenticação. Tente novamente.") };
      }

      const { session } = data;
      const user = session.user;
      let profile = await getUserProfile(user.id);

      if (!profile) {
        await createUserProfile(user.id, user.email || "");

        // Set full name if provided by Apple
        const fullName =
          user.user_metadata?.name ||
          ((user.user_metadata?.first_name || "") + " " + (user.user_metadata?.last_name || "")).trim();

        if (fullName) await updateUserProfile(user.id, { full_name: fullName });
        profile = await getUserProfile(user.id);
      }

      // Same logic as in handleGoogleSignIn for onboarding status
      let storedOnboardingStatus = false;
      try {
        const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        storedOnboardingStatus = storedValue === "true";
      } catch (error) {
        console.error("Error reading onboarding status:", error);
      }

      const hasMacros = !!(profile?.macros && Object.keys(profile.macros).length > 0);
      const onboardingCompleted = hasMacros || storedOnboardingStatus;

      setState((prev) => ({
        ...prev,
        user,
        session,
        userProfile: profile,
        initialized: true,
        onboardingCompleted,
      }));

      // Save onboarding status if user has macros
      if (hasMacros && !storedOnboardingStatus) {
        try {
          await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
        } catch (error) {
          console.error("Error saving onboarding status:", error);
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error("Erro inesperado") };
    } finally {
      setAuthLoading(false);
      setProfileLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<AuthResult> => {
    setAuthLoading(true);
    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        const err =
          error instanceof Error
            ? error
            : new Error(
                typeof error === "object" && error !== null && "message" in error
                  ? (error as any).message
                  : "Erro desconhecido"
              );
        return { error: err };
      }
      if (!data?.session) {
        return { error: new Error("Falha na autenticação. Tente novamente.") };
      }

      const { session } = data;
      const user = session.user;
      let profile = await getUserProfile(user.id);

      if (!profile) {
        await createUserProfile(user.id, user.email || "");
        const fullName = user.user_metadata?.full_name || "";
        if (fullName) await updateUserProfile(user.id, { full_name: fullName });
        profile = await getUserProfile(user.id);
      }

      // Check stored onboarding status
      let storedOnboardingStatus = false;
      try {
        const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        storedOnboardingStatus = storedValue === "true";
      } catch (error) {
        console.error("Error reading onboarding status:", error);
      }

      const hasMacros = !!(profile?.macros && Object.keys(profile.macros).length > 0);
      const onboardingCompleted = hasMacros || storedOnboardingStatus;

      setState((prev) => ({
        ...prev,
        user,
        session,
        userProfile: profile,
        initialized: true,
        onboardingCompleted,
      }));

      // Save onboarding status if user has macros
      if (hasMacros && !storedOnboardingStatus) {
        try {
          await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
        } catch (error) {
          console.error("Error saving onboarding status:", error);
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error("Erro inesperado") };
    } finally {
      setAuthLoading(false);
      setProfileLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      await supabase.auth.signOut();
      setTimeout(() => {
        setAuthLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error signing out:", error);
      setAuthLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      ...state,
      signUp,
      signIn,
      signInWithGoogle: handleGoogleSignIn,
      signInWithApple: handleAppleSignIn,
      isAppleAuthAvailable,
      signOut,
      refreshProfile,
      setOnboardingCompleted,
      loading: authLoading || profileLoading,
      profileLoading,
    }),
    [state, authLoading, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default {
  AuthContext,
  AuthProvider,
  useAuth,
};

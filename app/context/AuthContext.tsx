// app/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { createUserProfile, getUserProfile, updateUserProfile, UserProfile } from "../models/user";
import { signInWithGoogle } from "../lib/googleAuth";

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
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
      setState((prev) => ({
        ...prev,
        userProfile: profile,
        onboardingCompleted: !!(profile?.macros && Object.keys(profile.macros).length > 0),
      }));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const setOnboardingCompleted = (completed: boolean) => {
    setState((prev) => ({ ...prev, onboardingCompleted: completed }));
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          const { session } = data;
          setState({
            user: session.user,
            session,
            userProfile: null,
            initialized: true,
            onboardingCompleted: false,
          });
          fetchUserProfile(session.user.id);
        } else {
          setState({ ...initialAuthState, initialized: true });
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
      setState((prev) => ({
        ...prev,
        user: session?.user || null,
        session: session || null,
        initialized: true,
      }));
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState((prev) => ({ ...prev, userProfile: null, onboardingCompleted: false }));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (state.user) await fetchUserProfile(state.user.id);
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

      setState((prev) => ({
        ...prev,
        user,
        session,
        userProfile: profile,
        initialized: true,
        onboardingCompleted: !!(profile?.macros && Object.keys(profile.macros).length > 0),
      }));

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

      // Immediately update the state to prevent navigation issues
      setState({
        user: null,
        session: null,
        userProfile: null,
        initialized: true,
        onboardingCompleted: false,
      });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      ...state,
      signUp,
      signIn,
      signInWithGoogle: handleGoogleSignIn,
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

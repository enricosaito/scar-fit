// app/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { createUserProfile, getUserProfile, UserProfile } from "../models/user";
import { signInWithGoogle } from "../lib/googleAuth";

interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  initialized: boolean;
  onboardingCompleted: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>; // New method
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State code remains the same...
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    userProfile: null,
    initialized: false,
    onboardingCompleted: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      setState((prev) => ({
        ...prev,
        userProfile: profile,
        onboardingCompleted: !!(profile?.macros && Object.keys(profile.macros).length > 0),
      }));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Set onboarding completed status
  const setOnboardingCompleted = (completed: boolean) => {
    setState((prev) => ({ ...prev, onboardingCompleted: completed }));
  };

  // Initialize: Check for existing session - same as before
  useEffect(() => {
    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setState({
            user: session.user,
            session,
            userProfile: null,
            initialized: true,
            onboardingCompleted: false,
          });

          fetchUserProfile(session.user.id);
        } else {
          setState({
            user: null,
            session: null,
            userProfile: null,
            initialized: true,
            onboardingCompleted: false,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setState({
          user: null,
          session: null,
          userProfile: null,
          initialized: true,
          onboardingCompleted: false,
        });
      }
    };

    initialize();
  }, []);

  // Listen for auth changes - same as before
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user || null,
        session,
        initialized: true,
      }));

      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState((prev) => ({
          ...prev,
          userProfile: null,
          onboardingCompleted: false,
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh user profile data - same as before
  const refreshProfile = async () => {
    if (state.user) {
      await fetchUserProfile(state.user.id);
    }
  };

  // Sign up with email and password - same as before
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (!error && data.user) {
        await createUserProfile(data.user.id, email);
      }

      setLoading(false);
      return { error };
    } catch (err) {
      setLoading(false);
      return { error: err };
    }
  };

  // Sign in with email and password - same as before
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user) {
        await fetchUserProfile(data.user.id);
      }

      setLoading(false);
      return { error };
    } catch (err) {
      setLoading(false);
      return { error: err };
    }
  };

  // NEW METHOD: Sign in with Google
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await signInWithGoogle();

      if (error) {
        console.error("Google sign-in error:", error);
        setLoading(false);
        return { error };
      }

      if (data?.session) {
        console.log("Session obtained:", data.session.user.id);

        try {
          // Make sure the profile exists
          let profile = await getUserProfile(data.session.user.id);

          if (!profile) {
            console.log("Creating new user profile");
            const email = data.session.user.email || "";
            await createUserProfile(data.session.user.id, email);
            profile = await getUserProfile(data.session.user.id);
          }

          // Update the state with user data
          setState((prev) => ({
            ...prev,
            user: data.session.user,
            session: data.session,
            userProfile: profile,
            initialized: true,
            onboardingCompleted: !!(profile?.macros && Object.keys(profile.macros).length > 0),
          }));

          console.log("Auth state updated successfully");
          setLoading(false);
          return { error: null };
        } catch (profileError) {
          console.error("Error setting up user profile:", profileError);
          setLoading(false);
          return { error: profileError };
        }
      }

      console.log("No session data found");
      setLoading(false);
      return { error: new Error("Falha na autenticação. Tente novamente.") };
    } catch (err) {
      console.error("Unexpected error in Google sign-in:", err);
      setLoading(false);
      return { error: err };
    }
  };

  // Sign out - same as before
  const signOut = async () => {
    setLoading(true);
    try {
      setState((prev) => ({
        ...prev,
        userProfile: null,
      }));

      await new Promise((resolve) => setTimeout(resolve, 50));
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    ...state,
    signUp,
    signIn,
    signInWithGoogle: handleGoogleSignIn, // Add the new method
    signOut,
    refreshProfile,
    setOnboardingCompleted,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use Auth context
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

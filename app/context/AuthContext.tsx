// app/context/AuthContext.tsx (updated)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createUserProfile, getUserProfile, UserProfile } from '../models/user';

interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  initialized: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    userProfile: null,
    initialized: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      setState(prev => ({ ...prev, userProfile: profile }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Initialize: Check for existing session
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get session from storage if available
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setState({
            user: session.user,
            session,
            userProfile: null, // Will be fetched separately
            initialized: true,
          });
          
          // Fetch user profile for the authenticated user
          fetchUserProfile(session.user.id);
        } else {
          setState({
            user: null,
            session: null,
            userProfile: null,
            initialized: true,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          session: null,
          userProfile: null,
          initialized: true,
        });
      }
    };

    initialize();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user || null,
          session,
          initialized: true,
        }));
        
        // Fetch user profile when auth state changes
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setState(prev => ({ ...prev, userProfile: null }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh user profile data
  const refreshProfile = async () => {
    if (state.user) {
      await fetchUserProfile(state.user.id);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (!error && data.user) {
        // Create user profile in Supabase
        await createUserProfile(data.user.id, email);
      }
      
      setLoading(false);
      return { error };
    } catch (err) {
      setLoading(false);
      return { error: err };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { error };
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const value = {
    ...state,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use Auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default {
  AuthContext,
  AuthProvider,
  useAuth,
};
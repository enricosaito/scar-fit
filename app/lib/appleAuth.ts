// app/lib/appleAuth.ts
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

// Ensure browser closes after authentication
WebBrowser.maybeCompleteAuthSession();

// Check if Apple authentication is available on the device
export const isAppleAuthAvailable = async (): Promise<boolean> => {
  return await AppleAuthentication.isAvailableAsync();
};

export const signInWithApple = async () => {
  try {
    // Generate a random state string for CSRF protection
    const rawNonce = Crypto.randomUUID();
    const state = Crypto.randomUUID();

    // Get credentials using Expo's Apple Authentication
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      state,
      nonce: rawNonce,
    });

    // If there's no identity token, throw an error
    if (!credential.identityToken) {
      throw new Error('No identity token provided');
    }

    // Call Supabase auth to sign in with Apple
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });

    if (error) {
      console.error('Error signing in with Apple:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Apple sign in error:', error);
    // If the user canceled the sign-in, don't throw an error
    if (error.code === 'ERR_CANCELED') {
      return { data: null, error: { message: 'Autenticação com Apple cancelada' } };
    }
    return {
      data: null,
      error,
    };
  }
};

// Export the authentication service as an object
export const appleAuthService = {
  isAppleAuthAvailable,
  signInWithApple,
};

// Export the component as default for Expo Router
export default function AppleAuthComponent() {
  return null;
}
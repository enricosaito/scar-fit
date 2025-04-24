import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Ensure browser closes after authentication
WebBrowser.maybeCompleteAuthSession();

// Check if Apple authentication is available on the device
export const isAppleAuthAvailable = async (): Promise<boolean> => {
  return await AppleAuthentication.isAvailableAsync();
};

export const signInWithApple = async () => {
  try {
    // Generate a random nonce for CSRF protection
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

    if (!credential.identityToken) {
      throw new Error('No identity token provided');
    }

    const tokenParts = credential.identityToken.split('.');
    const payload = JSON.parse(atob(tokenParts[1])); // Replaces Buffer

    console.log('Apple token audience:', payload.aud);

    // Skip dev logic for now (you're not using Apple sign-in in dev anyway)

    // Production flow
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
  } catch (err) {
    const error = err as Error & { code?: string }; // 👈 Fix TS error type

    console.error('Apple sign in error:', error);

    if (error.code === 'ERR_CANCELED') {
      return {
        data: null,
        error: { message: 'Autenticação com Apple cancelada' },
      };
    }

    return {
      data: null,
      error: { message: error.message || 'Erro desconhecido ao autenticar com Apple' },
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

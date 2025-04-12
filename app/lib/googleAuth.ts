// app/lib/googleAuth.ts
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { supabase } from "./supabase";

// Clear any existing sessions
WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    console.log("Using redirect URI:", redirectUri);

    // Start the OAuth flow with Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      console.error("OAuth initialization error:", error);
      throw error;
    }

    console.log("Auth URL:", data?.url);

    if (!data?.url) {
      throw new Error("No authorization URL returned from Supabase");
    }

    // Open the authentication session
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

    console.log("Auth result:", result);

    if (result.type === "success" && result.url) {
      // Check if the URL contains an access_token in the fragment
      if (result.url.includes("#access_token=")) {
        console.log("Found access token in URL fragment");

        // Extract token information from the URL fragment
        const fragmentParams = new URLSearchParams(result.url.split("#")[1]);
        const accessToken = fragmentParams.get("access_token");
        const refreshToken = fragmentParams.get("refresh_token");

        if (accessToken && refreshToken) {
          console.log("Setting session with tokens from URL");
          // Set the session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Error setting session:", error);
            throw error;
          }

          console.log("Session set successfully");
          return { data, error: null };
        }
      }

      // If we have a code parameter, exchange it for a session
      const params = new URLSearchParams(result.url.split("?")[1]);
      const code = params.get("code");

      if (code) {
        console.log("Found authorization code, exchanging for session");
        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Error exchanging code:", error);
          throw error;
        }

        console.log("Successfully exchanged code for session");
        return { data, error: null };
      }
    }

    // Final check for existing session
    console.log("Checking for existing session");
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      console.log("Session found after auth flow");
      return { data: sessionData, error: null };
    }

    return { data: null, error: new Error("Google sign in was cancelled or failed") };
  } catch (error) {
    console.error("Google sign in error:", error);
    return {
      data: null,
      error,
    };
  }
};

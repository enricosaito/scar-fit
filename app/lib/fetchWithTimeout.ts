// app/lib/fetchWithTimeout.ts - New file

import { Platform } from "react-native";

// Detect if we're running on a simulator
const isSimulator =
  Platform.OS === "ios" && (Platform.constants.model?.includes("Simulator") || !Platform.constants.uiMode);

/**
 * Custom fetch implementation with timeout handling
 * specifically designed to address the "Network request failed" timeout issue
 * in iOS simulators
 */
export const fetchWithTimeout = (url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> => {
  console.log(`[Fetch] Request to: ${typeof url === "string" ? url : url.toString()}`);

  // Default timeout is longer for simulators
  const timeout = isSimulator ? 60000 : 30000;

  return new Promise((resolve, reject) => {
    // Create timeout error
    const timeoutId = setTimeout(() => {
      console.warn(`[Fetch] Request timed out after ${timeout}ms`);
      reject(new Error(`Request timed out after ${timeout}ms`));
    }, timeout);

    fetch(url, {
      ...options,
      // Disable timeout in the native fetch to prevent the error you're seeing
      __disableNativeFetch: isSimulator,
    })
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error(`[Fetch] Error: ${error.message}`);
        reject(error);
      });
  });
};

export default fetchWithTimeout;

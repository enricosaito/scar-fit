// app/lib/networkBypass.ts
import { Platform } from "react-native";
import ENV from "./env";

// Detect if we're in a simulator
const isSimulator = (): boolean => {
  if (Platform.OS === "ios") {
    // Use safer type checking
    return (
      !Platform.isPad &&
      !Platform.isTV &&
      // @ts-ignore - uiMode may not be in type definitions but exists at runtime
      typeof Platform.constants?.uiMode === "undefined"
    );
  }
  return false;
};

// Development mode bypass for simulators
export const shouldBypassNetworkChecks = (): boolean => {
  return __DEV__ && isSimulator();
};

// Mock successful responses for development
export const mockSuccessfulResponse = (): Response => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export default {
  isSimulator,
  shouldBypassNetworkChecks,
  mockSuccessfulResponse,
};

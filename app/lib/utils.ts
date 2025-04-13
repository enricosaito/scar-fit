// app/lib/utils.ts
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

// Check if the code is running on the server
export const isServer = () => typeof window === "undefined";

// Check if the code is running in the browser
export const isBrowser = () => !isServer();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add a default export
export default { cn };

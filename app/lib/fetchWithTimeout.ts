// app/lib/fetchWithTimeout.ts
import { Platform } from "react-native";

export const fetchWithTimeout = (url: string | URL, options: RequestInit = {}, timeout = 30000): Promise<Response> => {
  return new Promise((resolve, reject) => {
    // Set timeout timer
    const timer = setTimeout(() => {
      console.log(`Request timed out after ${timeout}ms`);
      reject(new Error(`Request timed out after ${timeout}ms`));
    }, timeout);

    // Use standard fetch without custom properties
    fetch(url, options)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

export default fetchWithTimeout;

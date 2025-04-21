// app/lib/transcriptionService.ts (fixed for FormData)
import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";

interface TranscriptionResult {
  text: string;
  success: boolean;
  error?: string;
}

export const transcribeAudio = async (audioUri: string): Promise<TranscriptionResult> => {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error("Audio file does not exist");
    }

    console.log("Audio file info:", fileInfo);

    // Instead of using FormData, let's use base64 encoding
    // Read the audio file as base64
    const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("Audio encoded as base64, length:", base64Audio.length);

    // Get session for authentication
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    
    if (!token) {
      throw new Error("No authentication token available");
    }
    
    console.log("Sending request to transcribe-audio function...");
    
    // Extract the URL from the Supabase client
    const baseUrl = "https://ssrklevifozwowhpumvu.supabase.co";
    const functionUrl = `${baseUrl}/functions/v1/transcribe-audio`;
    
    // Send the base64-encoded audio data instead of FormData
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audioBase64: base64Audio,
        fileName: "recording.m4a",
        fileType: "audio/m4a"
      }),
    });
    
    if (!response.ok) {
      console.error(`Fetch error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Function returned status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Transcription result:", data);
    
    return {
      text: data.text || "",
      success: true,
    };
  } catch (error) {
    console.error("Transcription error:", error);
    return {
      text: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown transcription error",
    };
  }
};

export default {
  transcribeAudio,
};
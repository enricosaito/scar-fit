// app/lib/transcriptionService.ts
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";

// Get the OpenAI API key from environment variables
const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey || "";
const OPENAI_API_URL = "https://api.openai.com/v1/audio/transcriptions";

interface TranscriptionResult {
  text: string;
  success: boolean;
  error?: string;
}

export const transcribeAudio = async (audioUri: string): Promise<TranscriptionResult> => {
  try {
    // Check if we have the API key
    if (!OPENAI_API_KEY) {
      throw new Error("API key not configured");
    }

    // Prepare the file for upload
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error("Audio file does not exist");
    }

    // Create form data with the audio file
    const formData = new FormData();
    formData.append("file", {
      uri: audioUri,
      name: "recording.m4a",
      type: "audio/m4a",
    } as any);
    formData.append("model", "whisper-1");
    formData.append("language", "pt"); // Portuguese language

    // Make the API request
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to transcribe audio");
    }

    return {
      text: data.text,
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

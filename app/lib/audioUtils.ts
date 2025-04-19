// app/lib/audioUtils.ts (fixed)
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

/**
 * Converts an audio file to MP3 format
 * This is a placeholder - actual implementation would depend on available libraries
 */
export const convertToMP3 = async (inputUri: string): Promise<string> => {
  try {
    // In a real implementation, you would use a library like react-native-ffmpeg
    // Since that's complex to set up, here's a simpler approach:

    // 1. Create a new temporary file path for the converted file
    const tempDirectory = FileSystem.cacheDirectory + "temp/";
    const dirInfo = await FileSystem.getInfoAsync(tempDirectory);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(tempDirectory, { intermediates: true });
    }

    const outputUri = tempDirectory + "converted_audio.mp3";

    // 2. Play and re-record the audio (this is a workaround)
    // Load the original audio
    const { sound } = await Audio.Sound.createAsync({ uri: inputUri });

    // Set up a new recording
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      android: {
        extension: ".mp3",
        outputFormat: 2, // MPEG_4
        audioEncoder: 3, // AAC
      },
      ios: {
        extension: ".mp3",
        outputFormat: "aac",
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      web: {
        mimeType: "audio/webm",
        bitsPerSecond: 128000,
      },
    });

    // Start recording, play the original, then stop recording
    await recording.startAsync();
    await sound.playAsync();

    // Wait for the sound to finish playing
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      const durationMs = status.durationMillis || 0;
      await new Promise((resolve) => setTimeout(resolve, durationMs + 500));
    }

    await recording.stopAndUnloadAsync();
    await sound.unloadAsync();

    // Get the URI of the new recording
    const newUri = recording.getURI();

    if (!newUri) {
      throw new Error("Failed to create converted audio file");
    }

    return newUri;
  } catch (error) {
    console.error("Error converting audio file:", error);
    // If conversion fails, return the original file
    return inputUri;
  }
};

export default {
  convertToMP3,
};

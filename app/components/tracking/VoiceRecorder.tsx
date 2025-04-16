// app/components/tracking/VoiceRecorder.tsx (updated)
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useTheme } from "../../context/ThemeContext";
import Button from "../ui/Button";

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string) => void;
  onCancel: () => void;
}

const VoiceRecorder = ({ onRecordingComplete, onCancel }: VoiceRecorderProps) => {
  const { colors } = useTheme();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);

  // Request permissions and set up Audio
  useEffect(() => {
    const getPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setPermissionStatus(status === "granted");
      } catch (error) {
        console.error("Error getting audio permissions:", error);
        setPermissionStatus(false);
      }
    };

    getPermissions();

    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      console.log("Starting recording...");

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });

      const newRecording = new Audio.Recording();

      // Prepare recording with high quality settings
      await newRecording.prepareToRecordAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      });

      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert(
        "Erro",
        `Não foi possível iniciar a gravação: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);

    try {
      console.log("Stopping recording...");
      await recording.stopAndUnloadAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
      });

      const uri = recording.getURI();

      if (uri) {
        console.log("Recording completed. URI:", uri);
        onRecordingComplete(uri);
      } else {
        throw new Error("URI não disponível após gravação");
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
      Alert.alert("Erro", "Não foi possível finalizar a gravação. Por favor, tente novamente.");
    }

    setRecording(null);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (permissionStatus === null) {
    return (
      <View className="items-center justify-center py-8">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-foreground mt-2">Solicitando permissões...</Text>
      </View>
    );
  }

  if (permissionStatus === false) {
    return (
      <View className="items-center justify-center py-8">
        <Feather name="mic-off" size={48} color={colors.mutedForeground} />
        <Text className="text-foreground mt-2 text-center">
          Permissão para usar o microfone negada. Por favor, habilite nas configurações do seu dispositivo.
        </Text>
        <Button className="mt-4" onPress={onCancel}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-6">
      {isRecording ? (
        <>
          <View className="w-20 h-20 rounded-full bg-red-500 items-center justify-center mb-4">
            <View className="w-12 h-12 rounded-full bg-red-700"></View>
          </View>
          <Text className="text-xl font-semibold text-foreground mb-2">{formatTime(recordingDuration)}</Text>
          <Text className="text-muted-foreground mb-6">Gravando...</Text>
          <Button onPress={stopRecording} className="px-6">
            Parar
          </Button>
        </>
      ) : (
        <>
          <Pressable
            onPress={startRecording}
            className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4"
          >
            <Feather name="mic" size={36} color={colors.primary} />
          </Pressable>
          <Text className="text-lg font-medium text-foreground mb-2">Toque para começar a gravar</Text>
          <Text className="text-muted-foreground mb-6 text-center px-4">
            Descreva o que você comeu. Por exemplo: "Um prato de arroz com frango grelhado no almoço"
          </Text>
          <Button variant="outline" onPress={onCancel} className="px-6">
            Cancelar
          </Button>
        </>
      )}
    </View>
  );
};

export default VoiceRecorder;

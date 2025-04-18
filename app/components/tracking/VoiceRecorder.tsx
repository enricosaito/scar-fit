// app/components/tracking/VoiceRecorder.tsx (improved with bottom button)
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, Dimensions, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";
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

  // Get screen dimensions
  const screenHeight = Dimensions.get("window").height;

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
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });

      const newRecording = new Audio.Recording();

      // Prepare recording with high quality settings
      await newRecording.prepareToRecordAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4, // Updated
          audioEncoder: Audio.AndroidAudioEncoder.AAC, // Updated
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC, // Updated
          audioQuality: Audio.IOSAudioQuality.HIGH, // Updated
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
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
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
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-foreground mt-2">Solicitando permissões...</Text>
      </View>
    );
  }

  if (permissionStatus === false) {
    return (
      <View className="flex-1 items-center justify-center py-8">
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
    <View className="flex-1">
      {/* Main content area */}
      <View className="flex-1 items-center justify-center mt-8">
        {isRecording ? (
          <>
            {/* Recording time display */}
            <View className="items-center">
              <Text className="text-4xl font-semibold text-foreground mb-6">{formatTime(recordingDuration)}</Text>
              <View className="bg-red-500/10 px-4 py-2 rounded-full mb-8">
                <Text className="text-red-500 font-medium">Gravando...</Text>
              </View>
              <Text className="text-muted-foreground mb-6 px-10 text-center max-w-md">
                Fale claramente e descreva os alimentos que consumiu. Quando terminar, toque no botão abaixo para
                encerrar a gravação.
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Instructions */}
            <View className="items-center px-4 mb-8">
              <Text className="text-2xl font-semibold text-foreground mb-6">Detectar por Áudio</Text>
              <View className="bg-primary/10 px-4 py-2 rounded-full mb-8">
                <Text className="text-primary font-medium">Toque no botão para começar</Text>
              </View>
              <Text className="text-muted-foreground mb-2 text-center max-w-md">
                Descreva o que você comeu. Por exemplo:
              </Text>
              <View className="bg-card p-4 rounded-xl border border-border mb-6 w-full max-w-sm">
                <Text className="text-foreground text-center">
                  "No almoço comi um prato com 100 gramas de arroz, 150 gramas de frango grelhado e uma salada de folhas
                  verdes."
                </Text>
              </View>
              <Text className="text-muted-foreground text-center max-w-md">
                Inclua o tipo de refeição e, se souber, as quantidades aproximadas.
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Bottom action area - fixed at the bottom */}
      <View className="w-full items-center pb-10 px-6" style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        {isRecording ? (
          <View className="w-full">
            <Button onPress={stopRecording} variant="default" className="w-full py-4">
              <View className="flex-row items-center">
                <Feather name="stop-circle" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Finalizar Gravação</Text>
              </View>
            </Button>
          </View>
        ) : (
          <View className="w-full">
            <Pressable
              onPress={startRecording}
              className="w-full bg-primary items-center justify-center rounded-full py-4"
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-2">
                  <Feather name="mic" size={20} color="white" />
                </View>
                <Text className="text-white font-medium">Iniciar Gravação</Text>
              </View>
            </Pressable>

            <Pressable onPress={onCancel} className="mt-4 items-center">
              <Text className="text-primary font-medium">Cancelar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

export default VoiceRecorder;

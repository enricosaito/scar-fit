// app/components/tracking/VoiceRecorder.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
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
      if (recording) stopRecording();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
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
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        onRecordingComplete(uri);
      } else {
        throw new Error("URI não disponível após gravação");
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
      Alert.alert("Erro", "Não foi possível finalizar a gravação. Por favor, tente novamente.");
    } finally {
      setRecording(null);
    }
  };

  const handleCancel = async () => {
    if (isRecording) {
      try {
        await recording?.stopAndUnloadAsync();
      } catch (e) {
        console.warn("Erro ao cancelar gravação:", e);
      }
      setRecording(null);
      setIsRecording(false);
    }
    onCancel();
  };

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
        <Button className="mt-4" onPress={handleCancel}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-between">
      {/* Top Instructions */}
      <View className="items-center justify-center px-6 pt-6">
        <Text className="text-xl font-bold text-foreground mb-4">Detectar por Áudio</Text>
        {isRecording ? (
          <>
            <Text className="text-3xl font-semibold text-foreground mb-2">{formatTime(recordingDuration)}</Text>
            <Text className="text-red-500 font-medium mb-6">Gravando...</Text>
          </>
        ) : (
          <>
            <Text className="text-base text-foreground mb-4">Descreva o que você comeu. Por exemplo:</Text>
            <View className="bg-card p-4 rounded-xl border border-border mb-6 w-full">
              <Text className="text-foreground text-center">
                "No almoço comi um prato com arroz, feijão e frango grelhado com salada."
              </Text>
            </View>
            <Text className="text-muted-foreground text-center mb-2">
              Mencione o tipo de refeição e os alimentos consumidos.
            </Text>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View className="items-center justify-center pb-10">
        {isRecording ? (
          <>
            <Pressable
              onPress={stopRecording}
              className="w-24 h-24 rounded-full bg-red-500/20 items-center justify-center shadow-md"
              style={{
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 3,
              }}
            >
              <Feather name="stop-circle" size={40} color="#EF4444" />
            </Pressable>
            <Button variant="outline" onPress={handleCancel} className="mt-8">
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Text className="text-primary font-medium mb-4">Toque para começar a gravar</Text>
            <Pressable
              onPress={startRecording}
              className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center shadow-md"
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 3,
              }}
            >
              <Feather name="mic" size={40} color={colors.primary} />
            </Pressable>
            <Button variant="outline" onPress={handleCancel} className="mt-8">
              Cancelar
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

export default VoiceRecorder;

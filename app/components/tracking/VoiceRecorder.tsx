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

        if (status === "granted") {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
        }
      } catch (error) {
        console.error("Error getting audio permissions:", error);
        setPermissionStatus(false);
        Alert.alert("Erro", "Não foi possível acessar o microfone. Verifique as permissões do aplicativo.");
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
      // Important: Configure Audio recording settings
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();

      // Use specific settings that match Whisper API requirements
      await recording.prepareToRecordAsync({
        isMeteringEnabled: true,
        android: {
          extension: ".mp3",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".mp3",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MEDIUM,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/mp3",
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Erro", "Não foi possível iniciar a gravação. Por favor, tente novamente.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        console.log("Recording URI:", uri);
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

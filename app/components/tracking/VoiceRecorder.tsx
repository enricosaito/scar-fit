// app/components/tracking/VoiceRecorder.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, Animated, Easing } from "react-native";
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
  const [isHolding, setIsHolding] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonSizeAnim = useRef(new Animated.Value(1)).current;

  // Configure audio recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      // Reset animation
      pulseAnim.setValue(1);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Permission and setup
  const checkPermission = async (): Promise<boolean> => {
    // Check permissions first
    const { status: existingStatus } = await Audio.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Audio.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Permissão Negada", "É necessário permitir o acesso ao microfone para usar esta funcionalidade.", [
        { text: "OK" },
      ]);
      return false;
    }

    return true;
  };

  const prepareRecording = async () => {
    const hasPermission = await checkPermission();
    if (!hasPermission) return null;

    // Configure audio
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });

    // Create and prepare recording
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

    return newRecording;
  };

  const startRecording = async () => {
    try {
      // Animate button grow
      Animated.timing(buttonSizeAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const newRecording = await prepareRecording();
      if (!newRecording) return;

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

    // Animate button shrink
    Animated.timing(buttonSizeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

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

  // For touch support
  const handlePressIn = () => {
    setIsHolding(true);
    if (!isRecording) {
      startRecording();
    }
  };

  const handlePressOut = () => {
    setIsHolding(false);
    if (isRecording) {
      stopRecording();
    }
  };

  const handleTap = () => {
    // Toggle recording on tap (for users who prefer tap instead of hold)
    if (isHolding) return; // Ignore if this was part of a hold action

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View className="flex-1 justify-between">
      <View className="items-center px-6 pt-6">
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

      {/* Centered record button with improved layout */}
      <View className="items-center justify-center flex-1">
        {isRecording ? (
          <View className="items-center">
            <Text className="text-red-500 font-medium mb-6">
              {isHolding ? "Solte para parar de gravar" : "Toque para parar de gravar"}
            </Text>

            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }, { scale: buttonSizeAnim }],
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Pressable
                onPress={handleTap}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="w-32 h-32 rounded-full bg-red-500/20 items-center justify-center"
              >
                <View className="w-24 h-24 rounded-full bg-red-500 items-center justify-center">
                  <Feather name="mic" size={48} color="white" />
                </View>
              </Pressable>
            </Animated.View>
          </View>
        ) : (
          <View className="items-center">
            <Text className="text-primary font-medium mb-6">Toque ou segure para começar a gravar</Text>

            <Animated.View
              style={{
                transform: [{ scale: buttonSizeAnim }],
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Pressable
                onPress={handleTap}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="w-32 h-32 rounded-full bg-primary/20 items-center justify-center"
              >
                <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
                  <Feather name="mic" size={48} color="white" />
                </View>
              </Pressable>
            </Animated.View>
          </View>
        )}
      </View>

      {/* Cancel button at bottom */}
      <View className="items-center justify-center pb-12">
        <Button variant="outline" onPress={handleCancel} className="px-8">
          Cancelar
        </Button>
      </View>
    </View>
  );
};

export default VoiceRecorder;

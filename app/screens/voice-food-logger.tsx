// app/screens/voice-food-logger.tsx (updated)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
  StatusBar,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import VoiceRecorder from "../components/tracking/VoiceRecorder";
import Button from "../components/ui/Button";
import { transcribeAudio, extractFoodItems, matchWithDatabaseFoods } from "../lib/voiceProcessingService";
import { addFoodToLog } from "../models/tracking";

export default function VoiceFoodLogger() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<"recording" | "processing" | "reviewing" | "saving">("recording");
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [extractedItems, setExtractedItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRecordingComplete = (uri: string) => {
    setAudioUri(uri);
    setStep("processing");
    processAudio(uri);
  };

  const processAudio = async (uri: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Transcribe audio using OpenAI Whisper API
      const transcriptionResult = await transcribeAudio(uri);

      if (!transcriptionResult.success) {
        throw new Error(transcriptionResult.error || "Falha na transcrição de áudio");
      }

      setTranscription(transcriptionResult.text);

      // 2. Extract food information from transcription using OpenAI GPT
      const foodItems = await extractFoodItems(transcriptionResult.text);

      if (foodItems.length === 0) {
        throw new Error("Não foi possível identificar alimentos na transcrição");
      }

      // 3. Match with database foods
      const matchedItems = await matchWithDatabaseFoods(foodItems);

      if (matchedItems.length === 0) {
        throw new Error("Não foi possível encontrar os alimentos em nosso banco de dados");
      }

      setExtractedItems(matchedItems);
      setStep("reviewing");
    } catch (error) {
      console.error("Error processing audio:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido ao processar áudio");
      setStep("recording");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveItems = async () => {
    if (!user) return;

    setStep("saving");
    setIsProcessing(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      // Add each item to the log
      for (const item of extractedItems) {
        if (item.food) {
          await addFoodToLog(user.id, today, {
            food: item.food,
            quantity: item.quantity,
            meal_type: item.mealType,
            date: today,
          });
        }
      }

      Alert.alert("Sucesso!", "Alimentos adicionados com sucesso ao seu diário.", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error) {
      console.error("Error saving items:", error);
      Alert.alert("Erro", "Ocorreu um erro ao salvar os alimentos. Por favor, tente novamente.", [{ text: "OK" }]);
      setStep("reviewing");
      setIsProcessing(false);
    }
  };

  const resetAndGoBack = () => {
    router.back();
  };

  const restartRecording = () => {
    setStep("recording");
    setAudioUri(null);
    setTranscription("");
    setExtractedItems([]);
    setError(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row items-center py-3 px-4 border-b border-border">
        <Pressable onPress={resetAndGoBack} className="p-2">
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">
          {step === "recording" && "Adicionar por Voz"}
          {step === "processing" && "Processando Áudio"}
          {step === "reviewing" && "Revisar Alimentos"}
          {step === "saving" && "Salvando"}
        </Text>
      </View>

      <Animated.View className="flex-1 px-4" style={{ opacity: fadeAnim }}>
        {step === "recording" && (
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} onCancel={resetAndGoBack} />
        )}

        {step === "processing" && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-foreground mt-4 text-center">Processando o áudio...</Text>
          </View>
        )}

        {error && (
          <View className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <Text className="text-red-500">{error}</Text>
          </View>
        )}

        {step === "reviewing" && (
          <ScrollView className="flex-1 py-4">
            <View className="bg-card rounded-lg border border-border p-4 mb-4">
              <Text className="text-foreground font-medium mb-2">Transcrição:</Text>
              <Text className="text-muted-foreground">{transcription}</Text>
            </View>

            <Text className="text-lg font-bold text-foreground mb-4">Alimentos Identificados:</Text>

            {extractedItems.length > 0 ? (
              extractedItems.map((item, index) => (
                <View key={index} className="bg-card rounded-lg border border-border p-4 mb-3">
                  <Text className="text-foreground font-medium">
                    {item.food?.description || "Alimento não encontrado"}
                  </Text>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-muted-foreground">Quantidade: {item.quantity}g</Text>
                    <Text className="text-muted-foreground">
                      Refeição:{" "}
                      {item.mealType === "breakfast"
                        ? "Café da Manhã"
                        : item.mealType === "lunch"
                        ? "Almoço"
                        : item.mealType === "dinner"
                        ? "Jantar"
                        : "Lanche"}
                    </Text>
                  </View>
                  {item.food && (
                    <View className="mt-2 pt-2 border-t border-border">
                      <Text className="text-muted-foreground">
                        {Math.round((item.food.kcal * item.quantity) / 100)} kcal | P:{" "}
                        {Math.round((item.food.protein_g * item.quantity) / 100)}g | C:{" "}
                        {Math.round((item.food.carbs_g * item.quantity) / 100)}g | G:{" "}
                        {Math.round((item.food.fat_g * item.quantity) / 100)}g
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View className="bg-card rounded-lg border border-border p-4 items-center">
                <Feather name="alert-circle" size={24} color={colors.mutedForeground} />
                <Text className="text-muted-foreground mt-2">Nenhum alimento identificado</Text>
              </View>
            )}

            <View className="flex-row justify-end mt-4 mb-8">
              <Button variant="outline" className="mr-2" onPress={restartRecording}>
                Regravar
              </Button>
              <Button onPress={handleSaveItems} disabled={extractedItems.length === 0}>
                Adicionar Alimentos
              </Button>
            </View>
          </ScrollView>
        )}

        {step === "saving" && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-foreground mt-4">Salvando alimentos...</Text>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

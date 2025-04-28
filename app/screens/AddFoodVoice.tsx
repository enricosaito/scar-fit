// app/screens/add-food-voice.tsx
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
import { useToast } from "../context/ToastContext";
import VoiceRecorder from "../components/tracking/VoiceRecorder";
import Button from "../components/ui/Button";
import { transcribeAudio, extractFoodItems, matchWithDatabaseFoods } from "../lib/voiceProcessingService";
import { addFoodToLog } from "../models/tracking";

// MacroTag Component
const MacroTag = ({
  value,
  color,
  label,
  textColor = "white",
}: {
  value: string | number;
  color: string;
  label: string;
  textColor?: string;
}) => {
  return (
    <View
      className="rounded-md px-2 py-0.5 mr-2 flex-row items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <Text className="text-xs font-medium" style={{ color: textColor }}>
        {value}g {label}
      </Text>
    </View>
  );
};

// Calorie Tag Component
const CalorieTag = ({ calories }: { calories: number }) => {
  return (
    <View
      className="rounded-md px-2 py-0.5 mr-2 flex-row items-center justify-center"
      style={{ backgroundColor: "#3b82f680" }}
    >
      <Text className="text-xs font-medium text-white">{calories} kcal</Text>
    </View>
  );
};

export default function VoiceFoodLogger() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<"recording" | "processing" | "reviewing" | "saving">("recording");
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [extractedItems, setExtractedItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Macro tag colors - softer, more modern palette
  const macroColors = {
    protein: "#9333ea80", // Softer purple with transparency
    carbs: "#ca8a0480", // Softer amber with transparency
    fat: "#dc262680", // Softer red with transparency
  };

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

      // Show toast notification instead of alert
      const itemCount = extractedItems.filter((item) => item.food).length;
      showToast(
        `${itemCount} ${itemCount === 1 ? "alimento adicionado" : "alimentos adicionados"} ao diário`,
        "success"
      );

      // Navigate back to tabs
      router.replace("/(tabs)");
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

      <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
        {step === "recording" && (
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} onCancel={resetAndGoBack} />
        )}

        {step === "processing" && (
          <View className="flex-1 justify-center items-center px-6">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-foreground mt-6 text-center text-lg font-medium">Processando seu áudio...</Text>
            <Text className="text-muted-foreground mt-2 text-center">
              Estamos identificando os alimentos que você mencionou
            </Text>
          </View>
        )}

        {error && (
          <View className="m-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <Text className="text-red-500">{error}</Text>
          </View>
        )}

        {step === "reviewing" && (
          <ScrollView className="flex-1 py-4 px-4">
            <View className="bg-card rounded-lg border border-border p-4 mb-4">
              <Text className="text-foreground font-medium mb-2">Transcrição:</Text>
              <Text className="text-muted-foreground">{transcription}</Text>
            </View>

            <Text className="text-lg font-bold text-foreground mb-4">Alimentos Identificados:</Text>

            {extractedItems.length > 0 ? (
              extractedItems.map((item, index) => (
                <View key={index} className="bg-card rounded-xl border border-border p-4 mb-3">
                  <Text className="text-foreground font-medium mb-1">
                    {item.food?.description || "Alimento não encontrado"}
                  </Text>
                  <Text className="text-muted-foreground text-xs mb-2">{item.food?.category}</Text>

                  <View className="flex-row justify-between mt-2 mb-2">
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
                      <View className="flex-row flex-wrap mt-1.5">
                        <CalorieTag calories={Math.round((item.food.kcal * item.quantity) / 100)} />
                        <MacroTag
                          value={Math.round((item.food.protein_g * item.quantity) / 100)}
                          color={macroColors.protein}
                          label="prot."
                        />
                        <MacroTag
                          value={Math.round((item.food.carbs_g * item.quantity) / 100)}
                          color={macroColors.carbs}
                          label="carb."
                        />
                        <MacroTag
                          value={Math.round((item.food.fat_g * item.quantity) / 100)}
                          color={macroColors.fat}
                          label="gord."
                        />
                      </View>
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

            <View className="flex-row justify-between mt-6 mb-8">
              <Button variant="outline" className="flex-1 mr-2" onPress={restartRecording}>
                Regravar
              </Button>
              <Button className="flex-1 ml-2" onPress={handleSaveItems} disabled={extractedItems.length === 0}>
                Adicionar Alimentos
              </Button>
            </View>
          </ScrollView>
        )}

        {step === "saving" && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-foreground mt-4 text-lg">Salvando alimentos...</Text>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

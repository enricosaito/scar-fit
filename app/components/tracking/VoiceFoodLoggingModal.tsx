// app/components/tracking/VoiceFoodLoggingModal.tsx (updated with better debugging)
import React, { useState } from "react";
import { View, Text, Modal, SafeAreaView, Pressable, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import VoiceRecorder from "./VoiceRecorder";
import Button from "../ui/Button";
import { transcribeAudio, extractFoodItems, matchWithDatabaseFoods } from "../../lib/voiceProcessingService";
import { addFoodToLog } from "../../models/tracking";
import { getFoodById } from "../../models/food";

interface VoiceFoodLoggingModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const VoiceFoodLoggingModal = ({ isVisible, onClose }: VoiceFoodLoggingModalProps) => {
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
  const [debug, setDebug] = useState<string | null>(null);

  const handleRecordingComplete = (uri: string) => {
    setAudioUri(uri);
    setStep("processing");
    processAudio(uri);
  };

  const processAudio = async (uri: string) => {
    setIsProcessing(true);
    setError(null);
    setDebug(null);

    try {
      // 1. Transcribe audio
      console.log("Starting transcription...");
      const transcriptionResult = await transcribeAudio(uri);
      console.log("Transcription complete, success:", transcriptionResult.success);

      if (!transcriptionResult.success) {
        throw new Error(transcriptionResult.error || "Falha na transcrição de áudio");
      }

      setTranscription(transcriptionResult.text);
      setDebug(`Transcrição bem-sucedida: "${transcriptionResult.text}"`);

      // 2. Extract food information from transcription
      console.log("Extracting food information...");
      const foodItems = await extractFoodItems(transcriptionResult.text);
      console.log("Extracted food items:", foodItems);

      if (!foodItems || foodItems.length === 0) {
        throw new Error(
          "Não foi possível identificar alimentos na transcrição. Por favor, tente novamente com mais detalhes."
        );
      }

      setDebug((prev) => `${prev}\nAlimentos extraídos: ${JSON.stringify(foodItems)}`);

      // 3. Match with database foods
      console.log("Matching with database...");
      try {
        const matchedItems = await matchWithDatabaseFoods(foodItems);
        console.log("Matched items:", matchedItems);

        if (!matchedItems || matchedItems.length === 0) {
          throw new Error("Não foi possível encontrar os alimentos em nosso banco de dados");
        }

        setExtractedItems(matchedItems);
        setStep("reviewing");
      } catch (matchError) {
        console.error("Error matching with database:", matchError);
        throw new Error(
          "Erro ao procurar alimentos no banco de dados: " +
            (matchError instanceof Error ? matchError.message : "Erro desconhecido")
        );
      }
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

      // Close the modal
      onClose();

      // Show toast notification and navigate
      const itemCount = extractedItems.filter((item) => item.food).length;
      showToast(
        `${itemCount} ${itemCount === 1 ? "alimento adicionado" : "alimentos adicionados"} ao diário`,
        "success"
      );
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving items:", error);
      Alert.alert("Erro", "Ocorreu um erro ao salvar os alimentos. Por favor, tente novamente.", [{ text: "OK" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setStep("recording");
    setAudioUri(null);
    setTranscription("");
    setExtractedItems([]);
    setError(null);
    setDebug(null);
    onClose();
  };

  // Function to try again with manual text input
  const tryAgainWithText = () => {
    if (!transcription) return;

    setStep("processing");
    setIsProcessing(true);
    setError(null);

    // Process the transcription text directly
    const processTranscription = async () => {
      try {
        const foodItems = await extractFoodItems(transcription);
        console.log("Extracted food items from text:", foodItems);

        if (foodItems.length === 0) {
          throw new Error("Não foi possível identificar alimentos no texto. Por favor, tente ser mais específico.");
        }

        const matchedItems = await matchWithDatabaseFoods(foodItems);

        if (matchedItems.length === 0) {
          throw new Error("Não foi possível encontrar os alimentos em nosso banco de dados");
        }

        // Get full food details
        const itemsWithDetails = await Promise.all(
          matchedItems.map(async (item) => {
            const food = await getFoodById(item.foodId);
            return {
              ...item,
              food,
            };
          })
        );

        setExtractedItems(itemsWithDetails.filter((item) => item.food !== null));
        setStep("reviewing");
      } catch (error) {
        console.error("Error processing text:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido ao processar texto");
        setStep("recording");
      } finally {
        setIsProcessing(false);
      }
    };

    processTranscription();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={false}
      animationType="slide"
      onRequestClose={resetAndClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center py-3 px-4 border-b border-border">
          <Pressable onPress={resetAndClose} className="p-2">
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">
            {step === "recording" && "Adicionar por Voz"}
            {step === "processing" && "Processando Áudio"}
            {step === "reviewing" && "Revisar Alimentos"}
            {step === "saving" && "Salvando"}
          </Text>
        </View>

        <View className="flex-1 px-4">
          {step === "recording" && (
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} onCancel={resetAndClose} />
          )}

          {step === "processing" && (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-foreground mt-4 text-center">Processando o áudio...</Text>
              {transcription && <Text className="text-muted-foreground mt-2 text-center">"{transcription}"</Text>}
            </View>
          )}

          {error && (
            <View className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <Text className="text-red-500">{error}</Text>
              {transcription && (
                <View className="mt-4">
                  <Text className="text-foreground font-medium mb-2">Transcrição detectada:</Text>
                  <Text className="text-muted-foreground">"{transcription}"</Text>

                  <Button className="mt-4" onPress={tryAgainWithText}>
                    Tentar novamente com este texto
                  </Button>
                </View>
              )}
            </View>
          )}

          {debug && __DEV__ && (
            <View className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Text className="text-xs text-blue-500">Debug: {debug}</Text>
            </View>
          )}

          {step === "reviewing" && (
            <ScrollView className="flex-1 py-4">
              <View className="bg-card rounded-lg border border-border p-4 mb-4">
                <Text className="text-foreground font-medium mb-2">Transcrição:</Text>
                <Text className="text-muted-foreground">{transcription}</Text>
              </View>

              <Text className="text-lg font-bold text-foreground mb-2">Alimentos Identificados:</Text>

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
                <Button variant="outline" className="mr-2" onPress={() => setStep("recording")}>
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
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default VoiceFoodLoggingModal;

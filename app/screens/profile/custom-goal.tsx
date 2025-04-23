import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { saveUserMacros } from "../../models/user";
import Button from "../../components/ui/Button";

// Main component moved to separate function
function CustomGoalScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // State for macro values
  const [calories, setCalories] = useState(userProfile?.macros?.calories?.toString() || "");
  const [protein, setProtein] = useState(userProfile?.macros?.protein?.toString() || "");
  const [carbs, setCarbs] = useState(userProfile?.macros?.carbs?.toString() || "");
  const [fat, setFat] = useState(userProfile?.macros?.fat?.toString() || "");

  // Form validation
  const [errors, setErrors] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  // Calculate percentages for display
  const calculatePercentage = () => {
    const caloriesNum = parseInt(calories);
    const proteinNum = parseInt(protein);
    const carbsNum = parseInt(carbs);
    const fatNum = parseInt(fat);

    if (isNaN(caloriesNum) || caloriesNum === 0) return { protein: 0, carbs: 0, fat: 0 };

    const proteinCals = proteinNum * 4;
    const carbsCals = carbsNum * 4;
    const fatCals = fatNum * 9;

    return {
      protein: Math.round((proteinCals / caloriesNum) * 100),
      carbs: Math.round((carbsCals / caloriesNum) * 100),
      fat: Math.round((fatCals / caloriesNum) * 100),
    };
  };

  const percentages = calculatePercentage();

  // Validate form data
  const validate = () => {
    let isValid = true;
    const newErrors = {
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    };

    if (!calories || isNaN(parseInt(calories))) {
      newErrors.calories = "Digite um valor válido para calorias";
      isValid = false;
    }

    if (!protein || isNaN(parseInt(protein))) {
      newErrors.protein = "Digite um valor válido para proteínas";
      isValid = false;
    }

    if (!carbs || isNaN(parseInt(carbs))) {
      newErrors.carbs = "Digite um valor válido para carboidratos";
      isValid = false;
    }

    if (!fat || isNaN(parseInt(fat))) {
      newErrors.fat = "Digite um valor válido para gorduras";
      isValid = false;
    }

    // Check if calorie sum from macros roughly equals total calories
    const proteinCals = parseInt(protein) * 4;
    const carbsCals = parseInt(carbs) * 4;
    const fatCals = parseInt(fat) * 9;
    const totalFromMacros = proteinCals + carbsCals + fatCals;

    if (!isNaN(totalFromMacros) && !isNaN(parseInt(calories)) && Math.abs(totalFromMacros - parseInt(calories)) > 50) {
      newErrors.calories = "A soma das calorias dos macronutrientes não corresponde ao total de calorias";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (!user) {
        Alert.alert("Erro", "Usuário não autenticado");
        return;
      }

      // Keep the existing goal and activity level or use defaults
      const macroData = {
        calories: parseInt(calories),
        protein: parseInt(protein),
        carbs: parseInt(carbs),
        fat: parseInt(fat),
        goal: userProfile?.macros?.goal || "maintain",
        activityLevel: userProfile?.macros?.activityLevel || "moderate",
        isCustom: true,
      };

      await saveUserMacros(user.id, macroData);
      await refreshProfile();

      Alert.alert("Sucesso", "Suas metas personalizadas foram salvas com sucesso", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error saving custom goals:", error);
      Alert.alert("Erro", "Não foi possível salvar suas metas personalizadas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Recalculate percentages when inputs change
  useEffect(() => {
    calculatePercentage();
  }, [calories, protein, carbs, fat]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-row items-center p-4 border-b border-border">
          <Pressable onPress={() => router.back()} className="p-2">
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Meta Personalizada</Text>
        </View>

        <ScrollView className="flex-1 p-6">
          <View className="bg-card rounded-xl border border-border p-4 mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Configure suas metas manualmente</Text>
            <Text className="text-sm text-muted-foreground mb-6">
              Como assinante PRO, você pode definir suas próprias metas nutricionais de acordo com suas necessidades
              específicas.
            </Text>

            {/* Calories Input */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">Calorias Diárias</Text>
              <TextInput
                className="bg-input border border-border rounded-lg p-3 text-foreground"
                keyboardType="numeric"
                placeholder="Ex: 2000"
                placeholderTextColor={colors.muted}
                value={calories}
                onChangeText={setCalories}
              />
              {errors.calories ? <Text className="text-red-500 text-xs mt-1">{errors.calories}</Text> : null}
            </View>

            {/* Protein Input */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-foreground font-medium">Proteínas (g)</Text>
                {percentages.protein > 0 && (
                  <Text className="text-sm text-purple-500">{percentages.protein}% das calorias</Text>
                )}
              </View>
              <TextInput
                className="bg-input border border-border rounded-lg p-3 text-foreground"
                keyboardType="numeric"
                placeholder="Ex: 150"
                placeholderTextColor={colors.muted}
                value={protein}
                onChangeText={setProtein}
              />
              {errors.protein ? <Text className="text-red-500 text-xs mt-1">{errors.protein}</Text> : null}
            </View>

            {/* Carbs Input */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-foreground font-medium">Carboidratos (g)</Text>
                {percentages.carbs > 0 && (
                  <Text className="text-sm text-yellow-500">{percentages.carbs}% das calorias</Text>
                )}
              </View>
              <TextInput
                className="bg-input border border-border rounded-lg p-3 text-foreground"
                keyboardType="numeric"
                placeholder="Ex: 200"
                placeholderTextColor={colors.muted}
                value={carbs}
                onChangeText={setCarbs}
              />
              {errors.carbs ? <Text className="text-red-500 text-xs mt-1">{errors.carbs}</Text> : null}
            </View>

            {/* Fat Input */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-foreground font-medium">Gorduras (g)</Text>
                {percentages.fat > 0 && <Text className="text-sm text-red-500">{percentages.fat}% das calorias</Text>}
              </View>
              <TextInput
                className="bg-input border border-border rounded-lg p-3 text-foreground"
                keyboardType="numeric"
                placeholder="Ex: 65"
                placeholderTextColor={colors.muted}
                value={fat}
                onChangeText={setFat}
              />
              {errors.fat ? <Text className="text-red-500 text-xs mt-1">{errors.fat}</Text> : null}
            </View>

            {/* Total % validation */}
            {percentages.protein + percentages.carbs + percentages.fat > 0 &&
              Math.abs(100 - (percentages.protein + percentages.carbs + percentages.fat)) > 5 && (
                <View className="mb-4 p-3 bg-yellow-500/10 rounded-lg">
                  <Text className="text-yellow-500 text-sm">
                    Aviso: A soma dos percentuais de macronutrientes é{" "}
                    {percentages.protein + percentages.carbs + percentages.fat}%. Idealmente, deveria ser próximo de
                    100%.
                  </Text>
                </View>
              )}
          </View>

          <Button onPress={handleSave} disabled={loading}>
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white">Salvando...</Text>
              </View>
            ) : (
              <Text className="text-white">Salvar Meta Personalizada</Text>
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default CustomGoalScreen;

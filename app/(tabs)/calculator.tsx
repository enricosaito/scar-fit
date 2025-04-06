// app/(tabs)/calculator.tsx
import React, { useState } from "react";
import { Text, View, SafeAreaView, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { saveUserMacros } from "../models/user";

// Define types
type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "extreme";
type Goal = "lose" | "maintain" | "gain";

interface FormData {
  gender: Gender;
  age: string;
  weight: string;
  height: string;
  activityLevel: ActivityLevel;
  goal: Goal;
}

interface Step {
  id: string;
  title: string;
}

// Define our steps
const STEPS: Step[] = [
  { id: "welcome", title: "Bem-vindo" },
  { id: "personal", title: "Dados Pessoais" },
  { id: "activity", title: "Nível de Atividade" },
  { id: "goal", title: "Objetivo" },
  { id: "results", title: "Resultados" },
];

// Helper function to calculate BMR using Mifflin-St Jeor formula
const calculateBMR = (gender: Gender, weight: string, height: string, age: string): number => {
  const numWeight = parseFloat(weight);
  const numHeight = parseFloat(height);
  const numAge = parseFloat(age);

  if (isNaN(numWeight) || isNaN(numHeight) || isNaN(numAge)) {
    return 0;
  }

  // Mifflin-St Jeor formula
  if (gender === "male") {
    return 10 * numWeight + 6.25 * numHeight - 5 * numAge + 5;
  } else {
    return 10 * numWeight + 6.25 * numHeight - 5 * numAge - 161;
  }
};

// Get activity multiplier
const getActivityMultiplier = (activityLevel: ActivityLevel): number => {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  };

  return multipliers[activityLevel] || 1.2;
};

// Get goal adjustment
const getGoalAdjustment = (goal: Goal): number => {
  const adjustments: Record<Goal, number> = {
    lose: 0.8, // 20% caloric deficit
    maintain: 1,
    gain: 1.15, // 15% caloric surplus
  };

  return adjustments[goal] || 1;
};

interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Calculate macros based on TDEE and weight
const calculateMacros = (tdee: number, weight: string, goal: Goal): MacroResult => {
  const numWeight = parseFloat(weight);

  if (isNaN(numWeight)) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  // For more precise protein calculation based on goal
  let proteinMultiplier: number;
  switch (goal) {
    case "lose":
      proteinMultiplier = 2.4; // Higher protein for weight loss to preserve muscle
      break;
    case "gain":
      proteinMultiplier = 2.0; // Slightly lower for bulking
      break;
    default:
      proteinMultiplier = 2.2; // Standard recommendation
  }

  // Calculate protein (protein multiplier per kg)
  const proteinGrams = Math.round(numWeight * proteinMultiplier);

  // Calculate protein calories (4 calories per gram)
  const proteinCalories = proteinGrams * 4;

  let fatPercentage: number, remainingCalories: number;

  switch (goal) {
    case "lose":
      fatPercentage = 0.3; // 30% fat for weight loss (helps with satiety)
      break;
    case "maintain":
      fatPercentage = 0.25; // 25% fat
      break;
    case "gain":
      fatPercentage = 0.2; // 20% fat (more carbs for energy)
      break;
    default:
      fatPercentage = 0.25;
  }

  // Calculate fat calories and grams
  const fatCalories = tdee * fatPercentage;
  const fatGrams = Math.round(fatCalories / 9);

  // Remaining calories for carbs
  remainingCalories = tdee - proteinCalories - fatCalories;

  // Calculate carbs (4 calories per gram)
  const carbGrams = Math.round(remainingCalories / 4);

  return {
    calories: Math.round(tdee),
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
  };
};

export default function Calculator() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    gender: "male",
    age: "",
    weight: "",
    height: "",
    activityLevel: "moderate",
    goal: "maintain",
  });

  const handleNextStep = (): void => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/(tabs)");
    }
  };

  const updateFormData = (key: keyof FormData, value: string | Gender | ActivityLevel | Goal): void => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Render the correct step content
  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case "welcome":
        return <WelcomeStep onNext={handleNextStep} />;
      case "personal":
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePrevStep}
          />
        );
      case "activity":
        return (
          <ActivityLevelStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePrevStep}
          />
        );
      case "goal":
        return (
          <GoalStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePrevStep}
          />
        );
      case "results":
        return <ResultsStep formData={formData} onBack={handlePrevStep} />;
      default:
        return <WelcomeStep onNext={handleNextStep} />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center py-2 px-4 border-b border-border">
        <Pressable onPress={handlePrevStep} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">{STEPS[currentStep].title}</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Progress indicator */}
        {currentStep > 0 && (
          <View className="flex-row justify-between mt-4 mb-2 px-1">
            {STEPS.map((step, index) => (
              <View
                key={step.id}
                className={`h-1 flex-1 mx-1 rounded-full ${index <= currentStep ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </View>
        )}

        {/* Step content */}
        {renderStepContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

// Step Components
interface StepProps {
  onNext: () => void;
}

function WelcomeStep({ onNext }: StepProps) {
  return (
    <View className="py-6">
      <Text className="text-3xl font-bold text-center text-foreground mb-2">Calculadora de Macros</Text>
      <Text className="text-muted-foreground text-center mb-6">
        Vamos descobrir suas necessidades nutricionais ideais
      </Text>

      <View className="bg-card rounded-xl border border-border p-6 mb-6">
        <Text className="text-lg font-semibold text-foreground mb-4">Como funciona?</Text>
        <Text className="text-muted-foreground mb-4">
          Em apenas alguns passos, você receberá recomendações personalizadas de macronutrientes baseadas em seu perfil
          físico e objetivos.
        </Text>
        <Text className="text-muted-foreground mb-4">
          Vamos precisar de algumas informações como idade, peso, altura e nível de atividade física.
        </Text>
        <Button className="w-full my-2" onPress={onNext}>
          Começar
        </Button>
      </View>

      <View className="bg-accent rounded-xl p-6">
        <Text className="text-lg font-semibold text-accent-foreground mb-2">Por que calculamos macros?</Text>
        <Text className="text-accent-foreground">
          Nossa calculadora usa a fórmula Mifflin-St Jeor para calcular seu metabolismo basal com precisão. Também
          recomendamos 2,2g de proteína por kg de peso corporal para otimizar a recuperação muscular e promover a
          saciedade.
        </Text>
      </View>
    </View>
  );
}

interface FormStepProps extends StepProps {
  formData: FormData;
  updateFormData: (key: keyof FormData, value: string | Gender | ActivityLevel | Goal) => void;
  onBack: () => void;
}

function PersonalInfoStep({ formData, updateFormData, onNext, onBack }: FormStepProps) {
  const { colors } = useTheme();

  return (
    <View className="py-6">
      <Text className="text-2xl font-bold text-center text-foreground mb-2">Informações Pessoais</Text>

      <Text className="text-muted-foreground mb-6 text-center">
        Vamos iniciar com alguns dados básicos para calcular suas necessidades calóricas.
      </Text>

      <View className="bg-card rounded-xl border border-border p-6 mb-6">
        {/* Gender Selection */}
        <View className="mb-4">
          <Text className="font-medium text-foreground mb-2">Sexo</Text>
          <View className="flex-row">
            <Pressable
              className={`flex-1 py-3 border mr-2 rounded-md items-center ${
                formData.gender === "male" ? "bg-primary border-primary" : "border-border bg-card"
              }`}
              onPress={() => updateFormData("gender", "male")}
            >
              <Text className={formData.gender === "male" ? "text-white font-medium" : "text-foreground"}>
                Masculino
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 py-3 border ml-2 rounded-md items-center ${
                formData.gender === "female" ? "bg-primary border-primary" : "border-border bg-card"
              }`}
              onPress={() => updateFormData("gender", "female")}
            >
              <Text className={formData.gender === "female" ? "text-white font-medium" : "text-foreground"}>
                Feminino
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Age Input */}
        <View className="mb-4">
          <Text className="font-medium text-foreground mb-2">Idade (anos)</Text>
          <TextInput
            className="border border-border bg-card text-foreground rounded-md px-3 py-2"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(text) => updateFormData("age", text)}
            placeholder="Ex: 30"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        {/* Weight Input */}
        <View className="mb-4">
          <Text className="font-medium text-foreground mb-2">Peso (kg)</Text>
          <TextInput
            className="border border-border bg-card text-foreground rounded-md px-3 py-2"
            keyboardType="numeric"
            value={formData.weight}
            onChangeText={(text) => updateFormData("weight", text)}
            placeholder="Ex: 70"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        {/* Height Input */}
        <View className="mb-2">
          <Text className="font-medium text-foreground mb-2">Altura (cm)</Text>
          <TextInput
            className="border border-border bg-card text-foreground rounded-md px-3 py-2"
            keyboardType="numeric"
            value={formData.height}
            onChangeText={(text) => updateFormData("height", text)}
            placeholder="Ex: 170"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
      </View>

      <View className="flex-row justify-between mt-6">
        <Button variant="outline" onPress={onBack} className="flex-1 mr-2">
          Voltar
        </Button>
        <Button onPress={onNext} className="flex-1 ml-2">
          Próximo
        </Button>
      </View>
    </View>
  );
}

function ActivityLevelStep({ formData, updateFormData, onNext, onBack }: FormStepProps) {
  const activityLevels: Array<{ id: ActivityLevel; title: string; description: string }> = [
    { id: "sedentary", title: "Sedentário", description: "Pouco ou nenhum exercício" },
    { id: "light", title: "Levemente Ativo", description: "Exercício leve 1-3 dias por semana" },
    { id: "moderate", title: "Moderadamente Ativo", description: "Exercício moderado 3-5 dias por semana" },
    { id: "active", title: "Muito Ativo", description: "Exercício intenso 6-7 dias por semana" },
    {
      id: "extreme",
      title: "Extremamente Ativo",
      description: "Exercício muito intenso, trabalho físico, ou treinamento 2x por dia",
    },
  ];

  return (
    <View className="py-6">
      <Text className="text-2xl font-bold text-center text-foreground mb-2">Nível de Atividade</Text>

      <Text className="text-muted-foreground mb-6 text-center">
        Selecione o nível de atividade física que melhor descreve sua rotina.
      </Text>

      <View className="mb-6">
        {activityLevels.map((level) => (
          <Pressable
            key={level.id}
            className={`mb-3 p-4 border rounded-xl ${
              formData.activityLevel === level.id ? "bg-primary/10 border-primary" : "border-border bg-card"
            }`}
            onPress={() => updateFormData("activityLevel", level.id)}
          >
            <Text className={`font-medium ${formData.activityLevel === level.id ? "text-primary" : "text-foreground"}`}>
              {level.title}
            </Text>
            <Text className="text-muted-foreground mt-1">{level.description}</Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row justify-between mt-6">
        <Button variant="outline" onPress={onBack} className="flex-1 mr-2">
          Voltar
        </Button>
        <Button onPress={onNext} className="flex-1 ml-2">
          Próximo
        </Button>
      </View>
    </View>
  );
}

function GoalStep({ formData, updateFormData, onNext, onBack }: FormStepProps) {
  const goals: Array<{ id: Goal; title: string; description: string }> = [
    { id: "lose", title: "Perder Peso", description: "Déficit calórico para perda de gordura" },
    { id: "maintain", title: "Manter Peso", description: "Manutenção do peso atual" },
    { id: "gain", title: "Ganhar Massa", description: "Superávit calórico para ganho muscular" },
  ];

  return (
    <View className="py-6">
      <Text className="text-2xl font-bold text-center text-foreground mb-2">Seu Objetivo</Text>

      <Text className="text-muted-foreground mb-6 text-center">Qual é o seu principal objetivo de fitness?</Text>

      <View className="mb-6">
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            className={`mb-3 p-4 border rounded-xl ${
              formData.goal === goal.id ? "bg-primary/10 border-primary" : "border-border bg-card"
            }`}
            onPress={() => updateFormData("goal", goal.id)}
          >
            <Text className={`font-medium ${formData.goal === goal.id ? "text-primary" : "text-foreground"}`}>
              {goal.title}
            </Text>
            <Text className="text-muted-foreground mt-1">{goal.description}</Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row justify-between mt-6">
        <Button variant="outline" onPress={onBack} className="flex-1 mr-2">
          Voltar
        </Button>
        <Button onPress={onNext} className="flex-1 ml-2">
          Calcular
        </Button>
      </View>
    </View>
  );
}

interface ResultsStepProps {
  formData: FormData;
  onBack: () => void;
}

interface MacroItem {
  name: string;
  value: number;
  unit: string;
  color: string;
  percentage?: number;
}

function ResultsStep({ formData, onBack }: ResultsStepProps) {
  const { colors } = useTheme();
  const { user, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  // Calculate BMR
  const bmr = calculateBMR(formData.gender, formData.weight, formData.height, formData.age);

  // Calculate TDEE (Total Daily Energy Expenditure)
  const activityMultiplier = getActivityMultiplier(formData.activityLevel);
  const tdee = bmr * activityMultiplier;

  // Apply goal adjustment
  const goalAdjustment = getGoalAdjustment(formData.goal);
  const adjustedTdee = tdee * goalAdjustment;

  // Calculate macros
  const macros = calculateMacros(adjustedTdee, formData.weight, formData.goal);

  // Calculate percentages for display
  const proteinPercentage = Math.round(((macros.protein * 4) / macros.calories) * 100);
  const carbsPercentage = Math.round(((macros.carbs * 4) / macros.calories) * 100);
  const fatPercentage = Math.round(((macros.fat * 9) / macros.calories) * 100);

  const goalText = {
    lose: "perda de peso",
    maintain: "manutenção",
    gain: "ganho de massa muscular",
  }[formData.goal];

  // Add this function to save results
  const handleSaveResults = async () => {
    if (!user) {
      // If not logged in, redirect to login
      router.push("/auth/login");
      return;
    }

    setIsSaving(true);
    try {
      await saveUserMacros(user.id, {
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        goal: formData.goal,
        activityLevel: formData.activityLevel,
      });

      // Refresh the profile to update context
      await refreshProfile();
      setIsSaved(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving macros:", error);
      Alert.alert("Erro", "Não foi possível salvar seus resultados. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="py-6">
      <Text className="text-2xl font-bold text-center text-foreground mb-2">Seus Resultados</Text>

      <Text className="text-muted-foreground mb-6 text-center">
        Aqui estão suas recomendações diárias de macronutrientes para {goalText}.
      </Text>

      {/* Calories Card - Big and prominent */}
      <View className="bg-card rounded-xl border border-border p-6 mb-6 items-center">
        <Text className="text-sm font-medium text-primary mb-1">Total Diário</Text>
        <Text className="text-5xl font-bold text-foreground mb-2">{macros.calories}</Text>
        <Text className="text-muted-foreground mb-4">calorias</Text>

        <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-1">
          <Feather name="battery-charging" size={28} color={colors.primary} />
        </View>
      </View>

      {/* Three smaller cards for macronutrients in a row */}
      <View className="flex-row justify-between mb-6">
        {/* Protein Card */}
        <View className="bg-card rounded-xl border border-border p-4 w-[31%] items-center">
          <View className="w-10 h-10 bg-blue-500/10 rounded-full items-center justify-center mb-2">
            <Feather name="award" size={18} color="#3b82f6" />
          </View>
          <Text className="text-xl font-bold text-foreground">{macros.protein}</Text>
          <Text className="text-xs text-muted-foreground mb-1">g proteína</Text>
          <Text className="text-xs text-blue-500 font-medium">{proteinPercentage}%</Text>
        </View>

        {/* Carbs Card */}
        <View className="bg-card rounded-xl border border-border p-4 w-[31%] items-center">
          <View className="w-10 h-10 bg-yellow-500/10 rounded-full items-center justify-center mb-2">
            <Feather name="box" size={18} color="#eab308" />
          </View>
          <Text className="text-xl font-bold text-foreground">{macros.carbs}</Text>
          <Text className="text-xs text-muted-foreground mb-1">g carboidratos</Text>
          <Text className="text-xs text-yellow-500 font-medium">{carbsPercentage}%</Text>
        </View>

        {/* Fats Card */}
        <View className="bg-card rounded-xl border border-border p-4 w-[31%] items-center">
          <View className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center mb-2">
            <Feather name="droplet" size={18} color="#ef4444" />
          </View>
          <Text className="text-xl font-bold text-foreground">{macros.fat}</Text>
          <Text className="text-xs text-muted-foreground mb-1">g gorduras</Text>
          <Text className="text-xs text-red-500 font-medium">{fatPercentage}%</Text>
        </View>
      </View>

      {/* Distribution Chart */}
      <View className="bg-card rounded-xl border border-border p-4 mb-6">
        <Text className="font-medium text-foreground mb-3">Distribuição de Macros</Text>
        <View className="h-4 flex-row rounded-full overflow-hidden mb-3">
          <View className="h-full bg-blue-500" style={{ width: `${proteinPercentage}%` }} />
          <View className="h-full bg-yellow-500" style={{ width: `${carbsPercentage}%` }} />
          <View className="h-full bg-red-500" style={{ width: `${fatPercentage}%` }} />
        </View>
        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
            <Text className="text-xs text-muted-foreground">Proteínas</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-yellow-500 mr-1" />
            <Text className="text-xs text-muted-foreground">Carboidratos</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
            <Text className="text-xs text-muted-foreground">Gorduras</Text>
          </View>
        </View>
      </View>

      {/* Calculation Details */}
      <View className="bg-card rounded-xl border border-border p-4 mb-6">
        <Text className="font-medium text-foreground mb-3">Detalhes do Cálculo</Text>
        <View className="flex-row justify-between mb-1">
          <Text className="text-muted-foreground">Metabolismo Basal (BMR)</Text>
          <Text className="text-foreground">{Math.round(bmr)} kcal</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-muted-foreground">Fator de Atividade</Text>
          <Text className="text-foreground">x {activityMultiplier.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-muted-foreground">TDEE</Text>
          <Text className="text-foreground">{Math.round(tdee)} kcal</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground">Ajuste para {goalText}</Text>
          <Text className="text-foreground">x {goalAdjustment.toFixed(2)}</Text>
        </View>
      </View>

      <View className="bg-accent rounded-xl p-6 mb-6">
        <Text className="text-lg font-semibold text-accent-foreground mb-2">Dica Nutricional</Text>
        <Text className="text-accent-foreground">
          Sua recomendação de proteína ({macros.protein}g, ou 2,2g por kg de peso) é ideal para otimizar a recuperação
          muscular e promover a saciedade. Distribua suas proteínas ao longo do dia para melhores resultados.
        </Text>
      </View>

      <View className="flex-row mt-6">
        <Button variant="outline" onPress={onBack} className="flex-1 mr-2">
          Voltar
        </Button>
        <Button className="flex-1 ml-2" onPress={handleSaveResults} disabled={isSaving || isSaved}>
          {isSaving ? <ActivityIndicator size="small" color="white" /> : isSaved ? "Salvo!" : "Salvar Resultados"}
        </Button>
      </View>
    </View>
  );
}

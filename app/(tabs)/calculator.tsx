// app/(tabs)/calculator.tsx
import React, { useState } from "react";
import { Text, View, SafeAreaView, ScrollView, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Button from "../components/ui/Button";

// Define our steps
const STEPS = [
  { id: "welcome", title: "Bem-vindo" },
  { id: "personal", title: "Dados Pessoais" },
  { id: "activity", title: "Nível de Atividade" },
  { id: "goal", title: "Objetivo" },
  { id: "results", title: "Resultados" },
];

// Helper function to calculate BMR using Mifflin-St Jeor formula
const calculateBMR = (gender, weight, height, age) => {
  const numWeight = parseFloat(weight);
  const numHeight = parseFloat(height);
  const numAge = parseFloat(age);

  if (isNaN(numWeight) || isNaN(numHeight) || isNaN(numAge)) {
    return 0;
  }

  if (gender === "male") {
    return 10 * numWeight + 6.25 * numHeight - 5 * numAge + 5;
  } else {
    return 10 * numWeight + 6.25 * numHeight - 5 * numAge - 161;
  }
};

// Get activity multiplier
const getActivityMultiplier = (activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  };

  return multipliers[activityLevel] || 1.2;
};

// Get goal adjustment
const getGoalAdjustment = (goal) => {
  const adjustments = {
    lose: 0.8, // 20% caloric deficit
    maintain: 1,
    gain: 1.15, // 15% caloric surplus
  };

  return adjustments[goal] || 1;
};

// Calculate macros based on TDEE
const calculateMacros = (tdee, goal) => {
  let proteinPercentage, carbPercentage, fatPercentage;

  switch (goal) {
    case "lose":
      proteinPercentage = 0.4; // 40% protein
      fatPercentage = 0.35; // 35% fat
      carbPercentage = 0.25; // 25% carbs
      break;
    case "maintain":
      proteinPercentage = 0.3; // 30% protein
      fatPercentage = 0.3; // 30% fat
      carbPercentage = 0.4; // 40% carbs
      break;
    case "gain":
      proteinPercentage = 0.3; // 30% protein
      fatPercentage = 0.25; // 25% fat
      carbPercentage = 0.45; // 45% carbs
      break;
    default:
      proteinPercentage = 0.3;
      fatPercentage = 0.3;
      carbPercentage = 0.4;
  }

  // Calculate grams
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fat: 9 calories per gram
  const proteinCalories = tdee * proteinPercentage;
  const carbCalories = tdee * carbPercentage;
  const fatCalories = tdee * fatPercentage;

  const proteinGrams = Math.round(proteinCalories / 4);
  const carbGrams = Math.round(carbCalories / 4);
  const fatGrams = Math.round(fatCalories / 9);

  return {
    calories: Math.round(tdee),
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
  };
};

export default function Calculator() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    gender: "male",
    age: "",
    weight: "",
    height: "",
    activityLevel: "moderate",
    goal: "maintain",
  });

  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/(tabs)");
    }
  };

  const updateFormData = (key, value) => {
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center py-2 px-4 border-b border-gray-200">
        <Pressable onPress={handlePrevStep} className="p-2">
          <Feather name="arrow-left" size={24} color="#333" />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center mr-8">{STEPS[currentStep].title}</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Progress indicator */}
        {currentStep > 0 && (
          <View className="flex-row justify-between mt-4 mb-2 px-1">
            {STEPS.map((step, index) => (
              <View
                key={step.id}
                className={`h-1 flex-1 mx-1 rounded-full ${index <= currentStep ? "bg-primary" : "bg-gray-200"}`}
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
function WelcomeStep({ onNext }) {
  return (
    <View className="py-6">
      <Text className="text-3xl font-bold text-center mb-2">Calculadora de Macros</Text>
      <Text className="text-gray-500 text-center mb-6">Vamos descobrir suas necessidades nutricionais ideais</Text>

      <View className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <Text className="text-lg font-semibold mb-4">Como funciona?</Text>
        <Text className="text-gray-500 mb-4">
          Em apenas alguns passos, você receberá recomendações personalizadas de macronutrientes baseadas em seu perfil
          físico e objetivos.
        </Text>
        <Text className="text-gray-500 mb-4">
          Vamos precisar de algumas informações como idade, peso, altura e nível de atividade física.
        </Text>
        <Button className="w-full my-2" onPress={onNext}>
          Começar
        </Button>
      </View>

      <View className="bg-green-50 rounded-xl p-6">
        <Text className="text-lg font-semibold text-green-900 mb-2">Por que calculamos macros?</Text>
        <Text className="text-green-800">
          Cada macronutriente tem um papel fundamental na sua saúde e performance. Proteínas ajudam na recuperação
          muscular, carboidratos fornecem energia e gorduras são essenciais para hormônios.
        </Text>
      </View>
    </View>
  );
}

function PersonalInfoStep({ formData, updateFormData, onNext, onBack }) {
  return (
    <View className="py-6">
      <Text className="text-2xl font-bold text-center mb-2">Informações Pessoais</Text>

      <Text className="text-gray-500 mb-6 text-center">
        Vamos iniciar com alguns dados básicos para calcular suas necessidades calóricas.
      </Text>

      <View className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {/* Gender Selection */}
        <View className="mb-4">
          <Text className="font-medium mb-2">Sexo</Text>
          <View className="flex-row">
            <Pressable
              className={`flex-1 py-3 border mr-2 rounded-md items-center ${
                formData.gender === "male" ? "bg-primary border-primary" : "border-gray-300"
              }`}
              onPress={() => updateFormData("gender", "male")}
            >
              <Text className={formData.gender === "male" ? "text-white font-medium" : "text-gray-800"}>Masculino</Text>
            </Pressable>

            <Pressable
              className={`flex-1 py-3 border ml-2 rounded-md items-center ${
                formData.gender === "female" ? "bg-primary border-primary" : "border-gray-300"
              }`}
              onPress={() => updateFormData("gender", "female")}
            >
              <Text className={formData.gender === "female" ? "text-white font-medium" : "text-gray-800"}>
                Feminino
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Age Input */}
        <View className="mb-4">
          <Text className="font-medium mb-2">Idade (anos)</Text>
          <TextInput
            className="border border-gray-300 rounded-md px-3 py-2"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(text) => updateFormData("age", text)}
            placeholder="Ex: 30"
          />
        </View>

        {/* Weight Input */}
        <View className="mb-4">
          <Text className="font-medium mb-2">Peso (kg)</Text>
          <TextInput
            className="border border-gray-300 rounded-md px-3 py-2"
            keyboardType="numeric"
            value={formData.weight}
            onChangeText={(text) => updateFormData("weight", text)}
            placeholder="Ex: 70"
          />
        </View>

        {/* Height Input */}
        <View className="mb-2">
          <Text className="font-medium mb-2">Altura (cm)</Text>
          <TextInput
            className="border border-gray-300 rounded-md px-3 py-2"
            keyboardType="numeric"
            value={formData.height}
            onChangeText={(text) => updateFormData("height", text)}
            placeholder="Ex: 170"
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

function ActivityLevelStep({ formData, updateFormData, onNext, onBack }) {
  const activityLevels = [
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
      <Text className="text-2xl font-bold text-center mb-2">Nível de Atividade</Text>

      <Text className="text-gray-500 mb-6 text-center">
        Selecione o nível de atividade física que melhor descreve sua rotina.
      </Text>

      <View className="mb-6">
        {activityLevels.map((level) => (
          <Pressable
            key={level.id}
            className={`mb-3 p-4 border rounded-xl ${
              formData.activityLevel === level.id ? "bg-green-50 border-primary" : "border-gray-200"
            }`}
            onPress={() => updateFormData("activityLevel", level.id)}
          >
            <Text className={`font-medium ${formData.activityLevel === level.id ? "text-primary" : "text-gray-800"}`}>
              {level.title}
            </Text>
            <Text className="text-gray-500 mt-1">{level.description}</Text>
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

function GoalStep({ formData, updateFormData, onNext, onBack }) {
  const goals = [
    { id: "lose", title: "Perder Peso", description: "Déficit calórico para perda de gordura" },
    { id: "maintain", title: "Manter Peso", description: "Manutenção do peso atual" },
    { id: "gain", title: "Ganhar Massa", description: "Superávit calórico para ganho muscular" },
  ];

  return (
    <View className="py-6">
      <Text className="text-2xl font-bold text-center mb-2">Seu Objetivo</Text>

      <Text className="text-gray-500 mb-6 text-center">Qual é o seu principal objetivo de fitness?</Text>

      <View className="mb-6">
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            className={`mb-3 p-4 border rounded-xl ${
              formData.goal === goal.id ? "bg-green-50 border-primary" : "border-gray-200"
            }`}
            onPress={() => updateFormData("goal", goal.id)}
          >
            <Text className={`font-medium ${formData.goal === goal.id ? "text-primary" : "text-gray-800"}`}>
              {goal.title}
            </Text>
            <Text className="text-gray-500 mt-1">{goal.description}</Text>
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

function ResultsStep({ formData, onBack }) {
  // Calculate BMR
  const bmr = calculateBMR(formData.gender, formData.weight, formData.height, formData.age);

  // Calculate TDEE (Total Daily Energy Expenditure)
  const activityMultiplier = getActivityMultiplier(formData.activityLevel);
  const tdee = bmr * activityMultiplier;

  // Apply goal adjustment
  const goalAdjustment = getGoalAdjustment(formData.goal);
  const adjustedTdee = tdee * goalAdjustment;

  // Calculate macros
  const macros = calculateMacros(adjustedTdee, formData.goal);

  const macroItems = [
    { name: "Calorias", value: macros.calories, unit: "kcal", color: "bg-primary" },
    { name: "Proteínas", value: macros.protein, unit: "g", color: "bg-blue-500" },
    { name: "Carboidratos", value: macros.carbs, unit: "g", color: "bg-yellow-500" },
    { name: "Gorduras", value: macros.fat, unit: "g", color: "bg-red-500" },
  ];

  return (
    <View className="py-6">
      <Text className="text-2xl font-bold text-center mb-2">Seus Resultados</Text>

      <Text className="text-gray-500 mb-6 text-center">Aqui estão suas recomendações diárias de macronutrientes.</Text>

      <View className="mb-6">
        {macroItems.map((item, index) => (
          <View key={index} className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-medium">{item.name}</Text>
              <Text className="font-bold text-lg">
                {item.value} {item.unit}
              </Text>
            </View>
            <View className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
              <View className={`h-full ${item.color} rounded-full w-full`} style={{ width: "100%" }} />
            </View>
          </View>
        ))}
      </View>

      <View className="bg-green-50 rounded-xl p-6 mb-6">
        <Text className="text-lg font-semibold text-green-900 mb-2">Dica Nutricional</Text>
        <Text className="text-green-800">
          Procure distribuir seus macronutrientes ao longo do dia para manter seus níveis de energia e facilitar a
          recuperação muscular.
        </Text>
      </View>

      <View className="flex-row mt-6">
        <Button variant="outline" onPress={onBack} className="flex-1 mr-2">
          Voltar
        </Button>
        <Button className="flex-1 ml-2">Salvar Resultados</Button>
      </View>
    </View>
  );
}

// Update app/screens/onboarding/steps/PersonalInfo.tsx
import React from "react";
import {
  View,
  Text,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeInRight, FadeInLeft } from "react-native-reanimated";
import { useTheme } from "../../../context/ThemeContext";
import { useOnboarding } from "../context/OnboardingContext";
import CustomPicker from "../../../components/ui/CustomPicker";
import { heightValues, weightValues } from "../../../utils/heightWeightValues";
import { TextInput } from "react-native-gesture-handler";

interface PersonalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
}

const PersonalInfo = ({ onNext, onBack }: PersonalInfoStepProps) => {
  const { colors } = useTheme();
  const { formData, updateFormData } = useOnboarding();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center">
          {/* Animated Title */}
          <Animated.Text
            className="text-2xl font-bold text-center text-foreground mb-2"
            entering={FadeInLeft.duration(600)}
          >
            Informações Pessoais
          </Animated.Text>

          {/* Animated Subtitle */}
          <Animated.Text
            className="text-center text-muted-foreground mb-8"
            entering={FadeInLeft.duration(600).delay(100)}
          >
            Vamos personalizar sua experiência com base no seu perfil
          </Animated.Text>

          {/* Form Fields */}
          <Animated.View
            className="bg-card rounded-xl border border-border p-6 mb-6"
            entering={FadeInRight.duration(600).delay(200)}
          >
            {/* Gender Selection */}
            <View className="mb-6">
              <Text className="font-medium text-foreground mb-3">Sexo</Text>
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
            <View className="mb-6">
              <Text className="font-medium text-foreground mb-3">Idade (anos)</Text>
              <TextInput
                className="border border-border bg-card text-foreground rounded-md px-3 py-3"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => updateFormData("age", text)}
                placeholder="Ex: 30"
                placeholderTextColor={colors.mutedForeground}
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Weight Picker */}
            <CustomPicker
              label="Peso"
              value={formData.weight}
              onValueChange={(value) => updateFormData("weight", value.toString())}
              placeholder="Selecione seu peso"
              items={weightValues}
            />

            {/* Height Picker */}
            <CustomPicker
              label="Altura"
              value={formData.height}
              onValueChange={(value) => updateFormData("height", value.toString())}
              placeholder="Selecione sua altura"
              items={heightValues}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default PersonalInfo;

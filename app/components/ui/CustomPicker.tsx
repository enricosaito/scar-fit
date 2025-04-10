// app/components/ui/CustomPicker.tsx
import React, { useState } from "react";
import { View, Text, Modal, Pressable, SafeAreaView, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Button from "./Button";

interface CustomPickerProps {
  label: string;
  value: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  items: { label: string; value: string | number }[];
  error?: string;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  value,
  onValueChange,
  placeholder = "Selecionar",
  items,
  error,
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState<string | number>(value);

  const handleConfirm = () => {
    onValueChange(tempValue);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempValue(value); // Reset temp value
    setModalVisible(false);
  };

  // Format display text
  const getDisplayText = () => {
    if (!value) return placeholder;
    const selectedItem = items.find((item) => item.value === value);
    return selectedItem ? selectedItem.label : placeholder;
  };

  return (
    <View className="mb-4">
      <Text className="font-medium text-foreground mb-2">{label}</Text>
      <Pressable
        className={`border ${
          error ? "border-red-500" : "border-border"
        } bg-card rounded-md px-4 py-3 flex-row justify-between items-center`}
        onPress={() => setModalVisible(true)}
      >
        <Text className={value ? "text-foreground" : "text-muted-foreground"}>{getDisplayText()}</Text>
        <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
      </Pressable>

      {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={handleCancel}>
        <SafeAreaView className="flex-1 justify-end bg-black/50">
          <View className="bg-card p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-medium text-foreground">{label}</Text>
              <Pressable onPress={handleCancel}>
                <Feather name="x" size={24} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <View className="border border-border rounded-lg overflow-hidden mb-4">
              <Picker
                selectedValue={tempValue}
                onValueChange={(itemValue) => setTempValue(itemValue)}
                style={{
                  backgroundColor: colors.card,
                  color: colors.foreground,
                }}
              >
                {items.map((item) => (
                  <Picker.Item
                    key={item.value.toString()}
                    label={item.label}
                    value={item.value}
                    color={Platform.OS === "ios" ? colors.foreground : undefined}
                  />
                ))}
              </Picker>
            </View>

            <Button onPress={handleConfirm}>Confirmar</Button>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default CustomPicker;

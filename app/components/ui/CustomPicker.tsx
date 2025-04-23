// Update app/components/ui/CustomPicker.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Modal, Pressable, SafeAreaView, Platform, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";
import { Keyboard } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import Button from "./Button";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface CustomPickerProps {
  label: string;
  value: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  items: { label: string; value: string | number }[];
  error?: string;
  defaultScrollIndex?: number;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  value,
  onValueChange,
  placeholder = "Selecionar",
  items,
  error,
  defaultScrollIndex = 20, // Default to about 60kg for weight or 160cm for height
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState<string | number>(value);
  const [searchText, setSearchText] = useState("");

  const handleConfirm = () => {
    onValueChange(tempValue);
    setModalVisible(false);
    Keyboard.dismiss();
    setSearchText("");
    TextInput.State.blurTextInput(TextInput.State.currentlyFocusedInput());
  };

  const handleCancel = () => {
    setTempValue(value); // Reset temp value
    setModalVisible(false);
    setSearchText("");
  };

  // Format display text
  const getDisplayText = () => {
    if (!value) return placeholder;
    const selectedItem = items.find((item) => item.value === value);
    return selectedItem ? selectedItem.label : placeholder;
  };

  // Filter items based on search text
  const filteredItems = items.filter((item) => item.label.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <View className="mb-4">
      <Text className="font-medium text-foreground mb-2">{label}</Text>
      <Pressable
        className={`border ${
          error ? "border-red-500" : "border-border"
        } bg-card rounded-md px-4 py-3 flex-row justify-between items-center`}
        onPress={() => {
          // Dismiss keyboard before showing picker
          Keyboard.dismiss();
          // Small delay to ensure keyboard is fully dismissed
          setTimeout(() => {
            setModalVisible(true);
          }, 100);
        }}
      >
        <Text className={value ? "text-foreground" : "text-muted-foreground"}>{getDisplayText()}</Text>
        <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
      </Pressable>

      {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={handleCancel}>
        <SafeAreaView className="flex-1 justify-end bg-black/50">
          <Animated.View className="bg-card" entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="text-lg font-medium text-foreground">{label}</Text>
              <Pressable onPress={handleCancel}>
                <Feather name="x" size={24} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {/* Search input for large lists */}
            {items.length > 20 && (
              <View className="px-4 py-2">
                <View className="flex-row items-center bg-muted rounded-lg px-3 py-2">
                  <Feather name="search" size={16} color={colors.mutedForeground} />
                  <TextInput
                    className="ml-2 flex-1 text-foreground"
                    placeholder="Buscar..."
                    placeholderTextColor={colors.mutedForeground}
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                  {searchText ? (
                    <Pressable onPress={() => setSearchText("")}>
                      <Feather name="x" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            )}

            {Platform.OS === "ios" ? (
              // iOS uses the native picker wheel
              <View className="border-t border-border">
                <Picker
                  selectedValue={tempValue}
                  onValueChange={(itemValue) => setTempValue(itemValue)}
                  style={{
                    backgroundColor: colors.card,
                    color: colors.foreground,
                    height: 200,
                  }}
                  itemStyle={{ color: colors.foreground, fontSize: 18 }}
                >
                  {filteredItems.map((item) => (
                    <Picker.Item key={item.value.toString()} label={item.label} value={item.value} />
                  ))}
                </Picker>
              </View>
            ) : (
              // Android uses a scrollable list
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.value.toString()}
                initialScrollIndex={defaultScrollIndex}
                getItemLayout={(data, index) => ({
                  length: 50,
                  offset: 50 * index,
                  index,
                })}
                style={{ maxHeight: 300 }}
                renderItem={({ item }) => (
                  <Pressable
                    className={`py-3 px-4 ${item.value === tempValue ? "bg-primary/10" : ""}`}
                    onPress={() => setTempValue(item.value)}
                  >
                    <Text className={`${item.value === tempValue ? "text-primary font-medium" : "text-foreground"}`}>
                      {item.label}
                    </Text>
                  </Pressable>
                )}
              />
            )}

            <View className="p-4">
              <Button onPress={handleConfirm}>Confirmar</Button>
            </View>
          </Animated.View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default CustomPicker;

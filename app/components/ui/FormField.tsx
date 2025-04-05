// app/components/ui/FormField.tsx
import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

const FormField = ({ 
  label, 
  error, 
  hint, 
  className = '',
  ...props 
}: FormFieldProps) => {
  const { colors } = useTheme();
  
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="font-medium text-foreground mb-2">{label}</Text>
      
      <TextInput
        className={`border ${error ? 'border-red-500' : 'border-border'} bg-card text-foreground rounded-md px-3 py-2`}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
      
      {error ? (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-muted-foreground mt-1">{hint}</Text>
      ) : null}
    </View>
  );
};

export default FormField;
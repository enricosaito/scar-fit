// app/components/tracking/WeeklyActivity.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface DayData {
  date: Date;
  hasActivity: boolean;
  isToday: boolean;
  dayName: string;
  dayNumber: number;
}

interface WeeklyActivityProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  activityDates?: string[]; // Array of dates with activities (YYYY-MM-DD format)
}

const WeeklyActivity = ({ selectedDate, onDateSelect, activityDates = [] }: WeeklyActivityProps) => {
  const { colors } = useTheme();

  // Get the days of the current week
  const getDaysOfWeek = (): DayData[] => {
    const days: DayData[] = [];
    const today = new Date();
    const currentDate = new Date(selectedDate);

    // Get the start of the week (Monday)
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const dayNames = ["S", "T", "Q", "Q", "S", "S", "D"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const dateString = date.toISOString().split("T")[0];

      days.push({
        date,
        hasActivity: activityDates.includes(dateString),
        isToday: date.toDateString() === today.toDateString(),
        dayName: dayNames[i],
        dayNumber: date.getDate(),
      });
    }

    return days;
  };

  const days = getDaysOfWeek();
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  return (
    <View className="bg-card rounded-xl border border-border p-4 mb-6">
      <View className="flex-row justify-between">
        {days.map((day, index) => (
          <Pressable
            key={index}
            onPress={() => onDateSelect(day.date)}
            className={`items-center justify-center w-10 ${isSelected(day.date) ? "bg-primary/10 rounded-xl" : ""}`}
          >
            <Text
              className={`text-xs font-medium mb-1 ${
                isSelected(day.date) ? "text-primary" : day.isToday ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {day.dayName}
            </Text>

            <View
              className={`w-8 h-8 rounded-lg items-center justify-center mb-1 ${
                isSelected(day.date) ? "bg-primary" : day.isToday ? "border border-primary" : "border border-border"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected(day.date) ? "text-white" : day.isToday ? "text-primary" : "text-foreground"
                }`}
              >
                {day.dayNumber}
              </Text>
            </View>

            {/* Activity Indicator */}
            <View className="w-2 h-2 rounded-full mt-1">
              {day.hasActivity && <View className="w-full h-full rounded-full bg-green-500" />}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default WeeklyActivity;

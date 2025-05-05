// app/components/tracking/WeeklyActivity.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
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
  greeting?: string; // New prop for greeting text
}

const WeeklyActivity = ({ selectedDate, onDateSelect, activityDates = [], greeting }: WeeklyActivityProps) => {
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
    <View className="mb-6">
      {/* Greeting */}
      {greeting && (
        <Text className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "Caveat", marginLeft: 4 }}>
          {greeting}
        </Text>
      )}
      {/* Days of week as playful boxes */}
      <View className="flex-row justify-between mb-2 px-1">
        {days.map((day, index) => (
          <Pressable
            key={index}
            onPress={() => onDateSelect(day.date)}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 60,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: isSelected(day.date) ? colors.primary : colors.border,
              backgroundColor: isSelected(day.date)
                ? colors.primary + "22"
                : day.isToday
                ? colors.primary + "11"
                : colors.card,
              marginHorizontal: 2,
              shadowColor: isSelected(day.date) ? colors.primary : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: isSelected(day.date) ? 3 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: isSelected(day.date) ? colors.primary : day.isToday ? colors.primary : colors.mutedForeground,
                fontFamily: "Caveat",
              }}
            >
              {day.dayName}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: isSelected(day.date) ? colors.primary : day.isToday ? colors.primary : colors.foreground,
                fontFamily: "Caveat",
              }}
            >
              {day.dayNumber}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default WeeklyActivity;

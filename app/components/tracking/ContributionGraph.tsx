import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface ContributionGraphProps {
  activityData: string[]; // Array of YYYY-MM-DD strings with activity
  userId?: string;
  macros?: any;
}

// Helper to generate a range of dates (oldest to newest)
function getPastDates(numDays: number) {
  const dates: string[] = [];
  const today = new Date();
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// Helper to get color shade based on percent to goal
function getColor(percent: number, colors: any) {
  // 0 = lightest, 1 = darkest
  const shades = [
    colors.primary + "10", // 0-20%
    colors.primary + "33", // 20-40%
    colors.primary + "66", // 40-60%
    colors.primary + "99", // 60-80%
    colors.primary, // 80-100%
  ];
  if (percent >= 0.8) return shades[4];
  if (percent >= 0.6) return shades[3];
  if (percent >= 0.4) return shades[2];
  if (percent >= 0.2) return shades[1];
  return shades[0];
}

const NUM_DAYS = 31;
const FULL_ROWS = 4;
const DAYS_PER_ROW = 7;
const LAST_ROW_DAYS = NUM_DAYS - FULL_ROWS * DAYS_PER_ROW; // 3

const ContributionGraph: React.FC<ContributionGraphProps> = ({ activityData }) => {
  const { colors } = useTheme();
  // For demo: generate random percent-to-goal for each day
  const allDates = getPastDates(NUM_DAYS);
  const today = new Date().toISOString().split("T")[0];
  // Map: date -> percent (0-1)
  const percentByDate: Record<string, number> = {};
  allDates.forEach((date) => {
    // If in activityData, random percent; else 0
    percentByDate[date] = activityData.includes(date)
      ? Math.random() * 0.8 + 0.2 // 20%-100%
      : 0;
  });

  // Build grid: 4 rows of 7, 1 row of 3
  const grid: string[][] = [];
  let idx = 0;
  for (let row = 0; row < FULL_ROWS; row++) {
    grid.push(allDates.slice(idx, idx + DAYS_PER_ROW));
    idx += DAYS_PER_ROW;
  }
  grid.push(allDates.slice(idx)); // last row (3 days)

  return (
    <View className="items-center my-6">
      {/* Month label above the grid */}
      <View className="flex-row mb-1 w-full justify-between px-2">
        <Text className="text-xs text-muted-foreground">
          {new Date(allDates[0]).toLocaleString("pt-BR", { month: "short" })}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {new Date(allDates[NUM_DAYS - 1]).toLocaleString("pt-BR", { month: "short" })}
        </Text>
      </View>
      {/* 5-row grid */}
      <View>
        {grid.map((row, rowIdx) => (
          <View key={rowIdx} className="flex-row justify-center">
            {row.map((date) => (
              <View
                key={date}
                style={{
                  width: 14,
                  height: 14,
                  margin: 2,
                  borderRadius: 3,
                  backgroundColor: getColor(percentByDate[date], colors),
                  borderWidth: date === today ? 1.5 : 0,
                  borderColor: date === today ? colors.primary : undefined,
                }}
              />
            ))}
          </View>
        ))}
      </View>
      {/* Legend */}
      <View className="flex-row items-center mt-2">
        <Text className="text-xs text-muted-foreground mr-2">Menos</Text>
        {[0, 0.2, 0.4, 0.6, 0.8].map((p, i) => (
          <View
            key={i}
            style={{
              width: 14,
              height: 14,
              marginHorizontal: 1,
              borderRadius: 3,
              backgroundColor: getColor(p, colors),
            }}
          />
        ))}
        <Text className="text-xs text-muted-foreground ml-2">Mais</Text>
      </View>
    </View>
  );
};

export default ContributionGraph;

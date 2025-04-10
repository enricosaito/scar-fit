// app/utils/heightWeightValues.ts
// Height values from 140cm to 220cm
export const heightValues = Array.from({ length: 81 }, (_, i) => {
  const height = 140 + i;
  return {
    label: `${height} cm`,
    value: height.toString(),
  };
});

// Weight values from 40kg to 150kg
export const weightValues = Array.from({ length: 111 }, (_, i) => {
  const weight = 40 + i;
  return {
    label: `${weight} kg`,
    value: weight.toString(),
  };
});

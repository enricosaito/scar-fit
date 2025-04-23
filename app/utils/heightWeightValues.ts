// Update app/utils/heightWeightValues.ts
// Height values from 140cm to 220cm with defaults closer to 160cm
export const heightValues = Array.from({ length: 81 }, (_, i) => {
  const height = 140 + i;
  return {
    label: `${height} cm`,
    value: height.toString(),
  };
});

// Weight values from 40kg to 150kg with defaults closer to 60kg
export const weightValues = Array.from({ length: 111 }, (_, i) => {
  const weight = 40 + i;
  return {
    label: `${weight} kg`,
    value: weight.toString(),
  };
});

// Add default export
export default { heightValues, weightValues };
// app/screens/onboarding/utils/calculations.ts
import { Gender, ActivityLevel, Goal } from "../context/OnboardingContext";

/**
 * Calculate BMR (Basal Metabolic Rate) using the Mifflin-St Jeor formula
 * @param gender 'male' or 'female'
 * @param weight Weight in kg
 * @param height Height in cm
 * @param age Age in years
 * @returns BMR in calories
 */
export const calculateBMR = (gender: Gender, weight: string, height: string, age: string): number => {
  const numWeight = parseFloat(weight);
  const numHeight = parseFloat(height);
  const numAge = parseFloat(age);

  if (isNaN(numWeight) || isNaN(numHeight) || isNaN(numAge)) {
    return 0;
  }

  // Mifflin-St Jeor formula
  if (gender === "male") {
    return 10 * numWeight + 6.25 * numHeight - 5 * numAge + 5;
  } else {
    return 10 * numWeight + 6.25 * numHeight - 5 * numAge - 161;
  }
};

/**
 * Get activity multiplier based on activity level
 * @param activityLevel Activity level classification
 * @returns Activity multiplier factor
 */
export const getActivityMultiplier = (activityLevel: ActivityLevel): number => {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    extreme: 1.9, // Very hard exercise, physical job or 2x training
  };

  return multipliers[activityLevel] || 1.2;
};

/**
 * Get caloric adjustment based on fitness goal
 * @param goal User's fitness goal
 * @returns Caloric adjustment factor
 */
export const getGoalAdjustment = (goal: Goal): number => {
  const adjustments: Record<Goal, number> = {
    lose: 0.8, // 20% caloric deficit
    maintain: 1, // Maintenance calories
    gain: 1.15, // 15% caloric surplus
  };

  return adjustments[goal] || 1;
};

/**
 * Macro distribution results interface
 */
export interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Calculate macronutrient distribution based on TDEE and goal
 * @param tdee Total Daily Energy Expenditure in calories
 * @param weight Weight in kg
 * @param goal User's fitness goal
 * @returns Macro distribution in grams and calories
 */
export const calculateMacros = (tdee: number, weight: string, goal: Goal): MacroResult => {
  const numWeight = parseFloat(weight);

  if (isNaN(numWeight) || tdee <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  // Protein calculation based on goal
  let proteinMultiplier: number;
  switch (goal) {
    case "lose":
      proteinMultiplier = 2.4; // Higher protein for weight loss (preserve muscle)
      break;
    case "gain":
      proteinMultiplier = 2.0; // Slightly lower for bulking
      break;
    default:
      proteinMultiplier = 2.2; // Standard recommendation
  }

  // Calculate protein (g)
  const proteinGrams = Math.round(numWeight * proteinMultiplier);

  // Calculate protein calories (4 cal/g)
  const proteinCalories = proteinGrams * 4;

  // Fat percentage of total calories based on goal
  let fatPercentage: number;
  switch (goal) {
    case "lose":
      fatPercentage = 0.3; // 30% fat for satiety during weight loss
      break;
    case "maintain":
      fatPercentage = 0.25; // 25% fat for maintenance
      break;
    case "gain":
      fatPercentage = 0.2; // 20% fat for bulking (more carbs)
      break;
    default:
      fatPercentage = 0.25;
  }

  // Calculate fat calories and grams (9 cal/g)
  const fatCalories = tdee * fatPercentage;
  const fatGrams = Math.round(fatCalories / 9);

  // Remaining calories allocated to carbohydrates
  const remainingCalories = tdee - proteinCalories - fatCalories;

  // Calculate carbs (4 cal/g)
  const carbGrams = Math.round(remainingCalories / 4);

  return {
    calories: Math.round(tdee),
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
  };
};

/**
 * Calculate total calories and macros for display
 * @param formData User form data
 * @returns Complete macro calculation results
 */
export const calculateFullMacros = (formData: {
  gender: Gender;
  age: string;
  weight: string;
  height: string;
  activityLevel: ActivityLevel;
  goal: Goal;
}): {
  bmr: number;
  tdee: number;
  macros: MacroResult;
  activityMultiplier: number;
  goalAdjustment: number;
} => {
  // Calculate BMR
  const bmr = calculateBMR(formData.gender, formData.weight, formData.height, formData.age);

  // Calculate TDEE
  const activityMultiplier = getActivityMultiplier(formData.activityLevel);
  const tdee = bmr * activityMultiplier;

  // Apply goal adjustment
  const goalAdjustment = getGoalAdjustment(formData.goal);
  const adjustedTdee = tdee * goalAdjustment;

  // Calculate macros
  const macros = calculateMacros(adjustedTdee, formData.weight, formData.goal);

  return {
    bmr,
    tdee,
    macros,
    activityMultiplier,
    goalAdjustment,
  };
};

export default {
  calculateBMR,
  getActivityMultiplier,
  getGoalAdjustment,
  calculateMacros,
  calculateFullMacros,
};

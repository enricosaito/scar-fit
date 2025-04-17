// app/utils/seedFoods.ts

import { supabase } from "../lib/supabase";

// Common foods with nutritional information
const commonFoods = [
  {
    description: "Arroz branco cozido",
    category: "Cereais",
    kcal: 130,
    protein_g: 2.7,
    carbs_g: 28.2,
    fat_g: 0.3,
  },
  {
    description: "Feijão carioca cozido",
    category: "Leguminosas",
    kcal: 77,
    protein_g: 5.1,
    carbs_g: 13.6,
    fat_g: 0.5,
  },
  {
    description: "Frango grelhado (peito)",
    category: "Carnes",
    kcal: 165,
    protein_g: 31,
    carbs_g: 0,
    fat_g: 3.6,
  },
  {
    description: "Omelete com queijo",
    category: "Ovos",
    kcal: 210,
    protein_g: 14,
    carbs_g: 1.5,
    fat_g: 16,
  },
  {
    description: "Ovo frito",
    category: "Ovos",
    kcal: 90,
    protein_g: 6.3,
    carbs_g: 0.4,
    fat_g: 7,
  },
  {
    description: "Pão francês",
    category: "Pães",
    kcal: 300,
    protein_g: 8,
    carbs_g: 58,
    fat_g: 3,
  },
  {
    description: "Queijo mussarela",
    category: "Laticínios",
    kcal: 280,
    protein_g: 21,
    carbs_g: 2,
    fat_g: 22,
  },
  {
    description: "Banana",
    category: "Frutas",
    kcal: 89,
    protein_g: 1.1,
    carbs_g: 22.8,
    fat_g: 0.3,
  },
  {
    description: "Maçã",
    category: "Frutas",
    kcal: 52,
    protein_g: 0.3,
    carbs_g: 14,
    fat_g: 0.2,
  },
  {
    description: "Alface",
    category: "Vegetais",
    kcal: 15,
    protein_g: 1.4,
    carbs_g: 2.9,
    fat_g: 0.2,
  },
  {
    description: "Batata cozida",
    category: "Vegetais",
    kcal: 86,
    protein_g: 1.8,
    carbs_g: 20.1,
    fat_g: 0.1,
  },
  {
    description: "Leite integral",
    category: "Laticínios",
    kcal: 61,
    protein_g: 3.2,
    carbs_g: 4.8,
    fat_g: 3.3,
  },
  {
    description: "Iogurte natural",
    category: "Laticínios",
    kcal: 59,
    protein_g: 3.5,
    carbs_g: 4.7,
    fat_g: 3.3,
  },
  {
    description: "Macarrão cozido",
    category: "Cereais",
    kcal: 158,
    protein_g: 5.8,
    carbs_g: 30.9,
    fat_g: 0.9,
  },
  {
    description: "Carne moída",
    category: "Carnes",
    kcal: 250,
    protein_g: 26,
    carbs_g: 0,
    fat_g: 16,
  },
];

// Function to seed the database with common foods
export async function seedFoods() {
  try {
    console.log("Starting to seed foods...");

    // Get current foods to avoid duplicates
    const { data: existingFoods, error: fetchError } = await supabase.from("foods").select("description");

    if (fetchError) {
      console.error("Error fetching existing foods:", fetchError);
      return false;
    }

    // Create an array of existing food descriptions
    const existingDescriptions = existingFoods?.map((food) => food.description.toLowerCase()) || [];

    // Filter out foods that already exist
    const newFoods = commonFoods.filter((food) => !existingDescriptions.includes(food.description.toLowerCase()));

    if (newFoods.length === 0) {
      console.log("No new foods to add, database already has all common foods");
      return true;
    }

    // Insert new foods
    const { data, error } = await supabase.from("foods").insert(newFoods).select();

    if (error) {
      console.error("Error inserting foods:", error);
      return false;
    }

    console.log(`Successfully added ${data?.length} new foods to database`);
    return true;
  } catch (error) {
    console.error("Error seeding foods:", error);
    return false;
  }
}

export default { seedFoods, commonFoods };

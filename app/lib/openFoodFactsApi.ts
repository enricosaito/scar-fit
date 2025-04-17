// app/lib/openFoodFactsApi.ts
/**
 * Service for interacting with the OpenFoodFacts API
 */

// OpenFoodFacts API base URL
const API_BASE_URL = "https://world.openfoodfacts.org/api/v0";

// Product nutriments interface
export interface Nutriments {
  energy_kcal: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugars?: number;
  sodium?: number;
}

// Product interface
export interface Product {
  code: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  ingredients_text?: string;
  categories?: string;
  nutriments: Nutriments;
}

/**
 * Fetch product information by barcode
 * @param barcode Product barcode (EAN, UPC, etc.)
 * @returns Product information
 */
export const fetchProductByBarcode = async (barcode: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/${barcode}.json`);

    if (!response.ok) {
      throw new Error(`OpenFoodFacts API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 1) {
      throw new Error("Product not found");
    }

    const productData = data.product;

    // Extract and normalize nutriments
    const nutriments: Nutriments = {
      energy_kcal:
        productData.nutriments["energy-kcal_100g"] ||
        (productData.nutriments["energy_100g"] ? productData.nutriments["energy_100g"] / 4.184 : 0),
      proteins: productData.nutriments.proteins_100g || 0,
      carbohydrates: productData.nutriments.carbohydrates_100g || 0,
      fat: productData.nutriments.fat_100g || 0,
      fiber: productData.nutriments.fiber_100g || 0,
      sugars: productData.nutriments.sugars_100g || 0,
      sodium: productData.nutriments.sodium_100g || 0,
    };

    // Map to our Product interface
    return {
      code: productData.code,
      product_name: productData.product_name || productData.product_name_en || "Unknown Product",
      brands: productData.brands,
      image_url: productData.image_url || productData.image_front_url,
      ingredients_text: productData.ingredients_text,
      categories: productData.categories,
      nutriments: nutriments,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export default {
  fetchProductByBarcode,
};

export const foodEmojiMap: { [key: string]: string } = {
  // Cereais e derivados
  "Arroz branco": "🍚",
  "Arroz integral": "🍚",
  "Aveia": "🌾",
  "Cereal matinal": "🥣",
  "Farinha de trigo": "🌾",
  "Pão francês": "🥖",
  "Pão integral": "🍞",
  "Macarrão": "🍝",
  "Biscoito": "🍪",
  
  // Verduras, hortaliças e derivados
  "Alface": "🥬",
  "Brócolis": "🥦",
  "Cenoura": "🥕",
  "Tomate": "🍅",
  "Batata": "🥔",
  "Cebola": "🧅",
  "Alho": "🧄",
  
  // Frutas e derivados
  "Maçã": "🍎",
  "Banana": "🍌",
  "Laranja": "🍊",
  "Manga": "🥭",
  "Melancia": "🍉",
  "Uva": "🍇",
  "Abacaxi": "🍍",
  
  // Gorduras e óleos
  "Azeite de oliva": "🫒",
  "Manteiga": "🧈",
  "Margarina": "🧈",
  
  // Pescados e frutos do mar
  "Salmão": "🐟",
  "Atum": "🐟",
  "Camarão": "🦐",
  "Ostra": "🦪",
  
  // Carnes e derivados
  "Frango": "🍗",
  "Carne bovina": "🥩",
  "Carne suína": "🥓",
  "Presunto": "🥓",
  
  // Leite e derivados
  "Leite": "🥛",
  "Queijo": "🧀",
  "Iogurte": "🥛",
  
  // Bebidas
  "Café": "☕",
  "Chá": "🫖",
  "Suco de laranja": "🧃",
  "Refrigerante": "🥤",
  "Cerveja": "🍺",
  "Vinho": "🍷",
  
  // Ovos e derivados
  "Ovo": "🥚",
  
  // Produtos açucarados
  "Chocolate": "🍫",
  "Bolo": "🍰",
  "Sorvete": "🍦",
  
  // Miscelâneas
  "Sal": "🧂",
  "Açúcar": "🍬",
  
  // Alimentos preparados
  "Pizza": "🍕",
  "Hambúrguer": "🍔",
  "Sushi": "🍣",
  
  // Leguminosas e derivados
  "Feijão": "🫘",
  "Lentilha": "🫘",
  "Grão de bico": "🫘",
  
  // Nozes e sementes
  "Amendoim": "🥜",
  "Castanha": "🌰",
  "Nozes": "🌰"
};

export const getFoodEmoji = (foodName: string): string => {
  return foodEmojiMap[foodName] || "🍽️";
}; 
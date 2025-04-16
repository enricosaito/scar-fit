// app/screens/admin/debug.tsx

import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Button from "../../components/ui/Button";
import { seedFoods } from "../../utils/seedFoods";
import { supabase } from "../../lib/supabase";

export default function DebugScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [foodCount, setFoodCount] = useState<number | null>(null);

  useEffect(() => {
    // Check food count on mount
    getFoodCount();
  }, []);

  const getFoodCount = async () => {
    try {
      const { count, error } = await supabase.from("foods").select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error getting food count:", error);
      } else {
        setFoodCount(count);
      }
    } catch (error) {
      console.error("Error in getFoodCount:", error);
    }
  };

  const handleSeedFoods = async () => {
    setLoading(true);
    setMessage("");

    try {
      const success = await seedFoods();

      if (success) {
        setMessage("Alimentos adicionados com sucesso!");
        // Update food count
        getFoodCount();
      } else {
        setMessage("Erro ao adicionar alimentos");
      }
    } catch (error) {
      console.error("Error seeding foods:", error);
      setMessage("Erro ao adicionar alimentos: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleTestSearch = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Test search for "omelete"
      const { data, error } = await supabase.from("foods").select("*").ilike("description", "%omelete%");

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setMessage(
          `Encontrado(s) ${data.length} alimento(s) contendo "omelete":\n${data
            .map((food) => food.description)
            .join("\n")}`
        );
      } else {
        setMessage('Nenhum alimento encontrado contendo "omelete"');
      }
    } catch (error) {
      console.error("Error testing search:", error);
      setMessage("Erro ao testar busca: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Function to clear foods table - BE CAREFUL!
  const handleClearFoods = async () => {
    Alert.alert("Atenção!", "Isso irá remover TODOS os alimentos da base de dados. Essa ação não pode ser desfeita!", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Remover todos",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            const { error } = await supabase.from("foods").delete().neq("id", 0); // This will delete all rows

            if (error) {
              throw error;
            }

            setMessage("Todos os alimentos foram removidos!");
            setFoodCount(0);
          } catch (error) {
            console.error("Error clearing foods:", error);
            setMessage("Erro ao limpar alimentos: " + (error instanceof Error ? error.message : String(error)));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-medium flex-1 text-center text-foreground mr-8">Modo de Depuração</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-card rounded-xl border border-border p-4 mb-6">
          <Text className="text-xl font-bold text-foreground mb-2">Banco de Dados de Alimentos</Text>
          <Text className="text-muted-foreground mb-4">
            Total de alimentos: {foodCount !== null ? foodCount : "Carregando..."}
          </Text>

          <Button className="mb-4" onPress={handleSeedFoods} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="white" /> : "Adicionar Alimentos Comuns"}
          </Button>

          <Button className="mb-4" onPress={handleTestSearch} disabled={loading} variant="outline">
            Testar Busca por "Omelete"
          </Button>

          <Button onPress={handleClearFoods} disabled={loading} className="bg-red-500">
            Remover Todos os Alimentos
          </Button>
        </View>

        {message ? (
          <View className="bg-card rounded-xl border border-border p-4 mb-6">
            <Text className="text-lg font-bold text-foreground mb-2">Resultado:</Text>
            <Text className="text-foreground">{message}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

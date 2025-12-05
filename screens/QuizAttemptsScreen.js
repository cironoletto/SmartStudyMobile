// screens/QuizAttemptsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Button,
} from "react-native";
import { getQuizAttempts, startQuizAttempt } from "../utils/api";

export default function QuizAttemptsScreen({ route, navigation }) {
  const { quizID } = route.params;

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const res = await getQuizAttempts(quizID);  // <-- NOME API GIUSTO
      setAttempts(res.data);
    } catch (err) {
      console.log("Errore caricamento tentativi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      const res = await startQuizAttempt(quizID);
      const attemptID = res.data.attemptID;

      navigation.navigate("QuizAttempt", {
        quizID,
        attemptID,
      });
    } catch (err) {
      console.log("Errore nuovo tentativo:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Caricamento tentativi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Nuovo tentativo" onPress={handleRetry} />

      <FlatList
        style={{ marginTop: 16 }}
        data={attempts}
        keyExtractor={(item) => item.AttemptID?.toString() ?? Math.random().toString()} // <- evita crash
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>
              Tentativo #{item.AttemptID} - {item.IsPassed ? "OK" : "NO"}
            </Text>

            <Text>
              Punteggio: {item.Score}/{item.MaxScore}
            </Text>

            <Text>
              Data:{" "}
              {item.StartedAt
                ? new Date(item.StartedAt).toLocaleString()
                : "N/D"}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>Nessun tentativo ancora.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, padding: 16 },
  item: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f4f4f4",
    marginBottom: 10,
  },
  itemTitle: { fontWeight: "bold", marginBottom: 4 },
});

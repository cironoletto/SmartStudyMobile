import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";

export default function StudyOralTopicScreen({ route, navigation }) {
  const sessionID = route?.params?.sessionID;
  const summary = route?.params?.summary;

  if (!sessionID || !summary) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
          Errore dati orali
        </Text>
        <Text>Manca sessionID o summary. Torna indietro.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Modalità Orale</Text>

      <Text style={styles.subtitle}>
        Leggi attentamente il riassunto generato dall’AI.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Riassunto del contenuto:</Text>
        <Text style={styles.summary}>{summary}</Text>
      </View>

      <Text style={styles.instructions}>
        Ora spiega con parole tue ciò che hai capito.
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() =>
          navigation.navigate("StudyOralRecord", { sessionID, summary })
        }
      >
        <Text style={styles.btnText}>🎤 Inizia Registrazione</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 6 },
  subtitle: { opacity: 0.8, marginBottom: 16 },
  card: {
    backgroundColor: "#121212",
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  summary: { color: "#ccc", lineHeight: 22 },
  instructions: { marginBottom: 20, lineHeight: 22, fontSize: 15 },
  btn: {
    backgroundColor: "#1DB954",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#000", fontWeight: "bold", fontSize: 18 },
});

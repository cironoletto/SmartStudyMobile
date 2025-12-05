import React, { useEffect, useState } from "react";
import {
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../utils/api";
import { shareWhatsapp } from "../utils/share";

export default function StudyOralResultScreen({ route, navigation }) {
  const sessionID = route?.params?.sessionID;
  const audioUri = route?.params?.audioUri;
  const summary = route?.params?.summary;

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [transcript, setTranscript] = useState("");
  const [idealText, setIdealText] = useState(summary || "");
  const [score, setScore] = useState(null);

  const [sound, setSound] = useState(null);

  useEffect(() => {
    if (!sessionID || !audioUri) {
      Alert.alert("Errore", "Parametri mancanti.");
      return;
    }
    sendEvaluation();
  }, []);

  const sendEvaluation = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("sessionID", sessionID);
      formData.append("summary", summary);
      formData.append("audio", {
        uri: audioUri,
        type: "audio/mp4",
        name: "oral_recording.m4a",
      });

      const res = await axios.post(`${API_URL}/study/evaluate-oral`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setTranscript(res.data.transcript || "");
      setFeedback(res.data.feedback || "");
      setScore(res.data.score ?? null);
    } catch (err) {
      console.log("❌ evaluate error:", err);
      Alert.alert("Errore", "Valutazione non riuscita");
    }

    setLoading(false);
  };

  const playAudio = async () => {
    try {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      console.log("Errore audio:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Valutazione Orale Completa</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 40 }} />
      ) : (
        <>
          {score !== null && (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Punteggio</Text>
              <Text style={styles.scoreValue}>{score}/100</Text>
            </View>
          )}

          <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
            <Text style={styles.audioText}>▶️ Riascolta</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Testo Ideale (AI)</Text>
            <Text style={styles.text}>{idealText}</Text>
          </View>

          {transcript ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Trascrizione</Text>
              <Text style={styles.text}>{transcript}</Text>
            </View>
          ) : (
            <Text style={{ color: "#999" }}>Trascrizione non disponibile</Text>
          )}

          <View style={styles.cardFeedback}>
            <Text style={styles.cardTitle}>Feedback</Text>
            <Text style={styles.text}>{feedback}</Text>
          </View>

          <TouchableOpacity style={styles.whatsappBtn} onPress={() => shareWhatsapp(feedback)}>
            <Text style={styles.whatsappText}>📤 Invia Feedback su WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate("StudyHome")}
          >
            <Text style={styles.backText}>Torna allo Studio</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  scoreBox: {
    backgroundColor: "#1DB95422",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  scoreLabel: { color: "#1DB954", fontSize: 16, fontWeight: "600" },
  scoreValue: { fontSize: 40, fontWeight: "bold", color: "#1DB954" },
  audioBtn: {
    backgroundColor: "#1DB954",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  audioText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  card: {
    backgroundColor: "#121212",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },
  cardFeedback: {
    backgroundColor: "#181818",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },
  cardTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  text: { color: "#ddd", lineHeight: 22 },
  whatsappBtn: {
    backgroundColor: "#25D366",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  whatsappText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  backBtn: {
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  backText: { color: "#fff" },
});

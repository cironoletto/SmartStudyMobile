import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { Audio } from "expo-audio";
import i18n from "../locales/i18n";
import { evaluateOral } from "../utils/api";

export default function OralPracticeScreen({ route }) {
  const { originalText, summary, subjectType } = route.params;

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.log("Recording start error:", err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      const uri = recording.getURI();
      console.log("Recorded audio URI:", uri);

      await sendForEvaluation(uri);
    } catch (err) {
      console.log("Recording stop error:", err);
    }
  };

  const sendForEvaluation = async (audioUri) => {
    try {
      setLoading(true);
      setFeedback(null);

      // In produzione: caricare il file su backend/storage e passare l'URL
      const payload = {
        originalText,
        summary,
        subjectType,
        audioUrl: audioUri, // per ora URI locale, da adattare sul backend
      };

      const res = await evaluateOral(payload);
      setFeedback(res.data);
    } catch (err) {
      console.log("EVALUATE ERROR:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.title}>🎤 Valutazione esposizione orale</Text>

      <Text style={styles.desc}>
        Leggi ad alta voce il riassunto o esponi con parole tue. Al termine, riceverai un feedback sulla tua esposizione.
      </Text>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Suggerimento di riassunto</Text>
        <Text style={styles.blockText}>{summary}</Text>
      </View>

      <View style={styles.buttons}>
        {!isRecording ? (
          <TouchableOpacity style={[styles.btn, styles.btnRec]} onPress={startRecording}>
            <Text style={styles.btnText}>⏺ Inizia registrazione</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnStop]} onPress={stopRecording}>
            <Text style={styles.btnText}>⏹ Ferma e invia</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator />
          <Text style={{ textAlign: "center", marginTop: 8 }}>
            Analisi in corso...
          </Text>
        </View>
      )}

      {feedback && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Valutazione</Text>
          {feedback.score && (
            <Text style={styles.blockText}>Punteggio: {feedback.score}/10</Text>
          )}
          {feedback.strengths && (
            <Text style={styles.blockText}>Punti di forza: {feedback.strengths}</Text>
          )}
          {feedback.weaknesses && (
            <Text style={styles.blockText}>Da migliorare: {feedback.weaknesses}</Text>
          )}
          {feedback.suggestions && (
            <Text style={styles.blockText}>Suggerimenti: {feedback.suggestions}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  desc: { fontSize: 14, marginBottom: 12 },
  block: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  blockText: {
    fontSize: 14,
  },
  buttons: {
    marginVertical: 10,
  },
  btn: {
    padding: 12,
    borderRadius: 8,
  },
  btnRec: {
    backgroundColor: "#dc2626",
  },
  btnStop: {
    backgroundColor: "#16a34a",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { Audio } from "expo-av";
import { getStudySessions, setSessionRating } from "../utils/api";

export default function StudyHistoryScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    loadHistory();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const loadHistory = async () => {
    try {
      const res = await getStudySessions();
      setSessions(res.data || []);
    } catch (err) {
      console.log("Errore caricamento history:", err);
    }
    setLoading(false);
  };

  /* -----------------------------------------------------
     ⭐ SALVA RATING
  ----------------------------------------------------- */
  const updateRating = async (sessionID, rating) => {
    try {
      await setSessionRating(sessionID, rating);
      loadHistory();
    } catch (err) {
      console.log("Errore rating:", err);
    }
  };

  /* -----------------------------------------------------
     ▶️ RIPRODUZIONE AUDIO
  ----------------------------------------------------- */
  const playAudio = async (audioUrl, sessionID) => {
    try {
      if (!audioUrl) return;

      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: audioUrl.startsWith("http")
          ? audioUrl
          : `http://192.168.1.29:4000${audioUrl}`,
      });

      setSound(newSound);
      setPlayingId(sessionID);

      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setPlayingId(null);
      });
    } catch (err) {
      console.log("Errore riproduzione audio:", err);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setPlayingId(null);
    }
  };

  /* -----------------------------------------------------
     LOADING
  ----------------------------------------------------- */
  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  /* -----------------------------------------------------
     UI PRINCIPALE
  ----------------------------------------------------- */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cronologia Studio</Text>

      {sessions.map((s) => (
        <View key={s.sessionID} style={styles.card}>

          {/* INTESTAZIONE */}
          <View style={styles.headerRow}>
            <Text style={styles.subject}>{s.subject || "Nessun soggetto"}</Text>

            <Text style={styles.modeTag}>
              {s.type === "summary" && "Riassunto 📘"}
              {s.type === "scientific" && "Scientifica 🔬"}
              {s.type === "oral" && "Orale 🎤"}
            </Text>
          </View>

          <Text style={styles.date}>
            {new Date(s.createdAt).toLocaleString()}
          </Text>

          {/* RATING */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => updateRating(s.sessionID, n)}
              >
                <Text
                  style={{
                    fontSize: 24,
                    color: n <= (s.rating || 0) ? "#FFD700" : "#555",
                  }}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AUDIO ELEVENLABS */}
          {s.audioUrl ? (
            <TouchableOpacity
              style={styles.audioBtn}
              onPress={() =>
                playingId === s.sessionID
                  ? stopAudio()
                  : playAudio(s.audioUrl, s.sessionID)
              }
            >
              <Text style={styles.audioBtnText}>
                {playingId === s.sessionID ? "⏹ Stop" : "🎧 Ascolta Audio"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noAudio}>Nessun audio disponibile</Text>
          )}

          {/* DETTAGLI */}
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() =>
              navigation.navigate("StudyDetail", { sessionID: s.sessionID })
            }
          >
            <Text style={styles.detailsBtnText}>Apri Dettagli →</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

/* -----------------------------------------------------
   STILI — Spotify Style
----------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#181818",
    padding: 18,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#262626",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subject: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },

  modeTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#1DB954",
    borderRadius: 8,
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },

  date: {
    marginTop: 6,
    marginBottom: 10,
    color: "#888",
    fontSize: 12,
  },

  starRow: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 6,
  },

  audioBtn: {
    backgroundColor: "#1DB954",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  audioBtnText: {
    color: "#000",
    fontWeight: "bold",
  },
  noAudio: {
    color: "#666",
    marginBottom: 14,
  },

  detailsBtn: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  detailsBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Share,
  Alert,
  useColorScheme,
} from "react-native";

import { Audio } from "expo-av";
import { getStudySession } from "../utils/api";

export default function StudyDetailScreen({ route, navigation }) {
  const { sessionID } = route.params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#000" : "#f5f5f5";
  const cardBg = isDark ? "#111" : "#fff";
  const textColor = isDark ? "#fff" : "#000";
  const muted = isDark ? "#999" : "#666";

  /* -------------------------------------- */
  useEffect(() => {
    load();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const load = async () => {
    try {
      const res = await getStudySession(sessionID);
      setData(res.data);
    } catch (err) {
      console.log("Errore details:", err);
      Alert.alert("Errore", "Impossibile caricare i dettagli");
    }
    setLoading(false);
  };

  /* -------------------------------------- */
  const playAudio = async () => {
    try {
      if (!data.audioUrl) return;
      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: data.audioUrl.startsWith("http")
          ? data.audioUrl
          : `http://192.168.1.29:4000${data.audioUrl}`,
      });

      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setIsPlaying(false);
      });
    } catch (err) {
      console.log("Errore riproduzione:", err);
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  /* -------------------------------------- */
  const shareText = async () => {
    let toShare = "";

    if (data.type === "scientific") {
      toShare =
        (data.solutionSteps || "") +
        "\n\nRisposta finale: " +
        (data.finalAnswer || "");
    } else {
      toShare = data.summary || "";
    }

    try {
      await Share.share({ message: toShare });
    } catch (err) {
      console.log("Errore share:", err);
    }
  };

  /* -------------------------------------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: textColor }}>Nessun dato trovato</Text>
      </View>
    );
  }

  /* -------------------------------------- */
  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: bg }]}
    >
      <Text style={[styles.title, { color: textColor }]}>
        Dettagli Sessione
      </Text>

      <View style={[styles.card, { backgroundColor: cardBg }]}>

        {/* HEADER */}
        <Text style={[styles.subject, { color: textColor }]}>
          {data.subject || "Nessun soggetto"}
        </Text>

        <Text style={[styles.type, { color: muted }]}>
          Modalità: {data.type}
        </Text>

        <Text style={[styles.date, { color: muted }]}>
          {new Date(data.createdAt).toLocaleString()}
        </Text>

        {/* TIMELINE */}
        <View style={styles.timelineBox}>
          <Text style={styles.timelineTitle}>⏳ Timeline</Text>

          <Text style={styles.timelineItem}>📷 OCR testo acquisito</Text>

          {data.type === "summary" && (
            <Text style={styles.timelineItem}>🧠 Riassunto generato</Text>
          )}

          {data.type === "scientific" && (
            <Text style={styles.timelineItem}>🔬 Problema risolto</Text>
          )}

          {data.audioUrl && (
            <Text style={styles.timelineItem}>🎧 Audio ElevenLabs creato</Text>
          )}
        </View>

        {/* AUDIO PLAYER */}
        {data.audioUrl ? (
          <View style={styles.audioRow}>
            {!isPlaying ? (
              <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
                <Text style={styles.audioBtnText}>▶️ Play</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.audioBtn} onPress={pauseAudio}>
                <Text style={styles.audioBtnText}>⏸ Pausa</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.audioBtn} onPress={stopAudio}>
              <Text style={styles.audioBtnText}>⏹ Stop</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.noAudio, { color: muted }]}>
            Nessun audio disponibile
          </Text>
        )}

        {/* CONTENT */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Contenuto generato
        </Text>

        <ScrollView style={styles.textScroll} nestedScrollEnabled>
          {data.type === "scientific" ? (
            <Text style={[styles.summaryText, { color: textColor }]}>
              {data.solutionSteps}
              {data.finalAnswer
                ? `\n\nRISPOSTA FINALE: ${data.finalAnswer}`
                : ""}
            </Text>
          ) : (
            <Text style={[styles.summaryText, { color: textColor }]}>
              {data.summary || "Nessun contenuto"}
            </Text>
          )}
        </ScrollView>

        {/* SHARE */}
        <TouchableOpacity style={styles.shareBtn} onPress={shareText}>
          <Text style={styles.shareBtnText}>📤 Condividi contenuto</Text>
        </TouchableOpacity>

        {/* BACK */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>⬅ Torna alla cronologia</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ------------------ STILI ------------------ */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    padding: 20,
    borderRadius: 16,
  },

  subject: {
    fontSize: 22,
    fontWeight: "bold",
  },
  type: {
    fontSize: 14,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 15,
  },

  /* TIMELINE */
  timelineBox: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  timelineTitle: {
    color: "#1DB954",
    fontWeight: "bold",
    marginBottom: 6,
  },
  timelineItem: {
    color: "#ccc",
    fontSize: 14,
  },

  /* AUDIO */
  audioRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  audioBtn: {
    backgroundColor: "#1DB954",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  audioBtnText: {
    color: "black",
    fontWeight: "bold",
  },
  noAudio: {
    marginBottom: 20,
  },

  /* CONTENT */
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  textScroll: {
    maxHeight: 260,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#00000020",
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 22,
  },

  /* SHARE */
  shareBtn: {
    backgroundColor: "#1DB954",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  shareBtnText: {
    color: "#000",
    fontWeight: "bold",
  },

  /* BACK */
  backBtn: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  backBtnText: {
    color: "white",
    fontWeight: "600",
  },
});

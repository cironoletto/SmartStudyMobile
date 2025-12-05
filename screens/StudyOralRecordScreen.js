import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";

export default function StudyOralRecordScreen({ route, navigation }) {
  const sessionID = route?.params?.sessionID;
  const summary = route?.params?.summary;

  if (!sessionID) console.log("⚠ route.params MANCANTI in Record!");

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return Alert.alert("Permesso negato", "Abilita il microfono");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);

      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.log("Errore avvio registrazione:", err);
      Alert.alert("Errore", "Impossibile avviare la registrazione");
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      clearInterval(timerRef.current);
      setIsRecording(false);

      navigation.navigate("StudyOralResult", {
        sessionID,
        summary,
        audioUri: uri,
      });
    } catch (err) {
      console.log("Errore stop registrazione:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registra la tua risposta orale</Text>

      <View
        style={[
          styles.micCircle,
          { backgroundColor: isRecording ? "#1DB954" : "#333" },
        ]}
      >
        <Text style={styles.micIcon}>🎤</Text>
      </View>

      <Text style={styles.timer}>
        {String(Math.floor(seconds / 60)).padStart(2, "0")}:
        {String(seconds % 60).padStart(2, "0")}
      </Text>

      {!isRecording ? (
        <TouchableOpacity style={styles.btn} onPress={startRecording}>
          <Text style={styles.btnText}>▶️ Inizia Registrazione</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.btnStop} onPress={stopRecording}>
          <Text style={styles.btnText}>⏹ Ferma e Invia</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  micIcon: { fontSize: 50 },
  timer: { fontSize: 24, marginBottom: 20 },
  btn: {
    backgroundColor: "#1DB954",
    padding: 14,
    borderRadius: 12,
  },
  btnStop: { backgroundColor: "#e63946", padding: 14, borderRadius: 12 },
  btnText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
});

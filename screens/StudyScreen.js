// screens/StudyScreen.js
// screens/StudyScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  useColorScheme,
  Modal,
  Pressable,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Progress from "react-native-progress";
import * as Speech from "expo-speech";
import * as Clipboard from "expo-clipboard";

import Animated, { 
  useAnimatedStyle,
  withTiming,
  withSpring,
  useSharedValue
} from "react-native-reanimated";


import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { uploadStudyImages } from "../utils/api";
import { shareUniversal, shareWhatsapp, shareEmail } from "../utils/share";

/* -------------------------------------------------------
   🔄 CONVERSIONE HEIC → JPEG
-------------------------------------------------------- */
async function convertToJpegIfNeeded(asset) {
  let { uri, mimeType } = asset;

  const isHeic =
    uri?.toLowerCase().endsWith(".heic") ||
    mimeType === "image/heic" ||
    mimeType === "image/heif";

  if (!isHeic) {
    return {
      uri,
      name: asset.fileName || "image.jpg",
      type: "image/jpeg",
    };
  }

  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
  );

  return {
    uri: manipResult.uri,
    name: "converted.jpg",
    type: "image/jpeg",
  };
}

/* -------------------------------------------------------
   📘 SCREEN PRINCIPALE
-------------------------------------------------------- */
export default function StudyScreen({ route, navigation }) {
  const initialMode = route?.params?.mode || "summary";

  const [mode, setMode] = useState(initialMode);
  const [images, setImages] = useState([]);
  const [finalText, setFinalText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

const translateY = useSharedValue(300);


  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#121212" : "#fafafa";
  const cardBg = isDark ? "#181818" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const border = isDark ? "#333" : "#e5e5e5";
  const accent = "#1DB954";

  // Animazioni bottom sheet
  const openSheet = () => {
    setBottomSheetVisible(true);
    translateY.value = withSpring(0, { damping: 18 });
  };

  const closeSheet = () => {
    translateY.value = withTiming(300, { duration: 260 });
    setTimeout(() => setBottomSheetVisible(false), 260);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  /* CAMBIO MODE */
  useEffect(() => {
    if (route?.params?.mode) {
      setMode(route.params.mode);
    }
  }, [route?.params?.mode]);

  /* -----------------------------------------------
     📸 PICKER FOTO
  ------------------------------------------------ */
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImages((old) => [...old, ...result.assets]);
      }
    } catch (err) {
      console.log("Errore galleria:", err);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        setImages((old) => [...old, ...result.assets]);
      }
    } catch (err) {
      console.log("Errore fotocamera:", err);
    }
  };

  /* -----------------------------------------------
     📤 UPLOAD E ANALISI
  ------------------------------------------------ */
  const uploadHandler = async () => {
    if (images.length === 0)
      return Alert.alert("Errore", "Seleziona almeno una foto");

    setUploading(true);
    setProgress(0);
    setFinalText("");

    try {
      const converted = [];

      for (let img of images) {
        const c = await convertToJpegIfNeeded(img);
        converted.push(c);
      }

      const res = await uploadStudyImages(converted, mode, (p) => setProgress(p));
      const data = res.data || {};

      /* ORALE */
      if (mode === "oral") {
        setUploading(false);
        return navigation.navigate("StudyOralTopic", {
          sessionID: data.sessionID,
          summary: data.summary,
        });
      }

      /* SUMMARY / SCIENTIFIC */
      let displayText = "";

      if (mode === "scientific") {
        const steps = data.solutionSteps || "";
        const finalAnswer = data.finalAnswer
          ? `\n\nRisposta finale: ${data.finalAnswer}`
          : "";
        displayText = (steps + finalAnswer).trim();
        if (!displayText) displayText = data.text || "";
      } else {
        displayText = data.summary || data.text || "";
      }

      setFinalText(displayText);
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      Alert.alert("Errore", err.message || "Errore durante l'upload");
    } finally {
      setUploading(false);
    }
  };

  /* -----------------------------------------------
     🔊 LETTURA / COPIA / RESET
  ------------------------------------------------ */
  const speakText = () => finalText && Speech.speak(finalText, { language: "it-IT" });
  const stopSpeaking = () => Speech.stop();

  const copyToClipboard = async () => {
    if (!finalText) return;
    await Clipboard.setStringAsync(finalText);
    Alert.alert("Copiato", "Testo copiato negli appunti");
  };

  const resetAll = () => {
    Speech.stop();
    setImages([]);
    setFinalText("");
    setProgress(0);
  };

  /* -----------------------------------------------
     UI
  ------------------------------------------------ */
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: bg }]}>
        <Text style={[styles.title, { color: textColor }]}>Study Mode</Text>

        <Text style={[styles.subtitle, { color: textColor }]}>
          Scatta o seleziona foto, scegli modalità e genera contenuti intelligenti.
        </Text>

        {/* Modalità */}
        <View style={styles.modeRow}>
          {[
            { key: "summary", label: "Riassunto" },
            { key: "scientific", label: "Scientific" },
            { key: "oral", label: "Orale" },
          ].map((m) => {
            const active = mode === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[
                  styles.modeBtn,
                  { backgroundColor: active ? accent : cardBg, borderColor: border },
                ]}
                onPress={() => setMode(m.key)}
              >
                <Text
                  style={{
                    color: active ? "#000" : textColor,
                    fontWeight: active ? "bold" : "600",
                  }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 🔥 NUOVA INTERFACCIA FOTO */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={openSheet}>
            <Text style={styles.actionBtnText}>Genera Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnPrimary, uploading && { opacity: 0.6 }]}
            onPress={uploadHandler}
            disabled={uploading}
          >
            <Text style={styles.actionBtnPrimaryText}>
              {uploading ? "Analisi..." : "Analizza"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Immagini */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            style={{ marginTop: 20 }}
            showsHorizontalScrollIndicator={false}
          >
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img.uri }} style={styles.imageItem} />
            ))}
          </ScrollView>
        )}

        {/* Progress */}
        {uploading && (
          <Progress.Bar
            progress={progress}
            width={250}
            color={accent}
            style={{ marginTop: 20, alignSelf: "center" }}
          />
        )}

        {/* RISULTATO SOLO PER SUMMARY / SCIENTIFIC */}
        {finalText !== "" && mode !== "oral" && (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Testo Analizzato</Text>

            <ScrollView style={styles.textScroll}>
              <Text style={[styles.cardText, { color: textColor }]}>{finalText}</Text>
            </ScrollView>

            <View style={styles.row}>
              <TouchableOpacity style={styles.smallBtn} onPress={copyToClipboard}>
                <Text style={styles.smallBtnText}>Copia</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallBtn} onPress={speakText}>
                <Text style={styles.smallBtnText}>▶️ Leggi</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallBtn} onPress={stopSpeaking}>
                <Text style={styles.smallBtnText}>⏹ Stop</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.shareTitle, { color: textColor }]}>Condividi</Text>

            <View style={styles.shareRow}>
              <TouchableOpacity style={styles.shareBtn} onPress={() => shareUniversal(finalText)}>
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: "#25D366" }]}
                onPress={() => shareWhatsapp(finalText)}
              >
                <Text style={styles.shareBtnText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: "#0072C6" }]}
                onPress={() => shareEmail("SmartStudy Testo", finalText)}
              >
                <Text style={styles.shareBtnText}>Email</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={resetAll}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* -----------------------------------------------------------
          🔥 BOTTOM SHEET PREMIUM
      ----------------------------------------------------------- */}
      {bottomSheetVisible && (
        <Modal transparent animationType="fade">
          {/* sfondo scuro */}
          <Pressable style={styles.backdrop} onPress={closeSheet} />

          <PanGestureHandler
            onGestureEvent={(e) => {
              if (e.nativeEvent.translationY > 60) closeSheet();
            }}
          >
            <Animated.View
              style={[
                styles.bottomSheet,
                { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
                animatedStyle,
              ]}
            >
              <View style={styles.handle} />

              <TouchableOpacity
                style={styles.sheetBtn}
                onPress={() => {
                  closeSheet();
                  takePhoto();
                }}
              >
                <Text style={styles.sheetBtnText}>📷  Scatta Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetBtn}
                onPress={() => {
                  closeSheet();
                  pickImages();
                }}
              >
                <Text style={styles.sheetBtnText}>🖼️  Seleziona dalla Galleria</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={closeSheet}>
                <Text style={styles.closeText}>Chiudi</Text>
              </TouchableOpacity>
            </Animated.View>
          </PanGestureHandler>
        </Modal>
      )}
    </GestureHandlerRootView>
  );
}

/* -------------------------------------------------------
   STILI
-------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.8,
    marginBottom: 18,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#e5e5e5",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnText: {
    fontWeight: "600",
    color: "#000",
  },
  actionBtnPrimary: {
    flex: 1.3,
    backgroundColor: "#1DB954",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnPrimaryText: {
    fontWeight: "700",
    color: "#000",
  },
  imageItem: {
    width: 100,
    height: 130,
    borderRadius: 14,
    marginRight: 10,
  },
  card: {
    marginTop: 26,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  textScroll: {
    maxHeight: 280,
    marginBottom: 14,
  },
  cardText: {
    fontSize: 17,
    lineHeight: 26,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  smallBtn: {
    backgroundColor: "#e5e5e5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  smallBtnText: {
    color: "#000",
    fontWeight: "600",
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  shareRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  shareBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#555",
  },
  shareBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  resetBtn: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  resetText: {
    color: "#fff",
    fontWeight: "700",
  },

  /* 🔥 Bottom Sheet */
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingTop: 12,
    paddingBottom: 40,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  handle: {
    width: 45,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#777",
    alignSelf: "center",
    marginBottom: 15,
  },
  sheetBtn: {
    paddingVertical: 16,
    marginHorizontal: 20,
    backgroundColor: "#2a2a2d",
    borderRadius: 12,
    marginBottom: 12,
  },
  sheetBtnText: {
    color: "white",
    fontSize: 17,
    textAlign: "center",
    fontWeight: "600",
  },
  closeBtn: {
    marginTop: 10,
    paddingVertical: 12,
  },
  closeText: {
    textAlign: "center",
    color: "#bbb",
    fontSize: 15,
  },
});

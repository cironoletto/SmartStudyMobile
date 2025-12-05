// screens/CameraUploadScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Progress from "react-native-progress";

import { uploadQuizImages, uploadStudyImages } from "../utils/api";

export default function CameraUploadScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  // Permessi
  useEffect(() => {
    (async () => {
      try {
        const cam = await ImagePicker.requestCameraPermissionsAsync();
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cam.status !== "granted" || lib.status !== "granted") {
          Alert.alert("Permessi mancanti", "Concedi fotocamera e libreria.");
        }
      } catch (err) {
        console.log("Errore permessi:", err);
      }
    })();
  }, []);

  // Normalizza immagini HEIC / JPEG
  const normalizeImage = async (asset) => {
    let { uri } = asset;
    let mime = asset.mimeType || "image/jpeg";

    if (uri.endsWith(".heic") || mime === "image/heic") {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      uri = manipulated.uri;
      mime = "image/jpeg";
    }

    return {
      uri,
      name: asset.fileName || "image.jpg",
      type: mime,
    };
  };

  // Seleziona immagini
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const normalized = [];
        for (const asset of result.assets) {
          normalized.push(await normalizeImage(asset));
        }
        setImages(normalized);
      }
    } catch (err) {
      console.log("Errore selezione:", err);
    }
  };

  // Scatta foto
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled) {
        const normalized = await normalizeImage(result.assets[0]);
        setImages((prev) => [...prev, normalized]);
      }
    } catch (err) {
      console.log("Errore fotocamera:", err);
    }
  };

  // 🔥 CREA QUIZ
  const uploadQuiz = async () => {
    if (!images.length) return Alert.alert("Errore", "Aggiungi immagini");

    try {
      setUploading(true);
      setProgress(0);
      setMessage("Analisi per il quiz...");

      const res = await uploadQuizImages(images, setProgress);

      navigation.navigate("QuizPreview", { quizID: res.data.quizID });

      setImages([]);
    } catch (err) {
      console.log("QUIZ UPLOAD ERROR:", err);
      Alert.alert("Errore", "Impossibile generare il quiz");
    } finally {
      setUploading(false);
    }
  };

  // 📚 MODALITÀ STUDIO (riassunti + esercizi)
  const uploadStudy = async () => {
    if (!images.length) return Alert.alert("Errore", "Aggiungi immagini");

    try {
      setUploading(true);
      setProgress(0);
      setMessage("Modalità studio: elaborazione...");

      const res = await uploadStudyImages(images, setProgress);

      navigation.navigate("Study", {
        extractedText: res.data.extractedText,
        subjectType: res.data.subjectType,
        summary: res.data.summary,
        solutionSteps: res.data.solutionSteps,
        finalAnswer: res.data.finalAnswer,
      });

      setImages([]);
    } catch (err) {
      console.log("STUDY UPLOAD ERROR:", err.response?.data || err);
      Alert.alert("Errore", "Impossibile elaborare in modalità studio");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Scatta foto" onPress={takePhoto} />
      <Button title="Seleziona più foto" onPress={pickImages} />

      <ScrollView horizontal style={styles.previewContainer}>
        {images.map((img, i) => (
          <Image key={i} source={{ uri: img.uri }} style={styles.previewImage} />
        ))}
      </ScrollView>

      {/* Barra avanzamento upload */}
      {uploading && (
        <View style={{ alignItems: "center", marginVertical: 15 }}>
          <Text>{Math.round(progress * 100)}%</Text>

          <Progress.Bar
            progress={progress}
            width={260}
            height={12}
            borderRadius={8}
            color="#3B82F6"
            unfilledColor="#E5E7EB"
            borderWidth={0}
          />
          <Text style={{ marginTop: 8 }}>{message}</Text>
        </View>
      )}

      {/* 🔥 PULSANTE QUIZ */}
      <Button
        title="Crea QUIZ dalle foto"
        onPress={uploadQuiz}
        disabled={uploading || images.length === 0}
      />

      {/* 📚 NUOVO: MODALITÀ STUDIO */}
      <View style={{ marginTop: 12 }}>
        <Button
          title="📚 Modalità Studio (Riassunto / Problema)"
          onPress={uploadStudy}
          disabled={uploading || images.length === 0}
          color="#10B981"
        />
      </View>

      {message ? <Text style={{ marginTop: 8 }}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: "center" },
  previewContainer: { marginVertical: 10 },
  previewImage: { width: 100, height: 120, marginRight: 10, borderRadius: 8 },
});

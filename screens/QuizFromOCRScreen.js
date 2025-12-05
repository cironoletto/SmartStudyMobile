import React, { useState } from "react";
import { View, Text, Button, Image, ActivityIndicator, ScrollView, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

// 🔥 Inserisci qui il tuo IP e la route esatta
const API_URL = "http://192.168.1.29:4000/api"; // backend + /api

export default function QuizFromOCRScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);

  // --- Selezione immagine ---
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images, // nuovo standard
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.log("Errore selezione immagine:", err);
      Alert.alert("Errore", "Impossibile selezionare l'immagine");
    }
  };

  // --- Upload immagine e generazione quiz ---
  const uploadImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: image,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      const response = await axios.post(`${API_URL}/quiz-ocr`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setQuiz(response.data.quiz);
    } catch (err) {
      console.log("UPLOAD ERROR:", err?.response?.data || err);
      Alert.alert("Errore", "Impossibile inviare l'immagine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Button title="Scegli immagine" onPress={pickImage} />

      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: 300,
            marginTop: 20,
            borderRadius: 10,
          }}
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Genera quiz" onPress={uploadImage} disabled={!image || loading} />
      </View>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {quiz && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Quiz Generato</Text>
          <Text style={{ marginTop: 10 }}>{JSON.stringify(quiz, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

import React, { useState } from "react";
import { View, Text, Button, Image, ActivityIndicator, ScrollView, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

// 🔥 Inserisci qui il tuo IP
const API_URL = "http://192.168.1.29:4000/api/quiz/from-images";

// ------------------------------------
// 📌 FUNZIONE PER SELEZIONARE IMMAGINI
// ------------------------------------
const pickImages = async () => {
  console.log(">>> pickImages chiamato QuizFromOCRScreen");

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],  // <--- CORRETTO
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 1,
    });

    console.log("PICK RESULT:", result);

    if (!result.canceled) {
      setImages(result.assets);
    }

  } catch (err) {
    console.log("Errore selezione immagini:", err);
    Alert.alert("Errore", "Impossibile selezionare immagini");
  }
};


export default function QuizFromOCRScreen() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);

  // ------------------------------------
  // 📌 UPLOAD IMMAGINI
  // ------------------------------------
  const uploadImages = async () => {
    if (images.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();

      images.forEach((img, i) => {
        formData.append("images", {
          uri: img.uri,
          name: `image_${i}.jpg`,
          type: "image/jpeg",
        });
      });

      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setQuiz(response.data);
    } catch (err) {
      console.log("UPLOAD ERROR:", err?.response?.data || err);
      Alert.alert("Errore", "Impossibile inviare le immagini");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // 📌 UI
  // ------------------------------------
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Button
        title="Scegli immagini"
        onPress={async () => {
          const imgs = await pickImages();
          setImages(imgs);
        }}
      />

      {images.length > 0 &&
        images.map((img, i) => (
          <Image
            key={i}
            source={{ uri: img.uri }}
            style={{
              width: "100%",
              height: 200,
              marginTop: 20,
              borderRadius: 10,
            }}
          />
        ))}

      <View style={{ marginTop: 20 }}>
        <Button
          title="Genera quiz"
          onPress={uploadImages}
          disabled={images.length === 0 || loading}
        />
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

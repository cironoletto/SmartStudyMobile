// screens/QuizPreviewScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { fetchQuizDetail, startQuizAttempt } from "../utils/api";
import i18n from "../locales/i18n";

export default function QuizPreviewScreen({ route, navigation }) {
  const rawID = route.params?.quizID;
  const quizID = Number(rawID);

  console.log("📌 QuizPreviewScreen → quizID ricevuto:", rawID, " → parsed:", quizID);

  // ⚠️ ID non valido
  if (!quizID) {
    console.log("❌ ERRORE: quizID mancante o non valido!", route.params);
    Alert.alert(i18n.t("quizpreview_error_title"), i18n.t("quizpreview_invalid_id"));
    navigation.goBack();
    return null;
  }

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchQuizDetail(quizID);
      setQuizData(res.data);
    } catch (err) {
      console.log("❌ Errore caricamento quiz:", err.response?.data || err);
      Alert.alert(i18n.t("quizpreview_error_title"), i18n.t("quizpreview_load_error"));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setStarting(true);
      const res = await startQuizAttempt(quizID);
      const attemptID = res.data.attemptID;

      navigation.navigate("QuizAttempt", {
        quizID,
        attemptID,
      });
    } catch (err) {
      console.log("❌ Errore avvio tentativo:", err.response?.data || err);
      Alert.alert(i18n.t("quizpreview_error_title"), i18n.t("quizpreview_start_error"));
    } finally {
      setStarting(false);
    }
  };

  if (loading || !quizData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>{i18n.t("quizpreview_loading")}</Text>
      </View>
    );
  }

  const { quiz, questions } = quizData;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quiz.Title}</Text>
      
      {quiz.Description ? (
        <Text style={styles.desc}>{quiz.Description}</Text>
      ) : null}

      <Text style={styles.info}>
        {i18n.t("quizpreview_questions")}: {questions.length}
      </Text>

      <View style={{ marginVertical: 16 }}>
        <Button
          title={starting ? i18n.t("quizpreview_starting") : i18n.t("quizpreview_start_button")}
          onPress={handleStart}
          disabled={starting}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button
          title={i18n.t("quizpreview_attempts_button")}
          onPress={() => navigation.navigate("QuizAttempts", { quizID })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  desc: { fontSize: 16, marginBottom: 12 },
  info: { fontSize: 16, marginBottom: 20 },
});

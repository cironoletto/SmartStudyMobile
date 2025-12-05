import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getQuizHistory, clearQuizHistory } from "../utils/history";
import { startQuizAttempt } from "../utils/api";   // 👈 AGGIUNTO
import i18n from "../locales/i18n";

export default function QuizHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const h = await getQuizHistory();
    setHistory(h);
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.title}>{i18n.t("quizhistory_title")}</Text>

      {history.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          {i18n.t("quizhistory_empty")}
        </Text>
      )}

      {history.map((item, index) => (
        <View key={index} style={styles.itemBox}>
          <Text style={styles.itemTitle}>{item.title}</Text>

          <Text>
            {i18n.t("quizhistory_date")} {new Date(item.date).toLocaleString()}
          </Text>

          <Text>
            {i18n.t("quizhistory_score")} {item.score} / {item.maxScore}
          </Text>

          {/* 🔁 REPEAT QUIZ CORRETTO */}
          <TouchableOpacity
            style={styles.repeatBtn}
            onPress={async () => {
              try {
                const res = await startQuizAttempt(item.quizID); // 👈 QUI il vero quizID
                const newAttemptID = res.data.attemptID;

                navigation.navigate("QuizAttempt", {
                  quizID: item.quizID,
                  attemptID: newAttemptID,
                });
              } catch (err) {
                Alert.alert(
                  "Errore",
                  "Impossibile avviare un nuovo tentativo."
                );
                console.log("REPEAT ERROR:", err.response?.data || err);
              }
            }}
          >
            <Text style={styles.repeatText}>
              {i18n.t("quizattempt_repeat")}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {history.length > 0 && (
        <TouchableOpacity
          style={[styles.repeatBtn, { backgroundColor: "red", marginTop: 20 }]}
          onPress={async () => {
            await clearQuizHistory();
            setHistory([]);
          }}
        >
          <Text style={styles.repeatText}>
            {i18n.t("quizhistory_clear")}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },

  itemBox: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },

  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  repeatBtn: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  repeatText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

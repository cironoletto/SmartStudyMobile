import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import api from "../utils/api";
import i18n from "../locales/i18n";

export default function QuizListScreen({ navigation }) {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get("/quiz");
      console.log(">>> GET /quiz OK:", res.data);

      const normalized = res.data.map((q) => ({
        quizID: q.QuizID,
        title: q.Title,
        description: q.Description,
      }));

      setQuizzes(normalized);
    } catch (err) {
      console.log(">>> ERRORE GET /quiz:", err.response?.data || err.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.quizItem}
      onPress={() =>
        navigation.navigate("QuizPreview", { quizID: item.quizID })
      }
    >
      <Text style={styles.quizTitle}>{item.title}</Text>
      {item.description ? <Text>{item.description}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button
        title={i18n.t("quizlist_new")}
        onPress={() => navigation.navigate("Camera")}
      />

      <Text style={styles.title}>{i18n.t("quizlist_title")}</Text>

      <FlatList
        data={quizzes}
        keyExtractor={(item, index) =>
          (item.quizID ?? index).toString()
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>{i18n.t("quizlist_empty")}</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  quizItem: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  quizTitle: { fontWeight: "bold" },
  empty: { marginTop: 20, fontSize: 16, textAlign: "center", opacity: 0.7 }
});

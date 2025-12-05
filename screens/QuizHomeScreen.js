import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";

export default function QuizHomeScreen({ navigation }) {
  const isDark = useColorScheme() === "dark";

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0d0f14" : "#f5f6fa" },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? "#fff" : "#111" }]}>
        📝 Quiz Center
      </Text>

      <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#555" }]}>
        Gestisci, crea e ripeti i tuoi quiz
      </Text>

      {/* 🔹 GENERA DA FOTO */}
      <TouchableOpacity
        style={[styles.bigCard, styles.greenCard]}
        onPress={() => navigation.navigate("Camera")}
      >
        <View style={styles.bigIconCircle}>
          <Text style={styles.bigIcon}>📸</Text>
        </View>
        <View>
          <Text style={styles.bigTitle}>Genera da Foto</Text>
          <Text style={styles.bigSub}>
            Scatta una foto e ottieni un quiz automatico
          </Text>
        </View>
      </TouchableOpacity>

      {/* 🔹 I TUOI QUIZ */}
      <TouchableOpacity
        style={[styles.bigCard, styles.blueCard]}
        onPress={() => navigation.navigate("QuizList")}
      >
        <View style={styles.bigIconCircle}>
          <Text style={styles.bigIcon}>📚</Text>
        </View>
        <View>
          <Text style={styles.bigTitle}>I tuoi Quiz</Text>
          <Text style={styles.bigSub}>Gestisci tutti i quiz salvati</Text>
        </View>
      </TouchableOpacity>

      {/* 🔹 CRONOLOGIA QUIZ */}
      <TouchableOpacity
        style={[styles.bigCard, styles.purpleCard]}
        onPress={() => navigation.navigate("QuizHistory")}
      >
        <View style={styles.bigIconCircle}>
          <Text style={styles.bigIcon}>📜</Text>
        </View>
        <View>
          <Text style={styles.bigTitle}>Cronologia Quiz</Text>
          <Text style={styles.bigSub}>Rivedi i quiz svolti</Text>
        </View>
      </TouchableOpacity>

      {/* 🔹 STATISTICHE QUIZ */}
      <TouchableOpacity
        style={[styles.bigCard, styles.grayCard]}
        onPress={() => navigation.navigate("QuizStats")}
      >
        <View style={styles.bigIconCircle}>
          <Text style={styles.bigIcon}>📊</Text>
        </View>
        <View>
          <Text style={styles.bigTitle}>Statistiche</Text>
          <Text style={styles.bigSub}>Guarda i tuoi progressi</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22 },

  title: { fontSize: 30, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 16, marginBottom: 20 },

  bigCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 22,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 5,
  },

  bigIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  bigIcon: { fontSize: 30 },
  bigTitle: { fontSize: 19, fontWeight: "700", color: "white" },
  bigSub: { fontSize: 14, color: "rgba(255,255,255,0.85)" },

  greenCard: { backgroundColor: "#10b981" },
  blueCard: { backgroundColor: "#0ea5e9" },
  purpleCard: { backgroundColor: "#8b5cf6" },
  grayCard: { backgroundColor: "#6b7280" },
});

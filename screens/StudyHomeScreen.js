import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";

export default function StudyHomeScreen({ navigation }) {
  const isDark = useColorScheme() === "dark";
  const cardBG = isDark ? "#1a1a1a" : "#ffffff";

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0d0f14" : "#f5f6fa" },
      ]}
    >
      {/* HEADER */}
      <Text style={[styles.title, { color: isDark ? "#fff" : "#111" }]}>
        📘 Modalità Studio
      </Text>

      <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#444" }]}>
        Scegli come vuoi studiare oggi
      </Text>

      {/* 🔹 RIASSUNTO */}
      <TouchableOpacity
        style={[styles.bigCard, styles.blueCard]}
        onPress={() => navigation.navigate("Study", { mode: "summary" })}
      >
        <View style={styles.bigIconCircle}>
          <Text style={styles.bigIcon}>📝</Text>
        </View>

        <View>
          <Text style={styles.bigTitle}>Riassunto</Text>
          <Text style={styles.bigSub}>
            Analizza, comprendi e semplifica i tuoi contenuti
          </Text>
        </View>
      </TouchableOpacity>

      {/* 🔹 ORALE */}
      <TouchableOpacity
        style={[styles.bigCard, styles.greenCard]}
        onPress={() => navigation.navigate("Study", { mode: "oral" })}
      >
        <View style={styles.bigIconCircle}>
          <Text style={styles.bigIcon}>🎤</Text>
        </View>

        <View>
          <Text style={styles.bigTitle}>Orale</Text>
          <Text style={styles.bigSub}>
            Allena la tua esposizione orale con AI
          </Text>
        </View>
      </TouchableOpacity>

      {/* 🔹 SCIENTIFICO */}
      <TouchableOpacity
        style={[styles.bigCard, styles.purpleCard]}
        onPress={() => navigation.navigate("Study", { mode: "scientific" })}
      >
        <View style={styles.bigIconCircle}>
          <Text style={styles.bigIcon}>🔬</Text>
        </View>

        <View>
          <Text style={styles.bigTitle}>Modalità Scientifica</Text>
          <Text style={styles.bigSub}>Problemi risolti e spiegazioni chiare</Text>
        </View>
      </TouchableOpacity>

      {/* 🔹 CRONOLOGIA */}
      <TouchableOpacity
        style={[styles.bigCard, styles.grayCard]}
        onPress={() => navigation.navigate("StudyHistory")}
      >
        <View style={styles.bigIconCircle}>
          <Text style={styles.bigIcon}>📜</Text>
        </View>

        <View>
          <Text style={styles.bigTitle}>Cronologia Studio</Text>
          <Text style={styles.bigSub}>Consulta tutti i tuoi studi effettuati</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22 },

  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 22,
    opacity: 0.8,
  },

  /* BIG CARDS */
  bigCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 22,
    borderRadius: 20,
    marginBottom: 22,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
  },

  bigIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },

  bigIcon: { fontSize: 33 },
  bigTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  bigSub: { fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 2 },

  /* COLORS */
  blueCard: { backgroundColor: "#0ea5e9" },
  greenCard: { backgroundColor: "#10b981" },
  purpleCard: { backgroundColor: "#8b5cf6" },
  grayCard: { backgroundColor: "#6b7280" },

  /* ============================
       FOOTER PREMIUM
  ============================ */
  footer: {
    marginTop: 10,
    paddingTop: 15,
  },

  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  footerIcon: {
    fontSize: 26,
    marginRight: 14,
  },

  footerCardText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },

  logoutCard: {
    backgroundColor: "#ef4444",
  },
});

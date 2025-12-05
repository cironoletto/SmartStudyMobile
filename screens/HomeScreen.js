import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  useColorScheme,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../locales/i18n";

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  /* --------------------------------------------
     🔁 Refresh lingua quando si torna in Home
  -------------------------------------------- */
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const savedLang = await AsyncStorage.getItem("app_language");

        if (savedLang === "auto") {
          const deviceLang = Intl.DateTimeFormat().resolvedOptions().locale.slice(0, 2);
          i18n.locale = deviceLang;
        } else if (savedLang) {
          i18n.locale = savedLang;
        }
      })();
    }, [])
  );

  useEffect(() => {
    loadUser();
    startAnimation();
  }, []);

 const loadUser = async () => {
  try {
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return;

    let parsed = null;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }

    if (typeof parsed === "object") {
      setUser(parsed.name || parsed.username || "Studente");
    } else {
      setUser(parsed);
    }
  } catch (err) {
    console.log("Errore caricamento user:", err);
  }
};



  /* --------------------------------------------
     🎬 Animazioni
  -------------------------------------------- */
  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* --------------------------------------------
     🚪 Logout
  -------------------------------------------- */
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  /* --------------------------------------------
     UI
  -------------------------------------------- */
  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0d0f14" : "#f5f6fa" },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerHi, { color: isDark ? "#fff" : "#111" }]}>
            👋 Ciao, {user || "Studente"}!
          </Text>

          <Text style={[styles.headerSub, { color: isDark ? "#aaa" : "#555" }]}>
            Smart Study Hub
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.profileWrapper}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Bottone lingua */}
      <TouchableOpacity
        style={styles.langBtn}
        onPress={() => navigation.navigate("Language")}
      >
        <Text style={styles.langText}>🌍 Lingua</Text>
      </TouchableOpacity>

      {/* --------------------------------------------------
          SEZIONE PRINCIPALE — 2 grandi azioni
      -------------------------------------------------- */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* 📘 MODALITÀ STUDIO */}
        <TouchableOpacity
          style={[styles.bigCard, styles.blueCard]}
          onPress={() => navigation.navigate("StudyHome")}
        >
          <View style={styles.bigIconCircle}>
            <Text style={styles.bigIcon}>📘</Text>
          </View>
          <View>
            <Text style={styles.bigTitle}>Study Mode</Text>
            <Text style={styles.bigSub}>Studia, riassumi, parla e migliora</Text>
          </View>
        </TouchableOpacity>

        {/* 📝 QUIZ */}
        <TouchableOpacity
          style={[styles.bigCard, styles.greenCard]}
          onPress={() => navigation.navigate("QuizHome")}
        >
          <View style={styles.bigIconCircle}>
            <Text style={styles.bigIcon}>📝</Text>
          </View>
          <View>
            <Text style={styles.bigTitle}>Quiz</Text>
            <Text style={styles.bigSub}>Crea, risolvi e gestisci quiz</Text>
          </View>
        </TouchableOpacity>

        {/* --------------------------------------------------
            FOOTER PREMIUM — Terms / Payment / Logout
        -------------------------------------------------- */}

        <View style={styles.footerContainer}>
          {/* TERMS */}
          <TouchableOpacity
            style={[styles.footerCard, styles.cardBlue]}
            onPress={() => navigation.navigate("TermsOfUse")}
          >
            <Text style={styles.footerIcon}>📘</Text>
            <Text style={styles.footerCardTitle}>Terms of Use</Text>
          </TouchableOpacity>

          {/* PAYMENT */}
          <TouchableOpacity
            style={[styles.footerCard, styles.cardGreen]}
            onPress={() => navigation.navigate("PaymentTerms")}
          >
            <Text style={styles.footerIcon}>💳</Text>
            <Text style={styles.footerCardTitle}>Payment Terms</Text>
          </TouchableOpacity>

          {/* LOGOUT */}
          <TouchableOpacity
            style={[styles.footerCard, styles.cardRed]}
            onPress={handleLogout}
          >
            <Text style={styles.footerIcon}>🚪</Text>
            <Text style={styles.footerCardTitle}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

/* --------------------------------------------
   STILI PREMIUM
-------------------------------------------- */
const styles = StyleSheet.create({
  container: { padding: 22 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerHi: { fontSize: 28, fontWeight: "700" },
  headerSub: { fontSize: 15, marginTop: 2 },

  profileWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: { fontSize: 23, color: "#fff" },

  langBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 18,
  },
  langText: { fontSize: 14, color: "#111" },

  /* BIG CARDS */
  bigCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 22,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 5,
  },
  bigIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  bigIcon: { fontSize: 32 },
  bigTitle: { fontSize: 20, fontWeight: "700", color: "white" },
  bigSub: { fontSize: 14, color: "rgba(255,255,255,0.85)" },

  blueCard: { backgroundColor: "#0ea5e9" },
  greenCard: { backgroundColor: "#10b981" },

  /* FOOTER CARDS */
  footerContainer: {
    marginTop: 25,
  },
  footerCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  footerIcon: { fontSize: 26, marginRight: 14 },
  footerCardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },

  cardBlue: { backgroundColor: "#3b82f6" },
  cardGreen: { backgroundColor: "#10b981" },
  cardRed: { backgroundColor: "#ef4444" },
});

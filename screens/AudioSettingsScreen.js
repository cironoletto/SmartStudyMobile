// AudioSettingsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import i18n from "../locales/i18n";

const AUDIO_SETTINGS_KEY = "audioSettings";

export default function AudioSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    rate: 1,
    autoReadResults: false,
    autoReadCorrectAnswers: false,
    autoReadIdealAnswers: false,
    readWrongAnswers: false,
  });

  useEffect(() => {
    loadSettings();
    return () => Speech.stop();
  }, []);

  const loadSettings = async () => {
    try {
      const raw = await AsyncStorage.getItem(AUDIO_SETTINGS_KEY);
      if (raw) {
        setSettings(JSON.parse(raw));
      }
    } catch (e) {
      console.log("Errore load audioSettings:", e);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem(
        AUDIO_SETTINGS_KEY,
        JSON.stringify(newSettings)
      );
    } catch (e) {
      console.log("Errore save audioSettings:", e);
    }
  };

  const getLanguage = () => {
    const loc = i18n.locale || "it";
    if (loc.startsWith("it")) return "it-IT";
    if (loc.startsWith("en")) return "en-US";
    if (loc.startsWith("es")) return "es-ES";
    if (loc.startsWith("fr")) return "fr-FR";
    return "it-IT";
  };

  const speakTest = () => {
    Speech.stop();
    Speech.speak(i18n.t("audio_settings_test_voice"), {
      language: getLanguage(),
      rate: settings.rate || 1,
    });
  };

  const toggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    saveSettings(updated);
  };

  const changeRate = (rate) => {
    const updated = { ...settings, rate };
    saveSettings(updated);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{i18n.t("audio_settings_title")}</Text>
      <Text style={styles.subtitle}>
        {i18n.t("audio_settings_subtitle")}
      </Text>

      {/* Card stile iOS */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>
            {i18n.t("audio_settings_auto_results")}
          </Text>
          <Switch
            value={settings.autoReadResults}
            onValueChange={() => toggle("autoReadResults")}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>
            {i18n.t("audio_settings_auto_correct")}
          </Text>
          <Switch
            value={settings.autoReadCorrectAnswers}
            onValueChange={() => toggle("autoReadCorrectAnswers")}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>
            {i18n.t("audio_settings_auto_ideal")}
          </Text>
          <Switch
            value={settings.autoReadIdealAnswers}
            onValueChange={() => toggle("autoReadIdealAnswers")}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>
            {i18n.t("audio_settings_read_wrong")}
          </Text>
          <Switch
            value={settings.readWrongAnswers}
            onValueChange={() => toggle("readWrongAnswers")}
          />
        </View>
      </View>

      {/* Velocità voce */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
        {i18n.t("audio_settings_voice_speed")}
      </Text>

      <View style={styles.card}>
        <View style={styles.rateRow}>
          {[0.5, 1, 1.5, 2].map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.rateBtn,
                settings.rate === r && styles.rateBtnActive,
              ]}
              onPress={() => changeRate(r)}
            >
              <Text
                style={[
                  styles.rateText,
                  settings.rate === r && styles.rateTextActive,
                ]}
              >
                {r}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.testBtn} onPress={speakTest}>
          <Text style={styles.testBtnText}>
            🔊 {i18n.t("audio_settings_test_button")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f3f4f6" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    color: "#111827",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  rateBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  rateBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  rateText: {
    fontSize: 14,
    color: "#111827",
  },
  rateTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  testBtn: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  testBtnText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});

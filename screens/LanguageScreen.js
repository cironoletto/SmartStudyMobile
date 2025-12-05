import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, { setLanguage } from "../locales/i18n";

export default function LanguageScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selected, setSelected] = useState(i18n.locale);

  const LANGS = [
    { code: "auto", flag: "🌐", label: "Automatic" },
    { code: "it", flag: "🇮🇹", label: "Italiano" },
    { code: "en", flag: "🇬🇧", label: "English" },
    { code: "es", flag: "🇪🇸", label: "Español" },
    { code: "fr", flag: "🇫🇷", label: "Français" },
    { code: "de", flag: "🇩🇪", label: "Deutsch" }
  ];

  // FIX: Animated deve usare useRef
  const bounce = useRef(new Animated.Value(1)).current;

  const playBounce = () => {
    bounce.setValue(1); // reset
    Animated.sequence([
      Animated.timing(bounce, { toValue: 0.85, duration: 120, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 1, duration: 120, useNativeDriver: true })
    ]).start();
  };

  const chooseLanguage = async (code) => {
    playBounce();
    setSelected(code);

    if (code === "auto") {
      const deviceLang = Intl.DateTimeFormat().resolvedOptions().locale.slice(0, 2);
      await setLanguage(deviceLang);
      await AsyncStorage.setItem("app_language", "auto");
    } else {
      await setLanguage(code);
      await AsyncStorage.setItem("app_language", code);
    }

    // reload Home
    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    }, 200);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#111" : "#f9f9f9" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        {i18n.t("select_language")}
      </Text>

      {LANGS.map((l) => (
        <Animated.View
          key={l.code}
          style={{
            transform: [
              { scale: selected === l.code ? bounce : 1 }
            ]
          }}
        >
          <TouchableOpacity
            style={[
              styles.langBtn,
              selected === l.code && styles.langActive,
              { backgroundColor: isDark ? "#222" : "#fff" }
            ]}
            onPress={() => chooseLanguage(l.code)}
          >
            <View style={styles.flagCircle}>
              <Text style={styles.flag}>{l.flag}</Text>
            </View>
            <Text style={[styles.label, { color: isDark ? "#eee" : "#000" }]}>
              {l.label}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  langActive: {
    borderColor: "#2563eb",
    borderWidth: 2,
    backgroundColor: "#dbeafe",
  },
  flagCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    elevation: 3,
    marginRight: 14,
  },
  flag: {
    fontSize: 26,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
  },
});

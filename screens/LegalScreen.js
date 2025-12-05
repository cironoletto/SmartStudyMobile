import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import i18n from "../locales/i18n";

export default function LegalScreen() {
  const [selected, setSelected] = useState("privacy"); // privacy | terms

  return (
    <View style={styles.container}>
      {/* HEADER BUTTONS */}
      <View className="tabRow" style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, selected === "privacy" && styles.tabActive]}
          onPress={() => setSelected("privacy")}
        >
          <Text
            style={[
              styles.tabText,
              selected === "privacy" && styles.tabTextActive,
            ]}
          >
            {i18n.t("legal_tab_privacy")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selected === "terms" && styles.tabActive]}
          onPress={() => setSelected("terms")}
        >
          <Text
            style={[
              styles.tabText,
              selected === "terms" && styles.tabTextActive,
            ]}
          >
            {i18n.t("legal_tab_terms")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content}>
        {selected === "privacy" && (
          <>
            <Text style={styles.title}>{i18n.t("legal_privacy_title")}</Text>

            <Text style={styles.paragraph}>
              {i18n.t("legal_privacy_intro")}
            </Text>

            <Text style={styles.subtitle}>
              {i18n.t("legal_privacy_1_title")}
            </Text>
            <Text style={styles.paragraph}>
              {i18n.t("legal_privacy_1_body")}
            </Text>

            <Text style={styles.subtitle}>
              {i18n.t("legal_privacy_2_title")}
            </Text>
            <Text style={styles.paragraph}>
              {i18n.t("legal_privacy_2_body")}
            </Text>

            <Text style={styles.subtitle}>
              {i18n.t("legal_privacy_3_title")}
            </Text>
            <Text style={styles.paragraph}>
              {i18n.t("legal_privacy_3_body")}
            </Text>

            <Text style={styles.subtitle}>
              {i18n.t("legal_privacy_4_title")}
            </Text>
            <Text style={styles.paragraph}>
              {i18n.t("legal_privacy_4_body")}
            </Text>
          </>
        )}

        {selected === "terms" && (
          <>
            <Text style={styles.title}>{i18n.t("legal_terms_title")}</Text>

            <Text style={styles.paragraph}>
              {i18n.t("legal_terms_intro")}
            </Text>

            <Text style={styles.subtitle}>
              {i18n.t("legal_terms_1_title")}
            </Text>
            <Text style={styles.paragraph}>
              {i18n.t("legal_terms_1_body")}
            </Text>

            <Text style={styles.subtitle}>
              {i18n.t("legal_terms_2_title")}
            </Text>
            <Text style={styles.paragraph}>
              {i18n.t("legal_terms_2_body")}
            </Text>

            <Text style={styles.subtitle}>
              {i18n.t("legal_terms_3_title")}
            </Text>
            <Text style={styles.paragraph}>
              {i18n.t("legal_terms_3_body")}
            </Text>

            <Text style={styles.subtitle}>
              {i18n.t("legal_terms_4_title")}
            </Text>
            <Text style={styles.paragraph}>
              {i18n.t("legal_terms_4_body")}
            </Text>

            <Text style={styles.subtitle}>
              {i18n.t("legal_terms_5_title")}
            </Text>
            <Text style={styles.paragraph}>
              {i18n.t("legal_terms_5_body")}
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ==========================
// 🎨 STILI
// ==========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  tabRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#e5e7eb",
    justifyContent: "space-around",
  },

  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  tabActive: {
    backgroundColor: "#2563eb",
  },

  tabText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },

  tabTextActive: {
    color: "white",
  },

  content: {
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },

  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
});

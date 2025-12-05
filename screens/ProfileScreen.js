// screens/ProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { getStudyStats } from "../utils/api";

export default function ProfileScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getStudyStats();
      setStats(res.data);
    } catch (err) {
      console.log("Errore caricamento stats profilo:", err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Nessuna statistica disponibile</Text>
      </View>
    );
  }

  const { byDay = [] } = stats;
  const maxSessions =
    byDay.reduce((max, d) => Math.max(max, d.sessions), 0) || 1;

  /* ---------------- BADGE LOGIC SEMPLICE ---------------- */
  const badges = [];

  if (stats.totalSessions >= 1) {
    badges.push({
      id: "starter",
      title: "Primo passo",
      desc: "Hai completato la tua prima sessione.",
    });
  }
  if (stats.totalSessions >= 10) {
    badges.push({
      id: "focused",
      title: "Student Focus",
      desc: "Hai completato 10+ sessioni di studio.",
    });
  }
  if ((stats.avgOralScore || 0) >= 70 && stats.totalOralEvaluations >= 3) {
    badges.push({
      id: "speaker",
      title: "Oratore Avanzato",
      desc: "Ottima media nelle valutazioni orali.",
    });
  }
  if (stats.totalScientific >= 5) {
    badges.push({
      id: "scientist",
      title: "Mind Lab",
      desc: "Hai risolto 5+ problemi scientifici.",
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profilo Studente</Text>
      <Text style={styles.subtitle}>
        Panoramica del tuo percorso su SmartStudy.
      </Text>

      {/* KPI CARD */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Sessioni totali</Text>
          <Text style={styles.kpiValue}>{stats.totalSessions}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Riassunti</Text>
          <Text style={styles.kpiValue}>{stats.totalSummaries}</Text>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Problemi sci.</Text>
          <Text style={styles.kpiValue}>{stats.totalScientific}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Sessioni orali</Text>
          <Text style={styles.kpiValue}>{stats.totalOral}</Text>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Valutazioni orali</Text>
          <Text style={styles.kpiValue}>
            {stats.totalOralEvaluations || 0}
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Media orale</Text>
          <Text style={styles.kpiValue}>
            {stats.avgOralScore ? stats.avgOralScore.toFixed(1) : "-"}
          </Text>
        </View>
      </View>

      {/* 📈 GRAFICO APPRENDIMENTO (ULTIMI 7 GIORNI) */}
      <Text style={styles.sectionTitle}>Grafico di apprendimento (7 giorni)</Text>
      <View style={styles.chartWrapper}>
        {byDay.map((d, idx) => {
          const h = 20 + (d.sessions / maxSessions) * 80; // altezza barra
          return (
            <View key={idx} style={styles.chartItem}>
              <View style={[styles.chartBar, { height: h }]} />
              <Text style={styles.chartLabel}>{d.label}</Text>
              <Text style={styles.chartValue}>{d.sessions}</Text>
            </View>
          );
        })}
      </View>

      {/* 🏅 BADGE */}
      <Text style={styles.sectionTitle}>Badge sbloccati</Text>

      {badges.length === 0 ? (
        <Text style={styles.noBadgeText}>
          Studia ancora un po' per sbloccare i primi badge! 💪
        </Text>
      ) : (
        <View style={styles.badgeGrid}>
          {badges.map((b) => (
            <View key={b.id} style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>🏅</Text>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={loadStats}
      >
        <Text style={styles.refreshText}>Aggiorna dati</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ------------------ STILI ------------------ */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: "#121212",
  },
  center: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 18,
  },

  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#181818",
    padding: 14,
    borderRadius: 14,
  },
  kpiLabel: {
    color: "#aaa",
    fontSize: 13,
  },
  kpiValue: {
    color: "#1DB954",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 10,
  },

  /* CHART */
  chartWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#181818",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  chartItem: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 14,
    borderRadius: 8,
    backgroundColor: "#1DB954",
    marginBottom: 6,
  },
  chartLabel: {
    color: "#aaa",
    fontSize: 11,
  },
  chartValue: {
    color: "#fff",
    fontSize: 12,
  },

  /* BADGE */
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badgeCard: {
    width: "47%",
    backgroundColor: "#181818",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  badgeIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  badgeTitle: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDesc: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
  },
  noBadgeText: {
    color: "#aaa",
    fontSize: 13,
  },

  refreshBtn: {
    marginTop: 24,
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  refreshText: {
    color: "#fff",
    fontWeight: "600",
  },
});

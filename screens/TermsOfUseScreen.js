import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

export default function TermsOfUseScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Termini di utilizzo</Text>

      <Text style={styles.paragraph}>
        Questi Termini regolano l’uso dell’app Smart Study Mobile. 
        Utilizzando l’app accetti integralmente i presenti termini...
      </Text>

      <Text style={styles.subtitle}>1. Uso consentito</Text>
      <Text style={styles.paragraph}>
        L’utente può utilizzare l’app per creare, modificare e svolgere quiz personali.
      </Text>

      <Text style={styles.subtitle}>2. Responsabilità</Text>
      <Text style={styles.paragraph}>
        L’utente è responsabile dei contenuti caricati nell’app...
      </Text>

      <Text style={styles.subtitle}>3. Privacy</Text>
      <Text style={styles.paragraph}>
        I tuoi dati personali (username, cronologia quiz) vengono salvati solo localmente...
      </Text>

      <Text style={styles.subtitle}>4. Limitazioni</Text>
      <Text style={styles.paragraph}>
        È vietato utilizzare l’app per scopi illegali o distribuire quiz coperti da copyright.
      </Text>

      <Text style={styles.footer}>Ultimo aggiornamento: {new Date().getFullYear()}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15 },
  subtitle: { fontSize: 20, fontWeight: "bold", marginTop: 15 },
  paragraph: { fontSize: 16, marginTop: 6, lineHeight: 24 },
  footer: { marginTop: 25, fontStyle: "italic" },
});

import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

export default function PaymentTermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Condizioni di Pagamento</Text>

      <Text style={styles.paragraph}>
        L’app offre funzionalità avanzate tramite abbonamento o acquisti in-app.
      </Text>

      <Text style={styles.subtitle}>1. Tipi di abbonamento</Text>
      <Text style={styles.paragraph}>
        • Abbonamento mensile  
        • Abbonamento annuale (sconto del 20%)  
      </Text>

      <Text style={styles.subtitle}>2. Rinnovo automatico</Text>
      <Text style={styles.paragraph}>
        Gli abbonamenti si rinnovano automaticamente fino alla disattivazione.
      </Text>

      <Text style={styles.subtitle}>3. Cancellazione</Text>
      <Text style={styles.paragraph}>
        L’utente può disattivare il rinnovo automatico dalle impostazioni del proprio account Apple o Google.
      </Text>

      <Text style={styles.subtitle}>4. Rimborsi</Text>
      <Text style={styles.paragraph}>
        I rimborsi sono gestiti da Apple e Google direttamente secondo le loro politiche.
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

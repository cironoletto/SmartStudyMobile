import { Linking, Share, Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";

/* ---------------------------------------------------------
   SHARE TESTO UNIVERSALE
--------------------------------------------------------- */
export async function shareUniversal(text) {
  try {
    await Share.share({ message: text });
  } catch (err) {
    Alert.alert("Errore condivisione", err.message);
  }
}

/* ---------------------------------------------------------
   SHARE WHATSAPP (solo testo)
--------------------------------------------------------- */
export const shareWhatsapp = async (text) => {
  if (!text) return Alert.alert("Errore", "Nessun contenuto da condividere");

  const url = `whatsapp://send?text=${encodeURIComponent(text)}`;

  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    return Alert.alert(
      "WhatsApp non installato",
      "Installa WhatsApp per utilizzare questa funzione."
    );
  }

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Errore", "Impossibile aprire WhatsApp");
  }
};

/* ---------------------------------------------------------
   SHARE EMAIL
--------------------------------------------------------- */
export async function shareEmail(subject, body) {
  const emailUrl = `mailto:?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  const canOpen = await Linking.canOpenURL(emailUrl);

  if (!canOpen) {
    return Alert.alert("Errore", "Non è possibile aprire l'app Email.");
  }

  return Linking.openURL(emailUrl);
}

/* ---------------------------------------------------------
   SHARE AUDIO (per WhatsApp e app generiche)
--------------------------------------------------------- */
export async function shareRecordedAudio(uri) {
  try {
    if (!uri) return Alert.alert("Errore", "Audio non disponibile");

    // Scarica il file localmente (necessario per WhatsApp)
    const localPath = FileSystem.documentDirectory + "oral_recording.m4a";

    await FileSystem.copyAsync({
      from: uri,
      to: localPath,
    });

    await Share.share({
      url: localPath,
      message: "Ascolta la mia risposta orale!",
    });

  } catch (err) {
    console.log("❌ Errore condivisione audio:", err);
    Alert.alert("Errore", "Impossibile condividere il file audio");
  }
}

/* ---------------------------------------------------------
   SHARE AUDIO SOLO WHATSAPP (non lo usiamo ora)
--------------------------------------------------------- */
export async function shareWhatsappAudio(audioUrl) {
  try {
    if (!audioUrl) return Alert.alert("Errore", "Nessun audio disponibile");

    const localPath = FileSystem.documentDirectory + "tts_audio.mp3";
    await FileSystem.downloadAsync(audioUrl, localPath);

    await Share.share({
      url: localPath,
      message: "Ascolta questo audio!",
    });

  } catch (err) {
    console.log("Errore share WhatsApp:", err);
    Alert.alert("Errore", "Impossibile condividere l’audio");
  }
}

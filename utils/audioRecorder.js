// utils/audioRecorder.js
import { Audio } from "expo-audio";


// Stato globale semplice
let recordingInstance = null;

export const startRecording = async () => {
  try {
    // Permessi
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== "granted") {
      throw new Error("Permesso microfono negato");
    }

    // Modalità
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Configurazione
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recordingInstance = recording;
    return true;

  } catch (err) {
    console.log("REC ERROR:", err);
    throw err;
  }
};

export const stopRecording = async () => {
  try {
    if (!recordingInstance) return null;

    await recordingInstance.stopAndUnloadAsync();
    const uri = recordingInstance.getURI();

    const info = {
      uri,
      duration: (await recordingInstance.getStatusAsync()).durationMillis,
    };

    recordingInstance = null;
    return info;

  } catch (err) {
    console.log("STOP ERROR:", err);
    throw err;
  }
};

export const playAudio = async (uri) => {
  const sound = new Audio.Sound();
  await sound.loadAsync({ uri });
  await sound.playAsync();
};

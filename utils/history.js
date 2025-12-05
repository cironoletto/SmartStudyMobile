import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "QUIZ_HISTORY";

export const saveQuizHistory = async (entry) => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    let history = existing ? JSON.parse(existing) : [];

    // aggiungi in cima
    history.unshift(entry);

    // salva
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.log("Errore nel salvataggio della cronologia:", err);
  }
};

export const getQuizHistory = async () => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (err) {
    console.log("Errore nel caricamento della cronologia:", err);
    return [];
  }
};

export const clearQuizHistory = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

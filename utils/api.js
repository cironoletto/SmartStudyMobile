import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = "http://192.168.1.29:4000/api";

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 180000, // 3 minuti
});

/**
 * ----------------------------------------------------
 * 🔐 INTERCEPTOR: aggiunge automaticamente il token
 * ----------------------------------------------------
 */
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (!config.headers) config.headers = {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * ----------------------------------------------------
 * 📌 QUIZ API
 * ----------------------------------------------------
 */

// Lista quiz
export const getUserQuizzes = () => api.get("/quiz");

// Dettaglio quiz
export const fetchQuizDetail = (quizID) => api.get(`/quiz/${quizID}`);

// Avvia tentativo
export const startQuizAttempt = (quizID) =>
  api.post(`/quiz/${quizID}/attempts`);

// Recupera tentativi
export const getQuizAttempts = (quizID) =>
  api.get(`/quiz/${quizID}/attempts`);

// Invia risposte
export const submitAnswers = (quizID, attemptID, answers) =>
  api.post(`/quiz/${quizID}/attempts/${attemptID}/answers`, { answers });

/**
 * ----------------------------------------------------
 * 📸 UPLOAD IMMAGINI → QUIZ (OCR)
 * ----------------------------------------------------
 */
export const uploadQuizImages = async (images, onProgress) => {
  const formData = new FormData();
  const token = await AsyncStorage.getItem("token");

  images.forEach((img, i) => {
    formData.append("images", {
      uri: img.uri,
      name: img.name || `img_${i}.jpg`,
      type: img.type || "image/jpeg",
    });
  });

  return axios.post(`${API_URL}/quiz/from-images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
    timeout: 180000,
    onUploadProgress: (event) => {
      let progress;
      if (event.total) progress = event.loaded / event.total;
      else progress = Math.min(event.loaded / (1024 * 1024 * images.length), 0.9);

      if (onProgress) onProgress(progress);
    },
  });
};

/**
 * ----------------------------------------------------
 * 📚 MODALITÀ STUDIO (RIASSUNTI + PROBLEMI)
 * ----------------------------------------------------
 */
// Modalità studio da immagini
export const uploadStudyImages = async (images, mode, onProgress) => {
  const token = await AsyncStorage.getItem("token");

  const formData = new FormData();

  // invia anche la modalità
  formData.append("mode", mode);

  images.forEach((img, i) => {
    formData.append("images", {
      uri: img.uri,
      name: img.name || `photo_${i}.jpg`,
      type: img.type || "image/jpeg",
    });
  });

  console.log("FORMDATA DEBUG", formData);

  return axios({
    method: "post",
    url: `${API_URL}/study/from-images`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    timeout: 180000,
    onUploadProgress: (event) => {
      try {
        let p = event.total ? event.loaded / event.total : 0.5;
        if (onProgress) onProgress(p);
      } catch {}
    },
  });
};

export const getStudySessions = () => api.get("/study/sessions");
export const getStudySession = (sessionID) => api.get(`/study/session/${sessionID}`);


/**
 * ----------------------------------------------------
 * 🎤 VALUTAZIONE ORALE
 * ----------------------------------------------------
 */
export const evaluateOral = (payload) =>
  api.post("/study/evaluate-oral", payload);

export const setSessionRating = (sessionID, rating) =>
  api.post(`/study/session/${sessionID}/rating`, { rating });

/* ----------------------------------------------------
 * 📊 STATISTICHE STUDIO (per Profilo)
 * ---------------------------------------------------- */
export const getStudyStats = () => api.get("/study/stats");
export const getGlobalStudyStats = () => api.get("/study/stats/global");

export default api;


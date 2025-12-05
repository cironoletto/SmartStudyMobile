import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Button,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";

import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  fetchQuizDetail,
  submitAnswers,
  startQuizAttempt,
} from "../utils/api";
import { saveQuizHistory } from "../utils/history";
import i18n from "../locales/i18n";

const AUDIO_SETTINGS_KEY = "audioSettings";

export default function QuizAttemptScreen({ route, navigation }) {
  const { quizID, attemptID } = route.params;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const [audioSettings, setAudioSettings] = useState({
    rate: 1,
    autoReadResults: false,
    autoReadCorrectAnswers: false,
    autoReadIdealAnswers: false,
    readWrongAnswers: false,
  });

  useEffect(() => {
    loadQuiz();
    loadAudioSettings();
    Speech.stop(); // stop eventuale audio precedente
  }, []);

  const loadAudioSettings = async () => {
    try {
      const raw = await AsyncStorage.getItem(AUDIO_SETTINGS_KEY);
      if (raw) {
        setAudioSettings(JSON.parse(raw));
      }
    } catch (e) {
      console.log("Errore caricamento audioSettings:", e);
    }
  };

  const saveAudioSettings = async (settings) => {
    try {
      await AsyncStorage.setItem(
        AUDIO_SETTINGS_KEY,
        JSON.stringify(settings)
      );
      setAudioSettings(settings);
    } catch (e) {
      console.log("Errore salvataggio audioSettings:", e);
    }
  };

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const res = await fetchQuizDetail(quizID);
      setQuiz(res.data);
    } catch (err) {
      Alert.alert(
        i18n.t("quizattempt_error_title"),
        i18n.t("quizattempt_load_error")
      );
      navigation.goBack();
    } finally {
      setLoading(false);
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

  const speak = (text) => {
    if (!text) return;
    Speech.speak(text, {
      language: getLanguage(),
      rate: audioSettings.rate || 1,
    });
  };

  const stopSpeak = () => Speech.stop();

  const speakEntireQuiz = () => {
    if (!quiz) return;
    let full = `${quiz.quiz.Title}. `;

    quiz.questions.forEach((q, i) => {
      full += `${i18n.t("quizattempt_question")} ${i + 1}. ${q.text}. `;
      if (q.type === "mcq" && q.choices) {
        full += `${i18n.t("quizattempt_options")}: `;
        q.choices.forEach((c, idx) => {
          full += `${i18n.t("quizattempt_option")} ${idx + 1}. ${c}. `;
        });
      }
    });

    speak(full);
  };

  const setMCQAnswer = (questionID, choiceIndex) => {
    if (results) return;

    setAnswers((prev) => ({
      ...prev,
      [questionID]: { type: "mcq", selectedIndex: choiceIndex },
    }));
  };

  const setOpenAnswer = (questionID, text) => {
    if (results) return;

    setAnswers((prev) => ({
      ...prev,
      [questionID]: { type: "open", answerText: text },
    }));
  };

  const getDetail = (qid) =>
    results?.details?.find((d) => d.questionID === qid) || null;

  const submit = async () => {
    if (submitting || !quiz) return;

    const { questions } = quiz;

    try {
      const unanswered = questions.filter((q) => {
        const ans = answers[q.questionID];
        if (!ans) return true;
        if (q.type === "mcq") return ans.selectedIndex === undefined;
        if (q.type === "open") return !ans.answerText?.trim();
        return true;
      });

      if (unanswered.length > 0) {
        return Alert.alert(
          i18n.t("quizattempt_error_title"),
          i18n.t("quizattempt_missing_answers")
        );
      }

      setSubmitting(true);

      const payload = Object.keys(answers).map((qID) => ({
        questionID: Number(qID),
        type: answers[qID].type,
        selectedIndex: answers[qID].selectedIndex,
        answerText: answers[qID].answerText,
      }));

      const res = await submitAnswers(quizID, attemptID, payload);
      const data = res.data;

      setResults(data);

      await saveQuizHistory({
        quizID,
        attemptID,
        title: quiz.quiz.Title,
        date: new Date().toISOString(),
        score: data.totalScore,
        maxScore: data.maxScore,
      });
    } catch (err) {
      console.log("SUBMIT ERROR:", err.response?.data || err);
      Alert.alert(
        i18n.t("quizattempt_error_title"),
        i18n.t("quizattempt_submit_error")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Lettura automatica dei risultati quando arrivano
  useEffect(() => {
    if (!results || !quiz) return;
    if (!audioSettings.autoReadResults) return;

    stopSpeak();

    let summary = `${i18n.t("quizattempt_score")} ${
      results.totalScore
    } ${i18n.t("quizattempt_out_of")} ${results.maxScore}. `;

    if (typeof results.isPassed === "boolean") {
      summary += results.isPassed
        ? `${i18n.t("quizattempt_passed")}. `
        : `${i18n.t("quizattempt_failed")}. `;
    }

    speak(summary);

    // Opzionale: lettura dettagliata delle risposte
    quiz.questions.forEach((q) => {
      const detail = getDetail(q.questionID);
      if (!detail) return;

      // Se deve leggere anche sbagliate
      if (!detail.correct && !audioSettings.readWrongAnswers) return;

      if (detail.correct && !audioSettings.autoReadCorrectAnswers) return;
      if (!detail.correct && !audioSettings.autoReadIdealAnswers) return;

      let t = `${i18n.t("quizattempt_question")} ${q.questionID}. `;
      t += detail.correct
        ? `${i18n.t("quizattempt_correct")}. `
        : `${i18n.t("quizattempt_wrong")}. `;

      if (detail.correctAnswer) {
        t += `${
          q.type === "mcq"
            ? i18n.t("quizattempt_correct_answer")
            : i18n.t("quizattempt_ideal_answer")
        } ${detail.correctAnswer}. `;
      }

      speak(t);
    });
  }, [results, audioSettings, quiz]);

  if (loading || !quiz) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>{i18n.t("quizattempt_loading")}</Text>
      </View>
    );
  }

  const { quiz: quizMeta, questions } = quiz;

  const changeRate = (rate) => {
    const updated = { ...audioSettings, rate };
    saveAudioSettings(updated);
  };

  const toggleLocalAutoReadResults = () => {
    const updated = {
      ...audioSettings,
      autoReadResults: !audioSettings.autoReadResults,
    };
    saveAudioSettings(updated);
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.quizTitle}>{quizMeta.Title}</Text>

      {/* Pulsanti audio globali */}
      <View style={styles.audioRow}>
        <TouchableOpacity style={styles.btnPlay} onPress={speakEntireQuiz}>
          <Text style={styles.btnText}>
            🔊 {i18n.t("quizattempt_listen_all")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnStop} onPress={stopSpeak}>
          <Text style={styles.btnText}>⏹ STOP</Text>
        </TouchableOpacity>
      </View>

      {/* Mini impostazioni rapide (toggle & velocità) */}
      <View style={styles.audioSettingsBox}>
        <View style={styles.rowBetween}>
          <Text style={styles.audioLabel}>
            {i18n.t("quizattempt_auto_read_results")}
          </Text>
          <Switch
            value={audioSettings.autoReadResults}
            onValueChange={toggleLocalAutoReadResults}
          />
        </View>

        <Text style={[styles.audioLabel, { marginTop: 10 }]}>
          {i18n.t("quizattempt_voice_speed")}
        </Text>
        <View style={styles.rateRow}>
          {[0.5, 1, 1.5, 2].map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.rateBtn,
                audioSettings.rate === r && styles.rateBtnActive,
              ]}
              onPress={() => changeRate(r)}
            >
              <Text
                style={[
                  styles.rateText,
                  audioSettings.rate === r && styles.rateTextActive,
                ]}
              >
                {r}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.settingsLink}
          onPress={() => navigation.navigate("AudioSettings")}
        >
          <Text style={styles.settingsLinkText}>
            ⚙️ {i18n.t("quizattempt_open_audio_settings")}
          </Text>
        </TouchableOpacity>
      </View>

      {results && (
        <View style={styles.summary}>
          <Text style={styles.summaryTxt}>
            {i18n.t("quizattempt_score")} {results.totalScore}{" "}
            {i18n.t("quizattempt_out_of")} {results.maxScore}
          </Text>
          {typeof results.isPassed === "boolean" && (
            <Text
              style={[
                styles.summaryTxt,
                results.isPassed ? styles.pass : styles.fail,
              ]}
            >
              {results.isPassed
                ? i18n.t("quizattempt_passed")
                : i18n.t("quizattempt_failed")}
            </Text>
          )}
        </View>
      )}

      {questions.map((q, index) => {
        const detail = getDetail(q.questionID);
        const correct = detail?.correct;

        return (
          <View
            key={q.questionID}
            style={[
              styles.questionBox,
              results && correct === true && styles.boxCorrect,
              results && correct === false && styles.boxWrong,
            ]}
          >
            {/* Leggi questa domanda */}
            <TouchableOpacity
              style={styles.listenQ}
              onPress={() => speak(q.text)}
            >
              <Text style={{ fontSize: 18 }}>🔊</Text>
            </TouchableOpacity>

            <Text style={styles.questionText}>
              {index + 1}. {q.text}
            </Text>

            {/* SCELTA MULTIPLA */}
            {q.type === "mcq" &&
              q.choices?.map((c, idx) => (
                <TouchableOpacity
                  key={idx}
                  disabled={!!results}
                  style={[
                    styles.choiceBtn,
                    answers[q.questionID]?.selectedIndex === idx &&
                      styles.choiceSelected,
                  ]}
                  onPress={() => setMCQAnswer(q.questionID, idx)}
                >
                  <Text style={{ flex: 1 }}>{c}</Text>

                  {/* Leggi questa risposta */}
                  <TouchableOpacity onPress={() => speak(c)}>
                    <Text style={styles.speakSmall}>🔊</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}

            {/* RISPOSTA APERTA */}
            {q.type === "open" && (
              <TextInput
                editable={!results}
                style={styles.openInput}
                placeholder={i18n.t("quizattempt_answer_placeholder")}
                multiline
                value={answers[q.questionID]?.answerText || ""}
                onChangeText={(t) => setOpenAnswer(q.questionID, t)}
              />
            )}

            {/* FEEDBACK DOPO I RISULTATI */}
            {results && detail && (
              <View style={{ marginTop: 8 }}>
                {correct ? (
                  <>
                    <Text style={styles.correctTxt}>
                      {i18n.t("quizattempt_correct")}
                    </Text>

                    {detail.correctAnswer && (
                      <TouchableOpacity
                        onPress={() => speak(detail.correctAnswer)}
                      >
                        <Text style={styles.speakSmallGreen}>
                          🔊 {i18n.t("quizattempt_listen_correct")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.wrongTxt}>
                      {i18n.t("quizattempt_wrong")}
                    </Text>

                    <Text style={styles.correctAnswer}>
                      {q.type === "mcq"
                        ? i18n.t("quizattempt_correct_answer")
                        : i18n.t("quizattempt_ideal_answer")}{" "}
                      {detail.correctAnswer || "—"}
                    </Text>

                    {detail.correctAnswer && (
                      <TouchableOpacity
                        onPress={() => speak(detail.correctAnswer)}
                      >
                        <Text style={styles.speakSmallRed}>
                          🔊 {i18n.t("quizattempt_listen_ideal")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        );
      })}

      {!results && (
        <Button
          title={
            submitting
              ? i18n.t("quizattempt_submitting")
              : i18n.t("quizattempt_submit")
          }
          onPress={submit}
          disabled={submitting}
        />
      )}

      {results && (
        <View style={{ marginTop: 30 }}>
          <TouchableOpacity
            style={styles.btnPlay}
            onPress={async () => {
              try {
                const res = await startQuizAttempt(quizID);
                navigation.replace("QuizAttempt", {
                  quizID,
                  attemptID: res.data.attemptID,
                });
              } catch (err) {
                Alert.alert(
                  i18n.t("quizattempt_error_title"),
                  i18n.t("quizpreview_start_error")
                );
              }
            }}
          >
            <Text style={styles.btnText}>
              {i18n.t("quizattempt_repeat")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  quizTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },

  audioRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  btnPlay: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
  },
  btnStop: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 8,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },

  audioSettingsBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  audioLabel: {
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rateRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  rateBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#9ca3af",
    marginRight: 8,
  },
  rateBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  rateText: {
    fontSize: 13,
    color: "#374151",
  },
  rateTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  settingsLink: {
    marginTop: 10,
  },
  settingsLinkText: {
    color: "#2563eb",
    fontWeight: "600",
  },

  summary: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
  },
  summaryTxt: {
    fontSize: 16,
    textAlign: "center",
  },
  pass: { color: "#16a34a", fontWeight: "bold" },
  fail: { color: "#b91c1c", fontWeight: "bold" },

  questionBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
    position: "relative",
  },
  boxCorrect: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
    borderWidth: 2,
  },
  boxWrong: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
    borderWidth: 2,
  },

  listenQ: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  questionText: {
    fontSize: 16,
    marginBottom: 8,
    paddingRight: 28,
  },
  choiceBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#ddd",
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  choiceSelected: {
    backgroundColor: "#93c5fd",
  },
  speakSmall: {
    fontSize: 18,
    marginLeft: 10,
  },
  speakSmallGreen: {
    fontSize: 16,
    color: "#065f46",
    marginTop: 4,
  },
  speakSmallRed: {
    fontSize: 16,
    color: "#b91c1c",
    marginTop: 4,
  },

  openInput: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 6,
    backgroundColor: "#fff",
    padding: 8,
    minHeight: 80,
  },

  correctTxt: { color: "#065f46", fontWeight: "bold" },
  wrongTxt: { color: "#b91c1c", fontWeight: "bold" },
  correctAnswer: { marginTop: 4, color: "#065f46", fontStyle: "italic" },
});

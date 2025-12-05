// screens/QuizPlayScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import api from '../utils/api';

export default function QuizPlayScreen({ route, navigation }) {
  const { quizID } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [resultID, setResultID] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersState, setAnswersState] = useState([]); // store selected answer ids

  useEffect(() => {
    loadQuiz();
  }, []);

  async function loadQuiz() {
    try {
      const res = await api.get(`/quiz/${quizID}`);
      setQuiz(res.data);
      const startRes = await api.post('/quiz/start', { userID: 1, quizID }); // userID: 1 temporaneo; idealmente prendere da token
      setResultID(startRes.data.resultID);
    } catch (err) {
      console.log(err);
    }
  }

  async function submitAnswer(answerID) {
    try {
      const q = quiz.questions[currentIndex];
      await api.post('/quiz/answer', { resultID, questionID: q.QuestionID, answerID });
      const next = currentIndex + 1;
      if (next >= quiz.questions.length) {
        const finishRes = await api.post('/quiz/finish', { resultID });
        navigation.replace('Result', { score: finishRes.data.score });
      } else {
        setCurrentIndex(next);
      }
    } catch (err) {
      Alert.alert('Errore', err.response?.data?.error || err.message);
    }
  }

  if (!quiz) return <Text>Caricamento...</Text>;

  const q = quiz.questions[currentIndex];

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20 }}>{quiz.quiz.Title}</Text>
      <Text style={{ marginTop: 12, fontSize: 18 }}>{q.QuestionText}</Text>
      {q.answers.map(a => (
        <View key={a.AnswerID} style={{ marginVertical: 8 }}>
          <Button title={a.AnswerText} onPress={() => submitAnswer(a.AnswerID)} />
        </View>
      ))}
    </View>
  );
}

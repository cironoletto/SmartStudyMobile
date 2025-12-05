// screens/ResultScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';

export default function ResultScreen({ route, navigation }) {
  const { score } = route.params;
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 28 }}>Risultato</Text>
      <Text style={{ fontSize: 22, marginVertical: 12 }}>Punteggio: {score}%</Text>
      <Button title="Torna ai quiz" onPress={() => navigation.navigate('QuizList')} />
    </View>
  );
}

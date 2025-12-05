import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/* -----------------------------------------
   🔐 AUTH
----------------------------------------- */
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

/* -----------------------------------------
   🏠 HOME + LINGUA + PROFILO
----------------------------------------- */
import HomeScreen from "./screens/HomeScreen";
import LanguageScreen from "./screens/LanguageScreen";
import ProfileScreen from "./screens/ProfileScreen";

/* -----------------------------------------
   📝 QUIZ AREA
----------------------------------------- */
import QuizHomeScreen from "./screens/QuizHomeScreen";
import QuizListScreen from "./screens/QuizListScreen";
import CameraUploadScreen from "./screens/CameraUploadScreen";
import QuizPreviewScreen from "./screens/QuizPreviewScreen";
import QuizAttemptScreen from "./screens/QuizAttemptScreen";
import QuizAttemptsScreen from "./screens/QuizAttemptsScreen";
import QuizHistoryScreen from "./screens/QuizHistoryScreen";

/* -----------------------------------------
   🎓 STUDY AREA
----------------------------------------- */
import StudyHomeScreen from "./screens/StudyHomeScreen";
import StudyScreen from "./screens/StudyScreen";

import StudyHistoryScreen from "./screens/StudyHistoryScreen";      // ⭐ Aggiunto
import StudyDetailScreen from "./screens/StudyDetailScreen";        // ⭐ Aggiunto

/* ---- MODALITÀ ORALE ---- */
import StudyOralTopicScreen from "./screens/StudyOralTopicScreen";
import StudyOralRecordScreen from "./screens/StudyOralRecordScreen";
import StudyOralResultScreen from "./screens/StudyOralResultScreen";

/* -----------------------------------------
   🔊 AUDIO SETTINGS
----------------------------------------- */
import AudioSettingsScreen from "./screens/AudioSettingsScreen";

/* -----------------------------------------
   📄 LEGAL
----------------------------------------- */
import TermsOfUseScreen from "./screens/TermsOfUseScreen";
import PaymentTermsScreen from "./screens/PaymentTermsScreen";
import LegalScreen from "./screens/LegalScreen";

/* -----------------------------------------
   🌍 i18n
----------------------------------------- */
import i18n from "./locales/i18n";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        {/* ----------------------------------------------------
           🔐 AUTHENTICATION
        ---------------------------------------------------- */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: i18n.t("login_title") }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: i18n.t("register_title") }}
        />

        {/* ----------------------------------------------------
           🏠 HOME + PROFILO
        ---------------------------------------------------- */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: i18n.t("home_title") }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Profilo" }}
        />
        <Stack.Screen
          name="Language"
          component={LanguageScreen}
          options={{ title: i18n.t("select_language") }}
        />

        {/* ----------------------------------------------------
           🎓 STUDY AREA
        ---------------------------------------------------- */}
        <Stack.Screen
          name="StudyHome"
          component={StudyHomeScreen}
          options={{ title: "Studio" }}
        />
        <Stack.Screen
          name="Study"
          component={StudyScreen}
          options={{ title: i18n.t("study_title") }}
        />

        {/* Cronologia + Dettagli */}
        <Stack.Screen
          name="StudyHistory"
          component={StudyHistoryScreen}
          options={{ title: "Cronologia Studio" }}
        />
        <Stack.Screen
          name="StudyDetail"
          component={StudyDetailScreen}
          options={{ title: "Dettaglio Studio" }}
        />

        {/* Modalità Orale */}
        <Stack.Screen
          name="StudyOralTopic"
          component={StudyOralTopicScreen}
          options={{ title: "Argomento Orale" }}
        />
        <Stack.Screen
          name="StudyOralRecord"
          component={StudyOralRecordScreen}
          options={{ title: "Registrazione Orale" }}
        />
        <Stack.Screen
          name="StudyOralResult"
          component={StudyOralResultScreen}
          options={{ title: "Risultato Orale" }}
        />

        {/* ----------------------------------------------------
           📝 QUIZ AREA
        ---------------------------------------------------- */}
        <Stack.Screen
          name="QuizHome"
          component={QuizHomeScreen}
          options={{ title: "Quiz" }}
        />
        <Stack.Screen
          name="QuizList"
          component={QuizListScreen}
          options={{ title: i18n.t("quizlist_title") }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraUploadScreen}
          options={{ title: i18n.t("camera_title") }}
        />
        <Stack.Screen
          name="QuizPreview"
          component={QuizPreviewScreen}
          options={{ title: i18n.t("quizpreview_title") }}
        />
        <Stack.Screen
          name="QuizAttempt"
          component={QuizAttemptScreen}
          options={{ title: i18n.t("quizattempt_title") }}
        />
        <Stack.Screen
          name="QuizAttempts"
          component={QuizAttemptsScreen}
          options={{ title: i18n.t("quizattempts_title") }}
        />
        <Stack.Screen
          name="QuizHistory"
          component={QuizHistoryScreen}
          options={{ title: i18n.t("quizhistory_title") }}
        />

        {/* ----------------------------------------------------
           🔊 AUDIO SETTINGS
        ---------------------------------------------------- */}
        <Stack.Screen
          name="AudioSettings"
          component={AudioSettingsScreen}
          options={{ title: i18n.t("audiosettings_title") }}
        />

        {/* ----------------------------------------------------
           📄 LEGAL
        ---------------------------------------------------- */}
        <Stack.Screen
          name="TermsOfUse"
          component={TermsOfUseScreen}
          options={{ title: i18n.t("terms_title") }}
        />
        <Stack.Screen
          name="PaymentTerms"
          component={PaymentTermsScreen}
          options={{ title: i18n.t("paymentterms_title") }}
        />
        <Stack.Screen
          name="Legal"
          component={LegalScreen}
          options={{ title: i18n.t("privacy_terms") }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

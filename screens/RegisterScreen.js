import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import api from "../utils/api";
import i18n from "../locales/i18n";
import logo from "../assets/images/logo.png";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", { username, password, fullName });
      alert(i18n.t("register_success"));
      navigation.goBack();
    } catch (err) {
      alert(i18n.t("register_error"));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>

        {/* LOGO */}
        <Image source={logo} style={styles.logo} />

        <Text style={[styles.title, { color: isDark ? "white" : "#111" }]}>
          {i18n.t("register_title")}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={i18n.t("register_fullname")}
          placeholderTextColor="#9ca3af"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder={i18n.t("register_username")}
          placeholderTextColor="#9ca3af"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder={i18n.t("register_password")}
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={handleRegister}>
          <Text style={styles.btnText}>{i18n.t("register_button")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>{i18n.t("register_login_link")}</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  inner: { alignItems: "center" },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    marginTop: 10,
  },
  btnText: { color: "white", fontSize: 18, textAlign: "center" },
  link: {
    color: "#2563eb",
    marginTop: 15,
    fontWeight: "bold",
    fontSize: 16,
  },
});

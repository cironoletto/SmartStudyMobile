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
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";
import i18n from "../locales/i18n";
import logo from "../assets/images/logo.png";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

const handleLogin = async () => {
  try {
    const res = await api.post("/auth/login", { username, password });

    const token = res.data.token;
    const user = res.data.user || { username };  // fallback

    // Salva token
    await AsyncStorage.setItem("token", token);

    // Salva il nome utente (così la Home potrà leggerlo)
    await AsyncStorage.setItem("user", JSON.stringify(user));

    navigation.replace("Home");
  } catch (err) {
    console.log("LOGIN ERROR:", err.response?.data || err);
    alert(i18n.t("login_error"));
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
          {i18n.t("login_title")}
        </Text>

        {/* Username */}
        <TextInput
          style={styles.input}
          placeholder={i18n.t("login_username")}
          placeholderTextColor="#9ca3af"
          value={username}
          onChangeText={setUsername}
        />

        {/* Password */}
        <TextInput
          style={styles.input}
          placeholder={i18n.t("login_password")}
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Login Button */}
        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>{i18n.t("login_button")}</Text>
        </TouchableOpacity>

        {/* Go to Register */}
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>{i18n.t("login_register_link")}</Text>
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

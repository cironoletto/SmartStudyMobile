import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";

// Import languages
import en from "./en.json";
import it from "./it.json";
import es from "./es.json";
import fr from "./fr.json";
import de from "./de.json";


// Load translations
i18n.translations = { en, it, es, fr, de };
i18n.fallbacks = true;

// Priority:
// 1. Saved language
// 2. Device language
// 3. English fallback
export async function initLanguage() {
  const savedLang = await AsyncStorage.getItem("app_lang");

  if (savedLang) {
    i18n.locale = savedLang;
    return savedLang;
  }

  // Detect device language
  const deviceLang = Localization.locale.split("-")[0];

  const supported = ["en", "it", "es", "fr", "de", "pt"];

  if (supported.includes(deviceLang)) {
    i18n.locale = deviceLang;
    return deviceLang;
  }

  // Default fallback
  i18n.locale = "en";
  return "en";
}

// For manual change
export async function setLanguage(lang) {
  i18n.locale = lang;
  await AsyncStorage.setItem("app_lang", lang);
}

export default i18n;

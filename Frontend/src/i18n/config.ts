import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import enTranslations from "./locales/en.json";
import amTranslations from "./locales/am.json";
import omTranslations from "./locales/om.json";

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources: {
      en: { translation: enTranslations },
      am: { translation: amTranslations },
      om: { translation: omTranslations },
    },
    fallbackLng: "en", // Default language
    lng: localStorage.getItem("language") || "en", // Get saved language or default to English
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;

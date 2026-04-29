/**
 * i18next configuration
 * Static JSON files — zero Cloud Translation API cost for UI strings.
 * Language preference persisted to localStorage — survives page reload
 * and carries forward post-auth into all subsequent screens.
 */
import i18nInstance from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import hi from "./hi.json";

const LOCALE_KEY = "civiccompass_locale";

const savedLocale = localStorage.getItem(LOCALE_KEY) ?? "en";

// eslint-disable-next-line import-x/no-named-as-default-member
void i18nInstance.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: savedLocale,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes output
  },
});

/** Persist locale on every language change */
i18nInstance.on("languageChanged", (lng) => {
  localStorage.setItem(LOCALE_KEY, lng);
  document.documentElement.lang = lng;
});

export default i18nInstance;
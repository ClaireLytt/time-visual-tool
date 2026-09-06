import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './locales/zh.json'
import en from './locales/en.json'

const savedLang = (() => {
  try {
    return localStorage.getItem('time-visual-lang') ?? 'zh'
  } catch {
    return 'zh'
  }
})()

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
})

document.documentElement.lang = savedLang

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('time-visual-lang', lng)
  } catch {
    // ignore
  }
  document.documentElement.lang = lng
})

export default i18n

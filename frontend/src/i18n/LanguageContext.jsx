import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import en from './en.json'
import ru from './ru.json'

const dictionaries = { en, ru }
const STORAGE_KEY = 'quizmax_lang'
const DEFAULT_LANGUAGE = 'en'

function readSavedLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && dictionaries[saved]) return saved
  } catch {
    // Browser storage can be blocked, so fall back to the default
  }
  return DEFAULT_LANGUAGE
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readSavedLanguage)

  const setLang = useCallback((next) => {
    if (!dictionaries[next]) return
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore storage errors
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // t('some.key') returns the text. t('some.key', { name: 'Tee' }) fills {name} in the text.
  const t = useCallback((key, params = {}) => {
    const text = dictionaries[lang][key] ?? dictionaries.en[key] ?? key
    return text.replace(/\{(\w+)\}/g, (match, name) =>
      params[name] !== undefined ? params[name] : match
    )
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return context
}

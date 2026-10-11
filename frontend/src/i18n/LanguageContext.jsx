import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import en from './en.json'
import ru from './ru.json'
import { pluralCategory } from './plural.mjs'

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

function fill(text, params) {
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] !== undefined ? params[name] : match
  )
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
    return fill(text, params)
  }, [lang])

  // tn('some.key', 5) picks the right form for the number, for example .one, .few, .many or .other
  const tn = useCallback((key, count, params = {}) => {
    const form = pluralCategory(lang, count)
    const text =
      dictionaries[lang][key + '.' + form] ??
      dictionaries[lang][key + '.other'] ??
      dictionaries.en[key + '.other'] ??
      key
    return fill(text, { count, ...params })
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tn }}>
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

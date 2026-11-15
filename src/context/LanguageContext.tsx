import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Language = 'en' | 'tr'

const STORAGE_KEY = 'jsa_lang'

interface LanguageContextValue {
  lang: Language
  setLang: (next: Language) => void
  toggleLang: () => void
  isEn: boolean
  pick: <T>(en: T, tr: T) => T
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'tr') return saved
  } catch {
    // ignore storage access errors
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(readInitialLanguage)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore storage access errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang: (next: Language) => setLangState(next),
      toggleLang: () => setLangState((prev) => (prev === 'en' ? 'tr' : 'en')),
      isEn: lang === 'en',
      pick: <T,>(en: T, tr: T) => (lang === 'en' ? en : tr),
    }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}

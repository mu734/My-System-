import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Language, translations, Translations } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
  isRTL: boolean;
  formatCurrency: (amount: number) => string;
  formatNumber: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'whitetable_hub_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as Language;
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'en';
  });

  const isRTL = lang === 'ar';

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = useMemo(() => translations[lang], [lang]);

  const formatCurrency = (amount: number) => {
    const formatted = Math.round(amount * 100) / 100;
    if (lang === 'ar') {
      return `${formatted.toLocaleString('en-US')} ج.م`;
    }
    return `${formatted.toLocaleString('en-US')} EGP`;
  };

  const formatNumber = (amount: number) => {
    return amount.toLocaleString('en-US');
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        isRTL,
        formatCurrency,
        formatNumber,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import i18n, { loadAndSetLanguage } from '../i18n.js';
import { SUPPORTED_LANGUAGES } from '../utils/translations.js';
import { apiTranslationService, normalizeLanguageCode } from '../services/apiTranslationService.js';
import { apiProfileService } from '../services/apiProfileService.js';
import { apiUserService } from '../services/apiUserService.js';
import { LEGACY_KEY_MAP } from '../utils/legacyKeyMap.js';

const LanguageContext = createContext(null);

// In-flight request deduplication map for on-demand post/comment translations
const pendingTranslations = new Map();

/**
 * Returns standard 2-letter uppercase ISO code (e.g. 'EN', 'HI', 'BN')
 */
export function getLanguageCode(lang) {
  if (!lang) return 'EN';
  const code = normalizeLanguageCode(lang);
  return code ? code.toUpperCase() : 'EN';
}

/**
 * Returns full display label (e.g. 'English', 'Hindi', 'Bengali')
 */
export function normalizeLanguage(lang) {
  if (!lang) return 'English';
  const code = getLanguageCode(lang);
  const found = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toUpperCase() === code.toUpperCase()
  );
  return found ? found.label : lang;
}

export function resolveBrowserOrFallbackLanguage() {
  try {
    const saved = localStorage.getItem('mka_preferred_language');
    if (saved) {
      return normalizeLanguage(saved);
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      const navLang = navigator.language.split('-')[0].toLowerCase();
      const found = SUPPORTED_LANGUAGES.find(
        (l) => l.code.toLowerCase() === navLang || l.label.toLowerCase().startsWith(navLang)
      );
      if (found) {
        return found.label;
      }
    }
  } catch (e) {}
  return 'English';
}

export function LanguageProvider({ children }) {
  const queryClient = useQueryClient();
  const [isResolvingLanguage, setIsResolvingLanguage] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return resolveBrowserOrFallbackLanguage();
  });

  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Initialize i18next with preferred language on mount
  useEffect(() => {
    const initAppLanguage = async () => {
      try {
        const saved = localStorage.getItem('mka_preferred_language');
        const token = localStorage.getItem('auth_token');

        // Priority 1: User's explicitly saved language in localStorage
        if (saved) {
          const normalized = normalizeLanguage(saved);
          const langCode = getLanguageCode(normalized).toLowerCase();
          await loadAndSetLanguage(langCode);
          setCurrentLanguage(normalized);
          setIsResolvingLanguage(false);
          return;
        }

        // Priority 2: If localStorage is empty and user is logged in, sync from DB profile once
        if (token && !token.startsWith('mock')) {
          const profileRes = await apiProfileService.getMyProfile().catch(() => null);
          const dbLang = profileRes?.data?.preferredLanguage;
          if (dbLang) {
            const normalized = normalizeLanguage(dbLang);
            const langCode = getLanguageCode(normalized).toLowerCase();
            await loadAndSetLanguage(langCode);
            setCurrentLanguage(normalized);
            localStorage.setItem('mka_preferred_language', normalized);
            setIsResolvingLanguage(false);
            return;
          }
        }

        // Priority 3: Fallback / Browser language
        const initialNorm = resolveBrowserOrFallbackLanguage();
        const code = getLanguageCode(initialNorm).toLowerCase();
        await loadAndSetLanguage(code);
        setCurrentLanguage(initialNorm);
      } catch (err) {
        console.warn('[LanguageContext] Language init warning:', err?.message || err);
      } finally {
        setIsResolvingLanguage(false);
      }
    };

    initAppLanguage();
  }, []);

  // Listen for login / account language change events
  useEffect(() => {
    const handleCustomLangChange = async (e) => {
      if (e.detail) {
        const norm = normalizeLanguage(e.detail);
        const code = getLanguageCode(norm).toLowerCase();
        await loadAndSetLanguage(code);
        setCurrentLanguage(norm);
        localStorage.setItem('mka_preferred_language', norm);
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    };
    window.addEventListener('mka_language_changed', handleCustomLangChange);
    return () => window.removeEventListener('mka_language_changed', handleCustomLangChange);
  }, [queryClient]);

  const changeLanguage = async (langCode) => {
    if (!langCode) return;
    const normalized = normalizeLanguage(langCode);
    const isoCode = getLanguageCode(normalized);
    const code = isoCode.toLowerCase();

    setIsTranslating(true);

    try {
      // 1. Activate in i18next & update HTML dir/lang attributes
      await loadAndSetLanguage(code);

      // 2. Update local state & storage
      setCurrentLanguage(normalized);
      setTranslationCache({});
      localStorage.setItem('mka_preferred_language', normalized);

      // 3. Sync to backend for logged-in users (skip mock tokens)
      const token = localStorage.getItem('auth_token');
      if (token && !token.startsWith('mock')) {
        await apiUserService.updateLanguage(isoCode).catch((err) => {
          console.warn('[LanguageContext] Preferred language backend sync warning:', err?.message || err);
        });
      }
    } catch (err) {
      console.error('[LanguageContext] Failed to change language:', err);
    } finally {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return ['comments', 'notifications', 'profile', 'chatMessages'].includes(key);
        },
      });

      setTimeout(() => {
        setIsTranslating(false);
      }, 300);
    }
  };

  /**
   * Thin wrapper around i18next supporting:
   * 1. Namespaced keys (e.g. t('nav.home'))
   * 2. Legacy UI_DICTIONARY keys (e.g. t('home', 'Home'))
   * 3. Interpolation options (e.g. t('topic.discussionsCount', '{{count}} discussions', { count: 5 }))
   */
  const t = useCallback((key, defaultText, options = {}) => {
    if (!key) return defaultText || '';

    // If options was passed as second argument
    let opt = options;
    let def = defaultText;
    if (typeof defaultText === 'object' && defaultText !== null) {
      opt = defaultText;
      def = opt.defaultValue;
    }

    const resolvedKey = LEGACY_KEY_MAP[key] || key;

    // Check if i18next has translation
    if (i18n.exists(resolvedKey)) {
      return i18n.t(resolvedKey, opt);
    }
    if (i18n.exists(key)) {
      return i18n.t(key, opt);
    }

    if (def !== undefined && def !== null) {
      return def;
    }

    const fallbackVal = i18n.t(resolvedKey, { defaultValue: def, ...opt });
    return fallbackVal || key;
  }, [currentLanguage]);

  /**
   * ON-DEMAND CONTENT TRANSLATION (User posts, comments, replies).
   * Unchanged: Calls backend OpenAI endpoint /api/posts/{id}/translate or /api/translation/translate
   */
  const translateTextAsync = async (text, targetLang = currentLanguage, sourceLang = null) => {
    if (!text || !text.trim()) return text;
    const normTarget = normalizeLanguage(targetLang);
    const isoTarget = getLanguageCode(normTarget);
    const isoSource = sourceLang ? getLanguageCode(sourceLang) : null;

    if (normTarget === 'English' && (!sourceLang || getLanguageCode(sourceLang) === 'EN')) {
      const hasNonEnglishScript = /[\u0900-\u0D7F\u0600-\u06FF]/.test(text);
      if (!hasNonEnglishScript) {
        return text;
      }
    }

    const cacheKey = `${isoSource || 'AUTO'}_${isoTarget}_${text.trim()}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];

    if (pendingTranslations.has(cacheKey)) {
      return pendingTranslations.get(cacheKey);
    }

    const promise = (async () => {
      try {
        const result = await apiTranslationService.translateText(text, isoTarget, isoSource);
        const finalVal = result || text;
        setTranslationCache((prev) => ({ ...prev, [cacheKey]: finalVal }));
        return finalVal;
      } catch (err) {
        return text;
      } finally {
        pendingTranslations.delete(cacheKey);
      }
    })();

    pendingTranslations.set(cacheKey, promise);
    return promise;
  };

  const translateText = useCallback((text, targetLang = currentLanguage, sourceLang = null) => {
    if (!text || !text.trim()) return text;
    const normTarget = normalizeLanguage(targetLang);
    const isoTarget = getLanguageCode(normTarget);
    const isoSource = sourceLang ? getLanguageCode(sourceLang) : null;

    const cacheKey = `${isoSource || 'AUTO'}_${isoTarget}_${text.trim()}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    return text;
  }, [currentLanguage, translationCache]);

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      t,
      translateText,
      translateTextAsync,
      supportedLanguages: SUPPORTED_LANGUAGES,
      isTranslating,
      isResolvingLanguage,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

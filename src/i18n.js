import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

export const SUPPORTED_LANG_CODES = [
  'en', 'hi', 'mr', 'bn', 'te', 'ta', 'gu', 'ur', 'kn', 'or',
  'ml', 'pa', 'as', 'sat', 'ks', 'mni', 'doi', 'bho'
];

export const RTL_LANG_CODES = ['ur', 'ks'];

// Dynamic loaders for each non-en language
const localeLoaders = {
  hi: () => import('./locales/hi.json'),
  mr: () => import('./locales/mr.json'),
  bn: () => import('./locales/bn.json'),
  te: () => import('./locales/te.json'),
  ta: () => import('./locales/ta.json'),
  gu: () => import('./locales/gu.json'),
  ur: () => import('./locales/ur.json'),
  kn: () => import('./locales/kn.json'),
  or: () => import('./locales/or.json'),
  ml: () => import('./locales/ml.json'),
  pa: () => import('./locales/pa.json'),
  as: () => import('./locales/as.json'),
  sat: () => import('./locales/sat.json'),
  ks: () => import('./locales/ks.json'),
  mni: () => import('./locales/mni.json'),
  doi: () => import('./locales/doi.json'),
  bho: () => import('./locales/bho.json'),
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    lng: 'en',
    fallbackLng: 'en',
    returnEmptyString: false,
    interpolation: {
      escapeValue: false, // React already safeguards against XSS
    },
  });

/**
 * Loads dynamic translation bundle on demand if not already cached,
 * then switches language and updates document lang / dir attributes.
 */
export async function loadAndSetLanguage(rawCode) {
  const code = (rawCode || 'en').toLowerCase().trim();
  const targetCode = SUPPORTED_LANG_CODES.includes(code) ? code : 'en';

  if (targetCode !== 'en' && !i18n.hasResourceBundle(targetCode, 'translation')) {
    if (localeLoaders[targetCode]) {
      try {
        const module = await localeLoaders[targetCode]();
        const data = module.default || module;
        i18n.addResourceBundle(targetCode, 'translation', data, true, true);
      } catch (err) {
        console.warn(`[i18n] Failed to load locale bundle for "${targetCode}":`, err);
      }
    }
  }

  await i18n.changeLanguage(targetCode);

  if (typeof document !== 'undefined') {
    document.documentElement.lang = targetCode;
    document.documentElement.dir = RTL_LANG_CODES.includes(targetCode) ? 'rtl' : 'ltr';
  }

  return targetCode;
}

export default i18n;

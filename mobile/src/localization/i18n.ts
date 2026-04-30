import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import hi from './hi.json';
import te from './te.json';
import kn from './kn.json';
import ta from './ta.json';

const LANGUAGE_KEY = 'user-language';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  kn: { translation: kn },
  ta: { translation: ta },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  
  if (!savedLanguage) {
    savedLanguage = 'en';
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
};

initI18n();

export default i18n;
export { LANGUAGE_KEY };

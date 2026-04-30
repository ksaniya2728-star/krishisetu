import Constants from 'expo-constants';

function pickBaseUrl() {
  const fromPublicEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromPublicEnv) return fromPublicEnv;

  const fromExtra =
    (Constants.expoConfig as any)?.extra?.API_BASE_URL ||
    (Constants.expoConfig as any)?.extra?.apiBaseUrl;
  if (fromExtra) return String(fromExtra);

  return 'http://192.168.1.10:5000/api';
}

export const API_BASE_URL = pickBaseUrl();


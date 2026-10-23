import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * MOOLA Mobile API Configuration
 * Automatically chooses the appropriate loopback host for Android Emulators vs iOS Simulators / Web,
 * or dynamically resolves the packager host IP for physical devices over Wi-Fi,
 * or reads from EXPO_PUBLIC_API_URL if configured.
 */
export function getApiBaseUrl(): string {
  // 1. Explicit environment variable override (e.g. production or ngrok tunnel)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // 2. Web browser (Chrome on laptop or mobile browser)
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:5000/api/v1`;
    }
    return 'http://localhost:5000/api/v1';
  }

  // 3. Dynamic resolution from Expo Metro bundler host (Physical device in Expo Go)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).linkingUri;

  if (hostUri) {
    const cleanUri = String(hostUri).replace(/^[a-zA-Z]+:\/\//, '');
    const hostIp = cleanUri.split(':')[0]?.split('/')[0];
    const isIpv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostIp);
    if (isIpv4 && hostIp !== '127.0.0.1' && hostIp !== '0.0.0.0') {
      return `http://${hostIp}:5000/api/v1`;
    }
  }

  // 4. Fallback to auto-detected LAN API URL written by dev launcher
  if (process.env.EXPO_PUBLIC_DEV_API_URL) {
    return process.env.EXPO_PUBLIC_DEV_API_URL.replace(/\/$/, '');
  }

  // 5. Android Emulator loopback alias (10.0.2.2 maps to host machine)
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api/v1';
  }

  // 6. Default fallback for iOS simulators and local dev
  return 'http://localhost:5000/api/v1';
}

export const API_CONFIG = {
  get baseUrl() {
    return getApiBaseUrl();
  },
  timeoutMs: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

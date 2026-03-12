import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import client from '../api/client';

const PUSH_TOKEN_KEY = 'push_token_registered';

// ─── Android notification channel ────────────────────────────────────────────

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('barsignal-default', {
    name: 'BarSignal',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function isPushSupported(): boolean {
  return Device.isDevice;
}

/**
 * Registers for push notifications.
 * - Checks the device is physical (not a simulator)
 * - Requests / verifies permission
 * - Obtains an Expo push token
 * - Configures the Android notification channel
 * - POSTs the token to POST /api/push/register
 * Returns the token string, or null if registration failed.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[Push] Push notifications are not supported on simulators.');
    return null;
  }

  await ensureAndroidChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Notification permission was not granted.');
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig
      ?.projectId;

  if (!projectId) {
    console.warn('[Push] No EAS project ID found in app config.');
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  // Only POST to the server if this token hasn't been registered yet.
  const registeredToken = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  if (registeredToken !== token) {
    await client.post('/api/push/register', {
      token,
      platform: Platform.OS,
    });
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  }

  return token;
}

/**
 * Unregisters the given push token from the server.
 */
export async function unregisterPushAsync(token: string): Promise<void> {
  await client.delete('/api/push/register', { data: { token } });
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}

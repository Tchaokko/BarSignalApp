import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  isPushSupported,
  registerForPushNotificationsAsync,
} from '../services/pushManager';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

export default function NotificationPermission() {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    Notifications.getPermissionsAsync().then(({ status: s }) =>
      setStatus(s as PermissionStatus),
    );
  }, []);

  // Nothing to show — supported and already granted, or not a physical device
  if (!isPushSupported() || status === null || status === 'granted') return null;

  const handleEnable = async () => {
    setRequesting(true);
    try {
      await registerForPushNotificationsAsync();
      const { status: refreshed } = await Notifications.getPermissionsAsync();
      setStatus(refreshed as PermissionStatus);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>🔔</Text>
      <View style={styles.textBlock}>
        <Text style={styles.title}>Stay in the loop</Text>
        <Text style={styles.body}>
          {status === 'denied'
            ? 'Notifications are blocked. Open Settings to turn them on.'
            : 'Enable notifications to know when your crew rallies.'}
        </Text>
      </View>

      {status === 'denied' ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={handleEnable}
          disabled={requesting}
        >
          {requesting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Enable</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  icon: { fontSize: 22 },
  textBlock: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 2 },
  body: { fontSize: 12, color: '#B45309', lineHeight: 16 },
  button: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 72,
  },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

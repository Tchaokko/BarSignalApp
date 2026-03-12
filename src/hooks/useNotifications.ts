import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import type { Subscription } from 'expo-notifications';
import { navigationRef } from '../navigation/navigationRef';
import { toastService } from '../services/toastService';
import {
  registerForPushNotificationsAsync,
  isPushSupported,
} from '../services/pushManager';

// Configure how notifications behave when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // We'll handle it ourselves via the listener
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications(): void {
  const receivedSub = useRef<Subscription | null>(null);
  const responseSub = useRef<Subscription | null>(null);

  useEffect(() => {
    if (!isPushSupported()) return;

    // Register and obtain token (fire-and-forget; errors are logged inside)
    registerForPushNotificationsAsync().catch((err) =>
      console.warn('[Push] Registration error:', err),
    );

    // Foreground notification: show the in-app banner
    receivedSub.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body } = notification.request.content;

        toastService.show(
          title ?? 'BarSignal',
          body ?? '',
          () => {
            if (!navigationRef.isReady()) return;
            navigationRef.navigate('Feed');
          },
        );
      },
    );

    // User tapped a notification: navigate to the feed
    responseSub.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        if (!navigationRef.isReady()) return;
        navigationRef.navigate('Feed');
      });

    return () => {
      receivedSub.current?.remove();
      responseSub.current?.remove();
    };
  }, []);
}

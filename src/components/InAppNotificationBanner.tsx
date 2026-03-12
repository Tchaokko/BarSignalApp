import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastService } from '../services/toastService';

const BANNER_HEIGHT = 80; // enough to fully hide above the screen
const VISIBLE_DURATION_MS = 4000;
const ANIM_DURATION_MS = 320;

interface ToastState {
  title: string;
  body: string;
  onPress?: () => void;
}

export default function InAppNotificationBanner() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisible = useRef(false);

  const hide = useCallback(() => {
    if (!isVisible.current) return;
    isVisible.current = false;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    Animated.timing(translateY, {
      toValue: -(BANNER_HEIGHT + insets.top),
      duration: ANIM_DURATION_MS,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [translateY, insets.top]);

  const show = useCallback(
    (title: string, body: string, onPress?: () => void) => {
      // If already visible, snap up then re-enter so the new content is seen
      if (isVisible.current) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        Animated.timing(translateY, {
          toValue: -(BANNER_HEIGHT + insets.top),
          duration: 160,
          useNativeDriver: true,
        }).start(() => {
          isVisible.current = false;
          show(title, body, onPress);
        });
        return;
      }

      setToast({ title, body, onPress });
      isVisible.current = true;
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIM_DURATION_MS,
        useNativeDriver: true,
      }).start();

      hideTimer.current = setTimeout(hide, VISIBLE_DURATION_MS);
    },
    [translateY, hide, insets.top],
  );

  useEffect(() => {
    toastService.register(show);
    return () => {
      toastService.unregister();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [show]);

  if (!toast) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ translateY }], paddingTop: insets.top + 8 },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.card}
        onPress={() => {
          hide();
          toast.onPress?.();
        }}
      >
        <Text style={styles.emoji}>🍺</Text>
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {toast.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {toast.body}
          </Text>
        </View>
        <TouchableOpacity onPress={hide} hitSlop={12} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  emoji: { fontSize: 22, flexShrink: 0 },
  textBlock: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
  body: { fontSize: 13, color: '#D1D5DB', lineHeight: 17 },
  close: { flexShrink: 0, paddingLeft: 4 },
  closeText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
});

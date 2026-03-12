import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { navigationRef } from './navigationRef';
import InAppNotificationBanner from '../components/InAppNotificationBanner';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

function NavigationRoot() {
  useNotifications();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <TabNavigator /> : <AuthNavigator />;
}

export default function AppNavigator() {
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Wait for persisted auth state to load before rendering navigation
  if (!isHydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <NavigationContainer ref={navigationRef}>
          <NavigationRoot />
        </NavigationContainer>
        {/* Rendered outside NavigationContainer so it overlays all screens */}
        <InAppNotificationBanner />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

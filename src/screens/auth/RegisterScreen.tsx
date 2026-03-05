import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { register, login, googleAuth } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

WebBrowser.maybeCompleteAuthSession();

// ─── Google OAuth client IDs ────────────────────────────────────────────────
// In Google Cloud Console, create two OAuth 2.0 clients:
//
//  iOS:     Type = "iOS", Bundle ID = host.exp.Exponent   (for Expo Go)
//  Android: Type = "Android", Package = host.exp.exponent (for Expo Go)
//           → SHA-1 not required for testing
//
// For production builds, create additional clients with your real bundle
// ID / package name and swap in those IDs below.
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '798608917464-fnv03nr45odp5hqdleu3tk2f6bdgorgb.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID = '798608917464-ipedpajgudmaol3a70roi380mccss7d4.apps.googleusercontent.com';

type AuthMode = 'login' | 'register';

export default function RegisterScreen() {
  const setToken = useAuthStore((s) => s.setToken);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // useIdTokenAuthRequest handles nonce/crypto internally and returns id_token directly.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  // Log the exact redirect URI the request will send to Google.
  useEffect(() => {
    if (request?.redirectUri) {
      console.log('[Google OAuth] redirect URI sent to Google:', request.redirectUri);
    }
  }, [request]);

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        handleGoogleToken(idToken);
      } else {
        Alert.alert('Google Sign-In failed', 'No ID token returned. Check your OAuth client type (must be iOS/Android, not Web).');
      }
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-In failed', response.error?.message ?? 'OAuth error');
    }
  }, [response]);

  const handleGoogleToken = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      const res = await googleAuth({ idToken });
      setToken(res.data.token);
    } catch (e: any) {
      const detail = e?.response?.data?.message ?? e?.message ?? 'Please try again.';
      Alert.alert('Google Sign-In failed', detail);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await login({ email, password });
      setToken(res.data.token);
    } catch (e: any) {
      const detail = e?.response?.data?.message ?? e?.message ?? 'Please try again.';
      Alert.alert('Sign in failed', detail);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await register({ email, password, displayName: displayName || null });
      setToken(res.data.token);
    } catch (e: any) {
      const detail = e?.response?.data?.message ?? e?.message ?? 'Please try again.';
      Alert.alert('Registration failed', detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BarSignal</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === 'login' && styles.activeTab]}
          onPress={() => setMode('login')}
        >
          <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'register' && styles.activeTab]}
          onPress={() => setMode('register')}
        >
          <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Register</Text>
        </TouchableOpacity>
      </View>

      {mode === 'register' && (
        <TextInput
          style={styles.input}
          placeholder="Display name (optional)"
          autoCapitalize="words"
          value={displayName}
          onChangeText={setDisplayName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={mode === 'login' ? handleLogin : handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{mode === 'login' ? 'Sign In' : 'Register'}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={[styles.googleButton, (!request || googleLoading) && styles.googleButtonDisabled]}
        onPress={() => promptAsync()}
        disabled={!request || googleLoading}
      >
        {googleLoading ? (
          <ActivityIndicator color="#444" />
        ) : (
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 32, textAlign: 'center', color: '#007AFF' },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontSize: 15, fontWeight: '500', color: '#888' },
  activeTabText: { color: '#000', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ddd' },
  dividerText: { marginHorizontal: 12, color: '#888', fontSize: 14 },
  googleButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  googleButtonDisabled: { opacity: 0.5 },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: '#444' },
});

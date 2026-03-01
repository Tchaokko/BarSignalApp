import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from '../api/client';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
  setHydrated: () => void;
}

// SecureStore adapter for Zustand persist middleware
const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      setToken: (token) => {
        SecureStore.setItemAsync(TOKEN_KEY, token);
        set({ token, isAuthenticated: true });
      },
      clearToken: () => {
        SecureStore.deleteItemAsync(TOKEN_KEY);
        set({ token: null, isAuthenticated: false });
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStoreAdapter),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

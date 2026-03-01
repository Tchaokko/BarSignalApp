# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BarSignalApp — a React Native Expo (managed workflow) + TypeScript mobile application (iOS & Android).

Users can register, manage their profile, and add/remove friends.

## Common Commands

```bash
# Install dependencies
npm install

# Start Metro bundler (Expo Go / simulator)
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Type-check (zero errors expected)
npx tsc --noEmit

# Run tests
npx jest

# Lint
npx eslint .
```

## Architecture

```
src/
├── types/api.ts               # TypeScript interfaces for all API request/response types
├── api/
│   ├── client.ts              # Axios instance with JWT interceptors
│   ├── auth.ts                # register(), googleAuth()
│   ├── friends.ts             # getFriends(), addFriend(), removeFriend()
│   └── profile.ts             # getProfile(), updateProfile()
├── store/
│   └── authStore.ts           # Zustand store — auth state, persisted via SecureStore
├── screens/
│   ├── auth/RegisterScreen.tsx
│   ├── friends/FriendsScreen.tsx
│   └── profile/ProfileScreen.tsx
└── navigation/
    ├── AppNavigator.tsx        # Root navigator — switches Auth ↔ Tab on isAuthenticated
    ├── AuthNavigator.tsx       # Native stack with RegisterScreen
    └── TabNavigator.tsx        # Bottom tabs: Friends | Profile
```

## Auth Flow

1. On launch, `AppNavigator` waits for `isHydrated` (Zustand rehydrates token from SecureStore).
2. If no token → `AuthNavigator` (Register screen).
3. On successful register → `setToken()` → store persists token → navigator switches to tabs.
4. Logout (`clearToken()`) → token deleted from SecureStore → navigator returns to Register.
5. 401 response from API → Axios interceptor auto-deletes token from SecureStore.

> There is no email/password login endpoint in the API. Auth is via `/auth/register` (email+password) or `/auth/google` (Google ID token).

## API Reference

Base URL is set in `src/api/client.ts` (`API_BASE_URL`). All endpoints require a `Bearer` JWT except `/auth/*`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account with email, password, displayName |
| POST | `/auth/google` | Sign in / register with Google ID token |
| GET | `/friends` | List current user's friends |
| POST | `/friends/{friendId}` | Add a friend by UUID |
| DELETE | `/friends/{friendId}` | Remove a friend by UUID |
| GET | `/profile` | Get current user's profile |
| PUT | `/profile` | Update display name |
| GET | `/health` | Health check |

Full spec: `Swagger/swaggerjson.json`

## Key Decisions

- **SecureStore** for JWT (hardware-backed, not AsyncStorage) via `expo-secure-store`.
- **Zustand `persist`** with a SecureStore adapter as single source of truth for auth state.
- **`isHydrated`** flag prevents a flash of the auth screen when the app launches for an already-logged-in user.
- **Axios request interceptor** reads the token from SecureStore on every request to avoid circular imports with the store.

## Response Types

All API `200` responses have no body schema in the Swagger spec. Types in `src/types/api.ts` (`AuthResponse`, `UserProfile`, `FriendsListResponse`) are inferred placeholders — update once tested against a live API.

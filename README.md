# BarSignalApp

A React Native mobile application (iOS & Android) built with Expo. Users can create an account, manage their profile, and add or remove friends.

## Tech stack

- **Expo** (managed workflow, SDK 55)
- **React Native** 0.83
- **TypeScript**
- **React Navigation** — native stack + bottom tabs
- **Zustand** — auth state, persisted to device secure storage
- **Axios** — HTTP client with automatic JWT injection
- **expo-secure-store** — hardware-backed token storage (iOS Keychain / Android Keystore)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/go) installed on your phone **or** an iOS/Android simulator

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set your API base URL
#    Open src/api/client.ts and update API_BASE_URL to point to your backend.
#    When testing on a physical device, use your machine's LAN IP, not localhost.

# 3. Start the Metro bundler
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS) to launch the app on your device.

## Running on a simulator

```bash
npx expo start --ios      # iOS simulator (macOS only)
npx expo start --android  # Android emulator
```

## Project structure

```
src/
├── types/api.ts               # TypeScript interfaces for API requests & responses
├── api/
│   ├── client.ts              # Axios instance — set API_BASE_URL here
│   ├── auth.ts                # register(), googleAuth()
│   ├── friends.ts             # getFriends(), addFriend(), removeFriend()
│   └── profile.ts             # getProfile(), updateProfile()
├── store/
│   └── authStore.ts           # Zustand auth store with SecureStore persistence
├── screens/
│   ├── auth/RegisterScreen.tsx
│   ├── friends/FriendsScreen.tsx
│   └── profile/ProfileScreen.tsx
└── navigation/
    ├── AppNavigator.tsx        # Root — switches between Auth and Tab navigator
    ├── AuthNavigator.tsx       # Unauthenticated flow (Register)
    └── TabNavigator.tsx        # Authenticated flow (Friends | Profile)
```

## API

The backend API spec is in [`Swagger/swaggerjson.json`](Swagger/swaggerjson.json).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create account with email, password, displayName |
| POST | `/auth/google` | No | Sign in / register with a Google ID token |
| GET | `/friends` | Yes | List friends |
| POST | `/friends/{id}` | Yes | Add a friend |
| DELETE | `/friends/{id}` | Yes | Remove a friend |
| GET | `/profile` | Yes | Get current user profile |
| PUT | `/profile` | Yes | Update display name |

## Notes

- There is no separate login screen — authentication is via `/auth/register` or `/auth/google`.
- The JWT token is stored in the device's secure enclave and injected automatically on every request.
- A 401 response from the API automatically clears the token and returns the user to the Register screen.
- `usesCleartextTraffic` is enabled on Android for local HTTP development. Switch to HTTPS and remove it before releasing to production.

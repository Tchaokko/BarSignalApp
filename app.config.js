/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: 'BarSignal',
    slug: 'BarSignal',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      usesCleartextTraffic: true,
      // In EAS builds, GOOGLE_SERVICES_JSON is injected as a file secret.
      // Locally, fall back to the file in the project root.
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      package: 'com.tchaokko.BarSignal',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-secure-store',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#1A73E8',
          defaultChannel: 'barsignal-default',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'bece6056-6823-4715-acbf-8e241f768b16',
      },
    },
  },
};

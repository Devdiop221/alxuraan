import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'alxuraan',
  slug: 'alxuraan',
  version: '1.0.0',
  web: {
    favicon: './assets/favicon.png',
  },
  newArchEnabled: true,
  experiments: {
    tsconfigPaths: true,
  },
  plugins: [
    [
      'expo-dev-launcher',
      {
        launchMode: 'most-recent',
      },
    ],
    [
      "expo-sensors",
      {
        "motionPermission": "Allow $(PRODUCT_NAME) to access your device motion"
      }
    ]
  ],
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    infoPlist: {
      UIBackgroundModes: ['audio'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.devdiop.alxuraan',
  },
  extra: {
    eas: {
      projectId: '3be13992-bd7b-47fc-b456-9ae6d1930709',
    },
  },
});

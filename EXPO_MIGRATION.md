# Expo Migration

PrayerStride is a mobile-first Expo app.

## Stack

- Expo + React Native
- Expo Router
- React Native `StyleSheet` styling via `src/mobile/theme.js`
- Firebase JS SDK for Auth and Firestore
- Expo Notifications for device push-token registration
- Cloudflare Worker for backend-triggered notifications
- EAS Build config for store builds

## Local Mobile Commands

```bash
npm start
npm run android
npm run ios
npm run build
```

`npm run build` runs `expo export` and verifies the native bundles.

## Environment

Expo reads `EXPO_PUBLIC_*` values from `.env.local`.

Required:

```txt
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_API_URL=
```

For local development, `EXPO_PUBLIC_API_URL` should point at the deployed Cloudflare Worker unless you are running Wrangler locally.

## Store Builds

Install/login to EAS, then run:

```bash
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

## Native Project Note

The active Android project lives in `android/` and is generated/maintained for Expo. The legacy Capacitor project and Vite web prototype have been removed from the repo.

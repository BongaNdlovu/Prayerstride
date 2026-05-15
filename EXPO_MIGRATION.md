# Expo Migration

PrayerStride is now scaffolded as a mobile-first Expo app.

## Stack

- Expo + React Native
- Expo Router
- NativeWind configured
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

The old Capacitor `android/` project is still in the repo until you explicitly approve removing or renaming it. Expo export currently uses `jsEngine: "jsc"` so it does not conflict with that old native folder.

For a clean Expo production app, the next step is to remove or rename the old Capacitor `android/` folder, then switch `app.json` back to Hermes by removing `"jsEngine": "jsc"` or setting it to `"hermes"`.

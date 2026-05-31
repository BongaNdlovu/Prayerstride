# PrayerStride

A daily prayer companion app built with Expo and React Native.

## Features

- **Splash & Onboarding** – Branded entry with welcome and reminder setup
- **Home Feed** – Daily prayer mission, streak counter, and prayer requests
- **Discover** – Search and browse prayers, people, and testimonies
- **Prayer Detail** – Read full requests, pray with one tap, leave encouragements
- **Create Request** – Share prayer needs with privacy and urgency controls
- **Testimonies (Praise)** – Celebrate answered prayers with the community
- **Profile** – Track your prayer stats and manage settings

## Tech Stack

- Expo + React Native
- Expo Router
- Firebase Auth and Firestore
- Expo Notifications
- Cloudflare Worker API

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Export production bundle
npm run build
```

## Project Structure

```text
app/                 # Expo Router entry
src/mobile/          # Mobile screens, hooks, API, and Firebase client
android/             # Expo native Android project
worker/              # Cloudflare Worker API
src/assets/          # Bundled scene images and shared assets
```

## Environment

Create `.env.local` with `EXPO_PUBLIC_*` values for Firebase and the Worker API URL. See [EXPO_MIGRATION.md](EXPO_MIGRATION.md) for the full list.

## Tests

```bash
npm test
npm run test:unit
npm run test:restored
```

## License

MIT

# Cloudflare Native Push Setup

PrayerStride uses this path for native push notifications:

1. The Expo app gets an FCM token through Expo Notifications.
2. The app sends that token to `/api/devices/register`.
3. Cloudflare Worker stores the token under `users/{uid}/devices/{tokenHash}` in Firestore.
4. Prayer/testimony actions call the Worker.
5. The Worker writes Firestore notifications and sends FCM pushes.

## Cloudflare Secrets

Set these in the Cloudflare dashboard or with Wrangler:

```bash
wrangler secret put FIREBASE_WEB_API_KEY
wrangler secret put FIREBASE_CLIENT_EMAIL
wrangler secret put FIREBASE_PRIVATE_KEY
```

Use values from Firebase:

- `FIREBASE_WEB_API_KEY`: your web API key from Firebase project settings.
- `FIREBASE_CLIENT_EMAIL`: `client_email` from a Firebase service account JSON key.
- `FIREBASE_PRIVATE_KEY`: `private_key` from that same JSON key.

Keep the private key exactly as Firebase gives it, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. If your shell asks for one-line input, paste it with `\n` line breaks.

## Cloudflare Deploy

This project has `wrangler.toml` configured for:

- Worker name: `prayerstride`
- Worker entry: `worker/index.js`
- Static assets: `dist`

Build and deploy:

```bash
npm run build
wrangler deploy
```

## App Environment

Set the Worker base URL in `.env.local`:

```txt
EXPO_PUBLIC_API_URL=https://your-worker-domain.workers.dev
```

## Endpoints Added

- `POST /api/devices/register`
- `POST /api/prayers/:id/pray`
- `POST /api/testimonies/:id/react`

All require:

```txt
Authorization: Bearer <Firebase ID token>
```

## Firebase Functions

Firebase Functions were removed from this repo for the no-Blaze path. Use Cloudflare for the action endpoints instead.

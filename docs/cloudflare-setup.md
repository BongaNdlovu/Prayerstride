# Cloudflare setup (PrayerStride)

## Local development

1. Create D1/R2 resources (once per account):

```bash
npx wrangler d1 create prayerstride-db-dev
npx wrangler r2 bucket create prayerstride-avatars-dev
```

1. Apply migrations:

```bash
npm run d1:migrate:local    # local D1 (wrangler dev)
npm run d1:migrate:dev      # remote dev D1 (--remote)
```

1. Run the Worker:

```bash
npx wrangler dev --env development
```

1. Point the mobile app at the local API:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8788
```

Use port **8788** if wrangler reports `Ready on http://127.0.0.1:8788` (8787 may already be in use).

## Profile + avatar pilot

- `GET /api/me/profile` — canonical profile read (lazy-hydrates D1 from Firestore)
- `POST /api/me/profile` — dual-writes profile fields to Firestore + D1
- `POST /api/me/avatar` — multipart JPEG upload to R2, updates canonical `photoURL`
- `GET /avatars/{uid}/profile.jpg` — public avatar proxy (404 when suspended/deleted/private)

Production API base: `https://api.prayerstride.app`

## Phase 3 (dual-write writes)

After updating schema:

```bash
npm run d1:migrate:local
npm run d1:migrate:dev
```

Worker-backed mobile writes (dual-write to Firestore + D1):

- Calendar: `POST/DELETE /api/calendar-events`, `POST /api/calendar-events/:id/update`, `POST/DELETE /api/calendar-bookmarks/:dateKey`
- Notifications: `POST /api/notifications/:id/read`, `POST /api/notifications/read-all`, `POST /api/notification-settings`
- Prayers: dual-write on create/update/mark-answered/pray/delete (D1 `prayers` + `prayer_prays`)

## Phase 5 (read APIs)

Mobile reads for profile, prayers, calendar, and notifications go through the Worker (D1 first, Firestore fallback when D1 is empty).

- `GET /api/prayers?scope=feed|community|mine|all&status=active|answered&category=&urgent=&cursor=&limit=30`
- `GET /api/calendar-events`, `GET /api/calendar-bookmarks`
- `GET /api/notifications`, `GET /api/notification-settings`

Additional read APIs (Firestore-backed in Worker, same security boundary):

- `GET /api/testimonies`
- `GET /api/announcements?includeArchived=1` (admin)
- `GET /api/devotions`, `GET /api/study-guides/:id`, `GET /api/study-guides/:id/lessons(/:lessonId)`
- `GET /api/prayer-sessions`
- `GET /api/admin/reports`, `GET /api/admin/users`
- `GET /api/blocks` (already used by mobile)

## Phase 6 (push tokens + notification stream) — complete

After migration `0003_push_tokens.sql`:

```bash
npm run d1:migrate:local
npm run d1:migrate:dev
```

- `POST /api/devices/register` dual-writes Expo/FCM tokens to D1 `push_tokens` and Firestore
- Push delivery reads D1 tokens first, then falls back to Firestore device subcollection
- `GET /api/me/notifications/stream` — WebSocket on `UserNotificationStream` DO (`ready`, `ping`/`pong`, `invalidate`)
- Worker calls `invalidateUserNotificationStream` after notification creates/reads (pray, testimony react, suspend, mark read)
- Mobile: `NotificationStreamGate` connects when signed in; `useNotifications` refetches on `invalidate` (Bearer header or `access_token` query for WebSocket)

## Phase 4 (Firestore → D1 backfill)

Idempotent upserts from Firestore into D1 (skips removed `following` / `encouragements` collections).

```bash
npm run d1:backfill                              # dry run (writes .d1-backfill/*.sql)
npm run d1:backfill -- --only=users,prayers      # subset
npm run d1:backfill -- --limit=10                # sample for smoke
npm run d1:backfill:execute                      # apply to local D1
npm run d1:backfill:remote                       # apply to remote dev D1
```

Requires the same Firebase service-account credentials as purge scripts (`GOOGLE_APPLICATION_CREDENTIALS` or `.env.local`).

# Cloudflare setup (PrayerStride)

## Local development

1. Create D1/R2 resources (once per account):

```bash
npx wrangler d1 create prayerstride-db-dev
npx wrangler r2 bucket create prayerstride-avatars-dev
```

2. Apply migrations:

```bash
npm run d1:migrate:local    # local D1 (wrangler dev)
npm run d1:migrate:dev      # remote dev D1 (--remote)
```

3. Run the Worker:

```bash
npx wrangler dev --env development
```

4. Point the mobile app at the local API:

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

# PrayerStride Release Checklist

Use this checklist before store submission. **Agent prepares code/tests; you approve production deploys and secrets.**

## Ownership

PrayerStride is proprietary software owned by you. It is not open source. Third-party fonts, icons, and SDKs remain under their own licenses.

## Wrangler secrets

Set production secrets with `wrangler secret put <NAME>`:

| Secret | Purpose |
| -------- | --------- |
| `OWNER_EMAIL` | Verified owner bootstrap email |
| `FIREBASE_PRIVATE_KEY` | Service-account credential |
| `FIREBASE_CLIENT_EMAIL` | Service-account identity |
| `FIREBASE_WEB_API_KEY` | Firebase token verification |
| `MODERATION_BLOCKLIST` | Optional comma-separated moderation override |
| `RESEND_API_KEY` | Guardian approval email delivery |
| `RESEND_FROM` | Verified sender, such as `PrayerStride <noreply@prayerstride.app>` |

Set `ALLOW_DEV_ORIGINS=true` only for local development.

## Wrangler vars

Configured in `wrangler.toml`:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET` - `end-of-time-94cd3.firebasestorage.app`
- `CORS_ORIGIN`
- Daily deletion-tombstone purge at 04:00 UTC

Optional: set `WORKER_PUBLIC_URL` when legal and guardian links should use a different public base.

## Consent audit trail

New registrations must accept the current Terms and Privacy Policy versions. The Worker stores:

- `termsAcceptedAt`
- `termsVersion`
- `privacyVersion`

Returning users continue to sign in without a new checkbox. When legal text changes materially, increment both version constants and add a re-acceptance flow before requiring acceptance again.

## Scene assets

Verify that `src/assets/compressed-scenes/1.jpg`-`6.jpg` contain your proprietary art before submission. Missing files fail the build.

```bash
node scripts/ensure-scene-assets.mjs
npm run test:scenes
```

## Interim legal pages

Public Privacy, Terms, and account-deletion pages are available. They currently
identify PrayerStride as an independently operated startup and state that a
service address is available upon lawful request.

Have counsel review Privacy, Terms, guardian-consent, and deletion copy before
store submission. POPIA review remains required because an interim notice is
not a substitute for legal advice.

## Firebase and IAM

1. Grant the Worker service account Firestore read/write, `firebaseauth.users.delete`, Storage object delete, and FCM send permissions.
2. Restrict Firebase client keys by package name, SHA-256 certificate fingerprint, and required API allowlist.
3. Run the admin migration in dry-run mode before applying it:

    ```bash
    OWNER_EMAIL=you@example.com node scripts/admin-migrate-admins.mjs --dry-run
    ```

4. Run the anonymous-content migration in dry-run mode before applying it:

    ```bash
    node scripts/migrate-anonymous-content.mjs --dry-run
    ```

## Resend

1. Verify the sending domain.
2. Set `RESEND_API_KEY` and `RESEND_FROM`.
3. Register a 16-17 test account and confirm guardian approval email delivery.

## Mobile env

- `EXPO_PUBLIC_API_URL` - Worker base URL
- `EXPO_PUBLIC_LEGAL_URL` - Worker public URL until custom-domain routing exists

## Store identity

Set the final identifiers in `app.json` before creating store binaries:

- `expo.android.package`
- `expo.ios.bundleIdentifier`

## Local verification

```bash
npm run test:unit
npm test
npm run test:rules
npx expo export --platform android
```

## Production deploy

Run Worker and rules deploys after code verification. Create store binaries only
after secrets, IAM, final store identifiers, and counsel review are complete:

```bash
npx wrangler deploy
firebase deploy --only firestore:rules
```

Verify public pages:

- `https://prayerstride.fanelesibonge50.workers.dev/privacy`
- `https://prayerstride.fanelesibonge50.workers.dev/terms`
- `https://prayerstride.fanelesibonge50.workers.dev/delete-account`

## Post-deploy smoke

1. Register an 18+ account, accept Terms and Privacy, and create a prayer.
2. Register a 16-17 account, approve the guardian email link, and confirm community access.
3. Attempt an under-16 registration and confirm rejection and cleanup.
4. Sign in as the verified owner and confirm admin bootstrap.
5. Block a user and confirm hidden content and suppressed notifications.
6. Delete an account after password confirmation and confirm Auth removal.
7. Pray twice for a weekly-limited request and confirm `Prayed This Week`.

## Follow-ups

- Custom claims for admin authorization
- Custom-domain routing
- Re-acceptance UI when legal versions change

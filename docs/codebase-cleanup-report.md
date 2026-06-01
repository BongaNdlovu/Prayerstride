# PrayerStride Codebase Cleanup Report

Track evidence, changed behavior, rollback, commands, and checkpoint result
for each batch in the cleanup roadmap (Batches 1–6 below).

## Baseline (before Batch 1)

- Branch: `main`
- `npm test`: pass, 99 tests
- `npm run test:rules`: pass
- `npx expo-doctor`: pass, 18/18
- `npx expo export --platform android`: pass
- Analytics hardening existed locally and landed first as Batch 1 (`5a82f3f`).

## Current status

- Batch 1: committed on `main` as `5a82f3f`
- Batches 2–6: implemented in the working tree; **not yet split into separate commits**
- Automated gates: green after Batch 6 (`npm test`, rules, audit, doctor, export, `test:restored`)
- Manual QA from the roadmap (sign-in, tab walkthrough, create/edit/delete prayer, stopwatch, admin analytics, block user) was **not** recorded in this report
- Follow-up fixes applied after the initial Batch 6 pass: manual Admin SDK migration notes in `RELEASE_CHECKLIST.md`, `buildWeeklyStats` regression test, and `stats-session.test.js` now imports `sessionStats`

---

## Batch 1 — Land existing analytics fixes

### Commit

- SHA: `5a82f3f`
- Subject: `fix(analytics): harden engagement metrics and admin panel`

### Batch 1 files

- `src/mobile/screens/AdminDashboardScreen.jsx` (+37 / -10)
- `src/mobile/admin-flow.test.js` (+7 / -0)
- `src/test/spiritual-engagement-metrics.test.js` (+10 / -3)
- `scripts/worker-smoke.mjs` (+2 / -0)

### Batch 1 behavior changes

- Worker clamps the `days` query parameter with
  `Math.min(90, Math.max(1, Math.floor(requestedDays)))` and falls back to
  30 when the value is non-finite.
- The endpoint returns `windowTooShortForRetention` and reports
  `retentionRate: null` when the requested window is under 14 days.
  AdminDashboardScreen renders `-` for retention in that case.
- Unused projection fields were dropped from spiritual-engagement Firestore
  reads (`prayedCount` on prayers; `authorUid` on prays).
- `AnalyticsPanel` guards stale responses with a request id and mounted ref;
  Retry is disabled while loading.
- The activity chart shows the latest 14 active days.

### Worker contract

- Path preserved: `GET /api/admin/spiritual-engagement`
- Additive response field: `windowTooShortForRetention`
- Auth unchanged: `requireAdmin(env, user)`

### Evidence (at commit time)

- `npm test` → 16 test files, 99 tests passed
- `npm run test:rules` → pass
- `npx expo-doctor` → 18/18
- `npx expo export --platform android` → pass

### Note after Batch 5

- Day normalization and metric computation later moved to
  `worker/spiritual-engagement.js`. Smoke tests now assert the clamp there,
  not in `worker/index.js`.

### Rollback

```bash
git revert 5a82f3f
```

---

### Batch 2 files

- `worker/index.js` — paginated `listDocuments`
- `src/mobile/sessionStats.js` (new)
- `src/mobile/screens/HomeScreen.jsx`
- `src/mobile/screens/ProfileScreen.jsx`
- `src/mobile/screens/MyStatsScreen.jsx`
- `src/test/worker/firestore-list.test.js` (new)
- `src/mobile/sessionStats.test.js` (new)

### Batch 2 behavior changes

- `listDocuments` paginates Firestore reads with `nextPageToken`
  (page size 300). All existing call sites (blocks, account deletion,
  devices, tombstones, and related walks) benefit automatically.
- Home **Prayer Time / Today** uses `todaySeconds`, not all-time totals.
- Home **People Helped / This Month** counts distinct `authorUid` values in
  the current calendar month.
- Profile and My Stats share streak, weekly aggregation, and duration
  formatting from `sessionStats.js`.

### Batch 2 evidence

- Session stat tests in `src/mobile/sessionStats.test.js`
- `stats-session.test.js` imports `formatPrayerTime` and `calculateStreak`
  from `sessionStats.js`

---

### Batch 3 files removed

- `src/mobile/components/MiniLineChart.jsx`
- `src/mobile/prayerFormHelpers.js`
- `scripts/admin-migrate-admins.mjs`
- `scripts/migrate-anonymous-content.mjs`

### Batch 3 files updated

- `src/mobile/navigation.test.js`
- `src/mobile/components/native-ui-source.test.js`
- `src/mobile/create-edit-prayers.test.js`
- `scripts/restored-feature-smoke.mjs`
- `RELEASE_CHECKLIST.md` — placeholder migration scripts replaced with
  manual / Admin SDK steps (owner bootstrap, admin audit, anonymous backfill)

### Batch 3 behavior changes

- No runtime references remain to deleted components or helpers.

---

### Batch 4 files removed

- `tailwindcss`, `postcss`, `autoprefixer` devDependencies
- `tailwind.config.cjs`, `postcss.config.js`, `global.css`
- `package.json` `overrides.postcss`

### Batch 4 files updated

- `package.json`, `package-lock.json`, `EXPO_MIGRATION.md`,
  `src/mobile/theme.js`

### Batch 4 behavior changes

---

### Batch 5 files

- `worker/spiritual-engagement.js` (new)
- `worker/index.js` — imports shared engagement + list helpers
- `src/mobile/screens/CreatePrayerScreen.jsx`
- `src/mobile/screens/EditRequestScreen.jsx`
- `src/test/spiritual-engagement-metrics.test.js`
- `scripts/worker-smoke.mjs`

### Batch 5 behavior changes

- Create/Edit prayer screens share privacy/category options
  and helper copy via `prayerFormOptions.js` (icons attached in screens).
- Spiritual engagement metrics and `days` normalization live in
  `worker/spiritual-engagement.js` with unit tests.
- Worker smoke reads both `index.js` and `spiritual-engagement.js`.

---

## Batch 6 — Document and verify

### Commands run

```bash
npm test
npm run test:rules
npm run audit:screens
npx expo-doctor
npx expo export --platform android
npm run test:all
npm run test:restored
```

### Evidence (initial pass)

- `npm test` → 18 files, 103 tests passed
- `npm run test:rules` → "All rules smoke tests passed."
- `npm run audit:screens` → all mobile screens OK
- `npx expo-doctor` → 18/18
- `npx expo export --platform android` → bundle
  `_expo/static/js/android/entry-af1d85210b17e4cecc7f05b62d44a0d3.hbc` (7.55 MB)
- `npm run test:restored` → 525 checks passed

### Environment note

Port 9399 was occupied by a stale emulator process during one `test:rules`
attempt; terminating that process allowed the gate to pass.

### Process gaps (honest status)

| Item | Status |
| --- | --- |
| One commit per batch (roadmap) | Only Batch 1 committed |
| Manual QA checklist | Not recorded |
| `RELEASE_CHECKLIST.md` migration replacement text | Added in follow-up |
| `buildWeeklyStats` regression test | Added in follow-up |
| `stats-session.test.js` using `sessionStats` | Updated in follow-up |

### Rollback (Batches 2–6)

Revert uncommitted changes for batches 2–6. Batch 1 remains at `5a82f3f`
unless reverted separately.

### Checkpoint result

- Automated roadmap gates: green
- Process/documentation follow-ups: addressed in this report and the files above
- Remaining optional work: per-batch commits, manual QA sign-off

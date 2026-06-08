# Manual Testing With Mock Data

Use mock data when you want to test the migrated UI without depending on live community content.

## Enable

Start Expo with one of the mock scripts so the public flag is set before the app
bundle is built:

```bash
npm run start:mock
npm run web:mock
```

Use `npm run start:mock:tunnel` if you need the tunnel host.

Alternatively, add this to `.env.local` before starting or exporting the app:

```bash
EXPO_PUBLIC_USE_MOCK_DATA=true
```

Then restart the dev server or rebuild the web export. Expo reads this value at
bundle time, so changing it while an app build is already running will not
switch an installed bundle into mock mode.

## What Changes

- The app boots straight into the local `Demo Admin` user.
- App data comes from local mock fixtures instead of the Worker API.
- Push registration and notification stream sockets are skipped in mock mode.

## What You Can Test

- Feed: swipe/step through urgent, active, answered, anonymous, and scripture-tagged prayers.
- Compose: create a prayer from the Home sheet.
- Update: use the own-prayer card to share an answered-prayer testimony.
- Timer: start, pause, reset, and log a prayer session.
- Calendar: view seeded events, add/update/delete an event, and bookmark dates.
- Content: open mock devotions and the Prayer Basics study guide lesson flow.
- Ranks: view podium, current user rank, and opt-in state.
- Stride: view sessions, streak, weekly chart, answered prayers, and testimonies.
- Profile: edit profile, open reminders, announcements, achievements, and admin dashboard.
- Notifications: mark one notification or all notifications as read.
- Reminders: toggle reminder preferences.
- Reports: submit a content report from a prayer detail screen.
- Admin: review mock reports, suspend/restore members, delete mock content, create/update/archive announcements, and inspect analytics.

## Disable

Set the flag back to false or remove it:

```bash
EXPO_PUBLIC_USE_MOCK_DATA=false
```

Restart or rebuild again so the app returns to the live Worker API.

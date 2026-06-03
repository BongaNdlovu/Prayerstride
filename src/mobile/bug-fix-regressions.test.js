import { describe, expect, it } from 'vitest';
import { formatRelativeFirestoreDate } from './sessionStats';

describe('bug fix regressions — batch 1 and 2', () => {
  it('PrayerDetailScreen declares hooks before null-prayer fallback', async () => {
    const source = await import('./screens/PrayerDetailScreen.jsx?raw');
    const hooksIndex = source.default.indexOf('useState(false)');
    const nullReturnIndex = source.default.indexOf('if (!prayer) return null');
    expect(hooksIndex).toBeGreaterThan(-1);
    expect(nullReturnIndex).toBeGreaterThan(hooksIndex);
    expect(source.default).toMatch(/prayingRef\.current/);
    expect(source.default).toMatch(/prayer\?\.id/);
  });

  it('AnsweredPrayersScreen guards signed-out user access', async () => {
    const source = await import('./screens/AnsweredPrayersScreen.jsx?raw');
    expect(source.default).toMatch(/user\?\.uid/);
    expect(source.default).not.toMatch(/user\.uid && p\.status/);
    expect(source.default).toMatch(/uid \? prayers\.filter/);
  });

  it('ProfileScreen uses optional chaining for user profile fields', async () => {
    const source = await import('./screens/ProfileScreen.jsx?raw');
    expect(source.default).toMatch(/user\?\.displayName/);
    expect(source.default).toMatch(/user\?\.photoURL/);
    expect(source.default).toMatch(/user\?\.email/);
  });

  it('MyPrayersScreen filters with optional user uid', async () => {
    const source = await import('./screens/MyPrayersScreen.jsx?raw');
    expect(source.default).toMatch(/const uid = user\?\.uid/);
    expect(source.default).toMatch(/uid \? prayers\.filter/);
    expect(source.default).not.toMatch(/prayer\.authorUid === user\.uid/);
  });

  it('updateCalendarEvent validates blank titles before trim', async () => {
    const source = await import('./useCalendarEvents.js?raw');
    expect(source.default).toMatch(/if \(!title\?\.trim\(\)\) throw new Error\('Enter an event title\.'\)/);
  });

  it('RemindersScreen patches only the toggled setting', async () => {
    const source = await import('./screens/RemindersScreen.jsx?raw');
    expect(source.default).toMatch(/updateNotificationSettings\(user\.uid, \{ \[id\]: value \}\)/);
    expect(source.default).not.toMatch(/prayerActivity: settings\.prayerActivity/);
  });

  it('PraiseDetailScreen ignores rapid duplicate reaction taps', async () => {
    const source = await import('./screens/PraiseDetailScreen.jsx?raw');
    expect(source.default).toMatch(/reactingRef\.current\.has\(key\)/);
  });

  it('testimony feed masks anonymous authors in the Worker serializer', async () => {
    const source = await import('../../worker/testimonies-read.js?raw');
    expect(source.default).toMatch(/authorName: isAnonymous \? 'Anonymous'/);
    expect(source.default).toMatch(/const isAnonymous = Boolean\(data\.isAnonymous\)/);
  });

  it('formatRelativeFirestoreDate returns conversational elapsed labels', () => {
    const now = Date.now();
    expect(formatRelativeFirestoreDate(new Date(now), '—')).toBe('Just now');
    expect(formatRelativeFirestoreDate(new Date(now - 30 * 60 * 1000), '—')).toBe('30m ago');
    expect(formatRelativeFirestoreDate(new Date(now - 2 * 60 * 60 * 1000), '—')).toBe('2h ago');
    expect(formatRelativeFirestoreDate(new Date(now - 3 * 24 * 60 * 60 * 1000), '—')).toBe('3d ago');
    expect(formatRelativeFirestoreDate(null, '—')).toBe('—');
  });

  it('PrayerCard uses relative timestamps and fallback body text', async () => {
    const source = await import('./components/PrayerCard.jsx?raw');
    expect(source.default).toMatch(/formatRelativeFirestoreDate/);
    expect(source.default).toMatch(/No details provided\./);
    expect(source.default).not.toMatch(/2h ago/);
  });

  it('TestimonyCard uses relative timestamps instead of hardcoded text', async () => {
    const source = await import('./components/TestimonyCard.jsx?raw');
    expect(source.default).toMatch(/formatRelativeFirestoreDate/);
    expect(source.default).not.toMatch(/2h ago/);
  });

  it('PraiseScreen reconciles optimistic reactions against server counts', async () => {
    const source = await import('./screens/PraiseScreen.jsx?raw');
    expect(source.default).toMatch(/pendingReactions/);
    expect(source.default).toMatch(/serverCount >= pending\.baseline \+ 1/);
    expect(source.default).toMatch(/reactingRef\.current/);
    expect(source.default).toMatch(/createdAt/);
  });

  it('CreateTestimonyScreen shows success alert before navigation', async () => {
    const source = await import('./screens/CreateTestimonyScreen.jsx?raw');
    expect(source.default).toMatch(/Alert\.alert\('Testimony shared'/);
    expect(source.default).toMatch(/onPress: \(\) => \{ if \(onDone\) onDone\(\); \}/);
    expect(source.default).not.toMatch(/if \(onDone\) onDone\(\);\s*\n\s*Alert\.alert\('Testimony shared'/);
  });

  it('PrimaryButton supports subdued secondary variant', async () => {
    const source = await import('./components/PrimaryButton.jsx?raw');
    expect(source.default).toMatch(/variant === 'secondary'/);
    expect(source.default).toMatch(/styles\.secondary/);
    expect(source.default).toMatch(/if \(isSecondary\) \{[\s\S]*styles\.secondary[\s\S]*\}[\s\S]*return \([\s\S]*LinearGradient/);
  });

  it('ScreenScaffold no longer exposes misleading onBack spacer prop', async () => {
    const source = await import('./components/ScreenScaffold.jsx?raw');
    expect(source.default).not.toMatch(/onBack/);
    expect(source.default).not.toMatch(/backSpacer/);
  });
});

describe('bug fix regressions — batch 3', () => {
  it('useReports loads admin reports through the Worker API', async () => {
    const source = await import('./useReports.js?raw');
    expect(source.default).toMatch(/getAdminReports/);
    expect(source.default).not.toMatch(/onSnapshot/);
  });

  it('useReports resets loading and error when an authorized subscription starts', async () => {
    const source = await import('./useReports.js?raw');
    expect(source.default).toMatch(/loading: adminLoading/);
    expect(source.default).toMatch(/setLoading\(true\)/);
    expect(source.default).toMatch(/setError\(null\)/);
    expect(source.default).not.toMatch(/useState\(isAdmin && enabled\)/);
  });

  it('useUsers keeps loading true while admin status resolves', async () => {
    const source = await import('./useUsers.js?raw');
    expect(source.default).toMatch(/loading: adminLoading/);
    expect(source.default).toMatch(/if \(adminLoading\) \{\s*setLoading\(true\)/);
    expect(source.default).not.toMatch(/useState\(isAdmin && enabled\)/);
  });

  it('Worker invalidates notification stream after writes', async () => {
    const helper = await import('../../worker/notification-stream.js?raw');
    const doSource = await import('../../worker/durable-objects/UserNotificationStream.js?raw');
    expect(helper.default).toMatch(/invalidateUserNotificationStream/);
    expect(doSource.default).toMatch(/internal\/invalidate/);
    expect(doSource.default).toMatch(/getWebSockets/);
  });

  it('useCalendarEvents loads events and bookmarks together from the API', async () => {
    const source = await import('./useCalendarEvents.js?raw');
    expect(source.default).toMatch(/Promise\.all/);
    expect(source.default).toMatch(/getCalendarEvents/);
    expect(source.default).toMatch(/getCalendarBookmarks/);
  });

  it('isValidCalendarDateKey rejects malformed and impossible dates', async () => {
    const { isValidCalendarDateKey } = await import('./useCalendarEvents.js');
    expect(isValidCalendarDateKey('2026-06-01')).toBe(true);
    expect(isValidCalendarDateKey('2026-13-01')).toBe(false);
    expect(isValidCalendarDateKey('2026-02-30')).toBe(false);
    expect(isValidCalendarDateKey('06-01-2026')).toBe(false);
    expect(isValidCalendarDateKey('2026-6-1')).toBe(false);
  });

  it('calendar mutations validate date keys before writing', async () => {
    const { createCalendarEvent, bookmarkDate } = await import('./useCalendarEvents.js');
    await expect(createCalendarEvent({ title: 'Pray', notes: '', dateKey: '2026-02-30' }, { uid: 'u1' }))
      .rejects.toThrow('Enter a valid date as YYYY-MM-DD.');
    await expect(bookmarkDate('not-a-date', { uid: 'u1' }))
      .rejects.toThrow('Enter a valid date as YYYY-MM-DD.');
  });

  it('registerForPushNotifications fails clearly when projectId is missing', async () => {
    const source = await import('./notifications.js?raw');
    expect(source.default).toMatch(/if \(!projectId\) \{/);
    expect(source.default).toMatch(/Missing Expo projectId/);
  });

  it('AuthScreen syncs local mode from route prop changes', async () => {
    const source = await import('./screens/AuthScreen.jsx?raw');
    expect(source.default).toMatch(/useEffect\(\(\) => \{\s*if \(initialMode\) setMode\(initialMode\)/);
  });
});

describe('bug fix regressions — batch 4', () => {
  it('deleteContentAndActions queries notifications by relatedId instead of listing all', async () => {
    const source = await import('../../worker/index.js?raw');
    const fnBody = source.default.match(/async function deleteContentAndActions[\s\S]*?\n\}/)?.[0] || '';
    expect(fnBody).toMatch(/runCollectionGroupQuery\(env, 'notifications'/);
    expect(fnBody).toMatch(/fieldPath: 'relatedId'/);
    expect(fnBody).toMatch(/stringValue: relatedId/);
    expect(fnBody).not.toMatch(/listDocuments\(env, docName\(env, 'notifications'\)\)/);
    expect(fnBody).not.toMatch(/\.filter\(\(document\) => fromFirestoreFields/);
  });
});

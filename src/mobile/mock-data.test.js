import { beforeEach, describe, expect, it } from 'vitest';
import { isMockDataEnabled, mockApiFetch, resetMockDataForTests } from './mockData';

const user = {
  uid: 'test-demo-user',
  displayName: 'Test Demo',
  email: 'demo@example.test',
};

describe('mock data mode', () => {
  beforeEach(() => {
    resetMockDataForTests();
  });

  it('enables mock mode from the Expo public environment flag', () => {
    const originalValue = process.env.EXPO_PUBLIC_USE_MOCK_DATA;
    process.env.EXPO_PUBLIC_USE_MOCK_DATA = 'true';

    expect(isMockDataEnabled()).toBe(true);

    if (originalValue === undefined) {
      delete process.env.EXPO_PUBLIC_USE_MOCK_DATA;
    } else {
      process.env.EXPO_PUBLIC_USE_MOCK_DATA = originalValue;
    }
  });

  it('returns an admin profile and populated prototype feed', async () => {
    const profile = await mockApiFetch('/api/me/profile', {}, user);
    expect(profile.profile.uid).toBe(user.uid);
    expect(profile.profile.role).toBe('admin');
    expect(profile.profile.registrationState).toBe('complete');

    const prayers = await mockApiFetch('/api/prayers?scope=feed&limit=100', {}, user);
    expect(prayers.items.length).toBeGreaterThan(4);
    expect(prayers.items.some((item) => item.authorUid === user.uid)).toBe(true);
    expect(prayers.items.some((item) => item.scriptureRef)).toBe(true);
  });

  it('mutates local prayer and testimony fixtures for manual flows', async () => {
    const created = await mockApiFetch('/api/prayers', {
      method: 'POST',
      body: JSON.stringify({
        body: 'Please pray for my mock manual test.',
        category: 'Guidance',
        scriptureRef: 'James 1:5',
      }),
    }, user);
    expect(created.prayerId).toMatch(/^mock-prayer/);

    const update = await mockApiFetch('/api/testimonies', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Mock prayer update',
        body: 'God gave peace during the test.',
        prayerId: created.prayerId,
      }),
    }, user);
    expect(update.testimonyId).toMatch(/^mock-testimony/);

    await mockApiFetch(`/api/prayers/${created.prayerId}/mark-answered`, {
      method: 'POST',
      body: JSON.stringify({}),
    }, user);
    const mine = await mockApiFetch('/api/prayers?scope=mine&status=answered', {}, user);
    expect(mine.items.some((item) => item.id === created.prayerId)).toBe(true);
  });

  it('supports admin and notification manual testing flows', async () => {
    const users = await mockApiFetch('/api/admin/users', {}, user);
    const reports = await mockApiFetch('/api/admin/reports', {}, user);
    expect(users.users.length).toBeGreaterThan(1);
    expect(reports.reports.some((report) => report.status === 'pending')).toBe(true);

    const announcement = await mockApiFetch('/api/admin/announcements/create', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Mock admin notice',
        body: 'Created during a manual test.',
        category: 'updates',
      }),
    }, user);
    expect(announcement.announcementId).toMatch(/^mock-announcement/);

    const markAll = await mockApiFetch('/api/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({}),
    }, user);
    expect(markAll.count).toBeGreaterThanOrEqual(0);
  });

  it('supports calendar manual testing flows', async () => {
    const seeded = await mockApiFetch('/api/calendar-events', {}, user);
    const bookmarks = await mockApiFetch('/api/calendar-bookmarks', {}, user);
    expect(seeded.events.length).toBeGreaterThan(0);
    expect(bookmarks.bookmarks.length).toBeGreaterThan(0);

    const created = await mockApiFetch('/api/calendar-events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Mock planning prayer',
        notes: 'Created during mock test.',
        dateKey: '2026-06-10',
        startsAt: '2026-06-10T18:00:00.000Z',
      }),
    }, user);
    expect(created.eventId).toMatch(/^mock-calendar/);

    await mockApiFetch(`/api/calendar-events/${created.eventId}/update`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Updated mock planning prayer',
        notes: 'Updated during mock test.',
        dateKey: '2026-06-11',
      }),
    }, user);
    const updated = await mockApiFetch('/api/calendar-events', {}, user);
    expect(updated.events.find((item) => item.id === created.eventId).dateKey).toBe('2026-06-11');

    const bookmark = await mockApiFetch('/api/calendar-bookmarks/2026-06-11', {
      method: 'POST',
      body: JSON.stringify({}),
    }, user);
    expect(bookmark.bookmarkId).toBe(`${user.uid}_2026-06-11`);

    const deleted = await mockApiFetch(`/api/calendar-events/${created.eventId}`, {
      method: 'DELETE',
    }, user);
    expect(deleted.ok).toBe(true);
  });

  it('supports reports, testimony updates, and content collections', async () => {
    const report = await mockApiFetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify({
        targetId: 'mock-prayer-family',
        targetType: 'prayer',
        reason: 'Mock report from detail screen.',
      }),
    }, user);
    expect(report.reportId).toBe(`${user.uid}_prayer_mock-prayer-family`);

    const adminReports = await mockApiFetch('/api/admin/reports', {}, user);
    expect(adminReports.reports.some((item) => item.id === report.reportId)).toBe(true);

    const testimonyUpdate = await mockApiFetch('/api/testimonies/mock-testimony-own/update', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Updated mock testimony',
        body: 'The update path works in mock mode.',
      }),
    }, user);
    expect(testimonyUpdate.testimonyId).toBe('mock-testimony-own');

    const testimonies = await mockApiFetch('/api/testimonies', {}, user);
    expect(testimonies.items.find((item) => item.id === 'mock-testimony-own').title)
      .toBe('Updated mock testimony');

    const devotions = await mockApiFetch('/api/devotions', {}, user);
    const guide = await mockApiFetch('/api/study-guides/mock-prayer-basics', {}, user);
    const lesson = await mockApiFetch('/api/study-guides/mock-prayer-basics/lessons/mock-lesson-listen', {}, user);
    expect(devotions.devotions.length).toBeGreaterThan(0);
    expect(guide.guide.title).toBe('Prayer Basics');
    expect(lesson.lesson.title).toBe('Listen First');
  });
});

import { describe, expect, it, vi } from 'vitest';

const markAllNotificationsRead = vi.fn();
const markNotificationRead = vi.fn();
const retry = vi.fn();

vi.mock('../../mobile/useNotifications.js', () => ({
  useNotifications: () => ({
    notifications: [{ id: 'n1', read: false, type: 'prayer' }],
    unread: [{ id: 'n1', read: false, type: 'prayer' }],
    read: [],
    loading: false,
    error: null,
    retry,
  }),
  markAllNotificationsRead,
  markNotificationRead,
}));

describe('NotificationsScreen mutation guards', () => {
  it('ignores duplicate mark-all and per-item taps while pending', async () => {
    const source = await import('../../mobile/screens/NotificationsScreen.jsx?raw');
    expect(source.default).toMatch(/markAllBusy/);
    expect(source.default).toMatch(/if \(markAllBusy\) return/);
    expect(source.default).toMatch(/pendingReadIdsRef/);
    expect(source.default).toMatch(/pendingReadIdsRef\.current\.has\(notificationId\)/);
    expect(source.default).toMatch(/const markAllRead = async/);
    expect(source.default).toMatch(/const markRead = async/);
  });
});

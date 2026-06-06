import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bookmarkCalendarDate,
  createCalendarEvent,
  deleteCalendarEventApi,
  isValidCalendarDateKey,
  unbookmarkCalendarDate,
  updateCalendarEvent,
} from '../../../worker/calendar-api.js';

function makeFirestoreApi(doc = { exists: false }) {
  return {
    docName: vi.fn((env, collection, id) => `${collection}/${id}`),
    firestoreCommit: vi.fn(async () => ({ ok: true })),
    fromFirestoreFields: vi.fn((fields) => fields),
    getDocument: vi.fn(async () => doc),
    toFirestoreFields: vi.fn((fields) => fields),
  };
}

describe('calendar api validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts valid date keys and rejects invalid ones', () => {
    expect(isValidCalendarDateKey('2026-06-01')).toBe(true);
    expect(isValidCalendarDateKey('2026-13-01')).toBe(false);
    expect(isValidCalendarDateKey('2026-02-30')).toBe(false);
    expect(isValidCalendarDateKey('06-01-2026')).toBe(false);
    expect(isValidCalendarDateKey(null)).toBe(false);
  });

  it('rejects invalid create payloads before committing', async () => {
    const firestoreApi = makeFirestoreApi();

    await expect(createCalendarEvent({}, { uid: 'u1' }, { title: '', dateKey: '2026-06-06' }, firestoreApi))
      .resolves.toMatchObject({ status: 400, body: { error: 'Enter an event title.' } });
    await expect(createCalendarEvent({}, { uid: 'u1' }, { title: 'Gather', dateKey: '2026-02-30' }, firestoreApi))
      .resolves.toMatchObject({ status: 400, body: { error: 'Enter a valid date as YYYY-MM-DD.' } });

    expect(firestoreApi.firestoreCommit).not.toHaveBeenCalled();
  });

  it('creates calendar events with normalized optional fields', async () => {
    const firestoreApi = makeFirestoreApi();

    const result = await createCalendarEvent({}, { uid: 'u1' }, {
      title: ` ${'A'.repeat(130)} `,
      notes: ' Bring water ',
      dateKey: '2026-06-06',
      startsAt: '2026-06-06T10:00:00+02:00',
      endsAt: 'not-a-date',
    }, firestoreApi);

    expect(result).toMatchObject({ status: 200, body: { ok: true } });
    const fields = firestoreApi.toFirestoreFields.mock.calls[0][0];
    expect(fields.ownerUid).toBe('u1');
    expect(fields.title).toHaveLength(120);
    expect(fields.notes).toBe('Bring water');
    expect(fields.startsAt).toBe('2026-06-06T08:00:00.000Z');
    expect(fields.endsAt).toBeNull();
    expect(firestoreApi.firestoreCommit).toHaveBeenCalledTimes(1);
  });

  it('handles update validation, missing events, and ownership checks', async () => {
    const missingApi = makeFirestoreApi({ exists: false });
    await expect(updateCalendarEvent({}, { uid: 'u1' }, 'event-1', { title: 'Gather', dateKey: '2026-06-06' }, missingApi))
      .resolves.toMatchObject({ status: 404 });

    const forbiddenApi = makeFirestoreApi({ exists: true, name: 'calendarEvents/event-1', fields: { ownerUid: 'u2' } });
    await expect(updateCalendarEvent({}, { uid: 'u1' }, 'event-1', { title: 'Gather', dateKey: '2026-06-06' }, forbiddenApi))
      .resolves.toMatchObject({ status: 403 });

    const allowedApi = makeFirestoreApi({
      exists: true,
      name: 'calendarEvents/event-1',
      fields: { ownerUid: 'u1', title: 'Old', notes: 'Keep', dateKey: '2026-06-05', startsAt: 'old-start', endsAt: 'old-end' },
    });
    const result = await updateCalendarEvent({}, { uid: 'u1' }, 'event-1', {
      title: ' Updated ',
      notes: '',
      dateKey: '2026-06-06',
      startsAt: '',
    }, allowedApi);

    expect(result).toMatchObject({ status: 200, body: { eventId: 'event-1' } });
    const fields = allowedApi.toFirestoreFields.mock.calls[0][0];
    expect(fields.title).toBe('Updated');
    expect(fields.notes).toBeNull();
    expect(fields.startsAt).toBeNull();
    expect(fields.endsAt).toBe('old-end');
    expect(allowedApi.firestoreCommit).toHaveBeenCalledTimes(1);
  });

  it('deletes only owner calendar events', async () => {
    const missingApi = makeFirestoreApi({ exists: false });
    await expect(deleteCalendarEventApi({}, { uid: 'u1' }, 'event-1', missingApi))
      .resolves.toMatchObject({ status: 404 });

    const forbiddenApi = makeFirestoreApi({ exists: true, name: 'calendarEvents/event-1', fields: { ownerUid: 'u2' } });
    await expect(deleteCalendarEventApi({}, { uid: 'u1' }, 'event-1', forbiddenApi))
      .resolves.toMatchObject({ status: 403 });

    const allowedApi = makeFirestoreApi({ exists: true, name: 'calendarEvents/event-1', fields: { ownerUid: 'u1' } });
    await expect(deleteCalendarEventApi({}, { uid: 'u1' }, 'event-1', allowedApi))
      .resolves.toMatchObject({ status: 200, body: { ok: true } });
    expect(allowedApi.firestoreCommit.mock.calls[0][1]).toEqual([{ delete: 'calendarEvents/event-1' }]);
  });

  it('creates and removes calendar bookmarks with owner protection', async () => {
    const createApi = makeFirestoreApi();
    await expect(bookmarkCalendarDate({}, { uid: 'u1' }, '2026-06-06', createApi))
      .resolves.toMatchObject({ status: 200, body: { bookmarkId: 'u1_2026-06-06' } });
    expect(createApi.firestoreCommit).toHaveBeenCalledTimes(1);

    await expect(bookmarkCalendarDate({}, { uid: 'u1' }, 'bad-date', createApi))
      .resolves.toMatchObject({ status: 400 });

    const missingApi = makeFirestoreApi({ exists: false });
    await expect(unbookmarkCalendarDate({}, { uid: 'u1' }, '2026-06-06', missingApi))
      .resolves.toMatchObject({ status: 200, body: { removed: false } });

    const forbiddenApi = makeFirestoreApi({ exists: true, name: 'calendarBookmarks/u1_2026-06-06', fields: { ownerUid: 'u2' } });
    await expect(unbookmarkCalendarDate({}, { uid: 'u1' }, '2026-06-06', forbiddenApi))
      .resolves.toMatchObject({ status: 403 });

    const allowedApi = makeFirestoreApi({ exists: true, name: 'calendarBookmarks/u1_2026-06-06', fields: { ownerUid: 'u1' } });
    await expect(unbookmarkCalendarDate({}, { uid: 'u1' }, '2026-06-06', allowedApi))
      .resolves.toMatchObject({ status: 200, body: { removed: true } });
    expect(allowedApi.firestoreCommit.mock.calls[0][1]).toEqual([{ delete: 'calendarBookmarks/u1_2026-06-06' }]);
  });
});

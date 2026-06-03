import {
  listCalendarBookmarksForOwner,
  listCalendarEventsForOwner,
} from './db/calendar-repository.js';

function serializeCalendarEventFromFirestore(id, data) {
  return {
    id,
    ownerUid: data.ownerUid,
    title: data.title || '',
    notes: data.notes || '',
    dateKey: data.dateKey,
    startsAt: data.startsAt ?? null,
    endsAt: data.endsAt ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function serializeCalendarBookmarkFromFirestore(id, data) {
  return {
    id,
    ownerUid: data.ownerUid,
    dateKey: data.dateKey,
    createdAt: data.createdAt,
  };
}

async function listEventsFromFirestore(env, user, firestoreApi) {
  const docs = await firestoreApi.runCollectionQuery(env, 'calendarEvents', [{
    fieldFilter: {
      field: { fieldPath: 'ownerUid' },
      op: 'EQUAL',
      value: { stringValue: user.uid },
    },
  }], [{ field: { fieldPath: 'dateKey' }, direction: 'ASCENDING' }]);

  return docs.map((doc) => {
    const id = doc.name.split('/').pop();
    return serializeCalendarEventFromFirestore(id, firestoreApi.fromFirestoreFields(doc.fields));
  });
}

async function listBookmarksFromFirestore(env, user, firestoreApi) {
  const docs = await firestoreApi.runCollectionQuery(env, 'calendarBookmarks', [{
    fieldFilter: {
      field: { fieldPath: 'ownerUid' },
      op: 'EQUAL',
      value: { stringValue: user.uid },
    },
  }], []);

  return docs.map((doc) => {
    const id = doc.name.split('/').pop();
    return serializeCalendarBookmarkFromFirestore(id, firestoreApi.fromFirestoreFields(doc.fields));
  });
}

export async function getMyCalendarEvents(env, user, firestoreApi) {
  let events = await listCalendarEventsForOwner(env, user.uid);
  if (events == null || events.length === 0) {
    events = await listEventsFromFirestore(env, user, firestoreApi);
  }
  return { status: 200, body: { events } };
}

export async function getMyCalendarBookmarks(env, user, firestoreApi) {
  let bookmarks = await listCalendarBookmarksForOwner(env, user.uid);
  if (bookmarks == null || bookmarks.length === 0) {
    bookmarks = await listBookmarksFromFirestore(env, user, firestoreApi);
  }
  return { status: 200, body: { bookmarks } };
}

const CATEGORY_LABELS = {
  events: 'Events',
  prayer: 'Prayer',
  updates: 'Updates',
};

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function serializeAnnouncement(id, data) {
  const startsAt = parseDate(data.startsAt);
  const endsAt = parseDate(data.endsAt);
  const category = data.category || 'updates';
  return {
    id,
    title: data.title || '',
    body: data.body || '',
    category,
    categoryLabel: CATEGORY_LABELS[category] || 'Updates',
    startsAt: startsAt ? startsAt.toISOString() : (data.startsAt || null),
    endsAt: endsAt ? endsAt.toISOString() : (data.endsAt || null),
    status: data.status || 'active',
    createdByUid: data.createdByUid ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    displayDate: startsAt
      ? startsAt.toLocaleDateString([], { month: 'short', day: 'numeric' })
      : '',
    displayTime: startsAt
      ? startsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : '',
  };
}

export async function getAnnouncementsFeed(env, url, firestoreApi, isAdmin) {
  const includeArchived = isAdmin && (
    url.searchParams.get('includeArchived') === '1'
    || url.searchParams.get('includeArchived') === 'true'
  );

  const filters = includeArchived
    ? []
    : [{
      fieldFilter: {
        field: { fieldPath: 'status' },
        op: 'EQUAL',
        value: { stringValue: 'active' },
      },
    }];

  const docs = await firestoreApi.runCollectionQuery(
    env,
    'announcements',
    filters,
    [{ field: { fieldPath: 'startsAt' }, direction: 'DESCENDING' }],
  );

  let items = docs.map((doc) => {
    const id = doc.name.split('/').pop();
    return serializeAnnouncement(id, firestoreApi.fromFirestoreFields(doc.fields));
  });

  if (!includeArchived) {
    const now = Date.now();
    items = items.filter((item) => {
      if (item.status !== 'active') return false;
      if (!item.endsAt) return true;
      const ends = parseDate(item.endsAt);
      return ends && ends.getTime() > now;
    });
  }

  return { status: 200, body: { announcements: items } };
}

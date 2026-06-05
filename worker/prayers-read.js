const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;
const SCOPES = new Set(['feed', 'community', 'mine', 'all']);
const STATUSES = new Set(['active', 'answered']);

function clampLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

function encodeCursor(createdAt, id) {
  return btoa(JSON.stringify({ createdAt, id })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeCursor(value) {
  if (!value) return null;
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    const parsed = JSON.parse(json);
    if (!parsed?.createdAt || !parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function serializePrayerRow(row) {
  const isAnonymous = row.is_anonymous === 1;
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    authorUid: row.author_uid,
    authorName: isAnonymous ? 'Anonymous' : (row.author_name || 'Anonymous'),
    isAnonymous,
    prayedCount: row.prayed_count ?? 0,
    status: row.status || 'active',
    privacy: row.privacy || 'community',
    category: row.category || '',
    scriptureRef: row.scripture_ref || '',
    prayerLimit: row.prayer_limit || 'daily',
    urgent: row.urgent === 1,
    allowShare: row.allow_share !== 0,
    createdAt: row.created_at,
  };
}

export function serializePrayerFromFirestore(id, data) {
  const isAnonymous = Boolean(data.isAnonymous);
  return {
    id,
    title: data.title,
    body: data.body,
    authorUid: data.authorUid,
    authorName: isAnonymous ? 'Anonymous' : (data.authorName || 'Anonymous'),
    isAnonymous,
    prayedCount: data.prayedCount || 0,
    status: data.status || 'active',
    privacy: data.privacy || 'community',
    category: data.category || '',
    scriptureRef: data.scriptureRef || '',
    prayerLimit: data.prayerLimit || 'daily',
    urgent: Boolean(data.urgent),
    allowShare: data.allowShare !== false,
    createdAt: data.createdAt,
  };
}

function categoryMatches(prayer, category) {
  if (!category) return true;
  const normalized = category.trim().toLowerCase();
  if (!normalized || normalized === 'all') return true;
  const stored = prayer.category?.toLowerCase();
  if (stored === normalized) return true;
  const text = `${prayer.title || ''} ${prayer.body || ''} ${prayer.scriptureRef || ''}`.toLowerCase();
  const keywords = {
    health: ['health', 'healing', 'sick', 'hospital', 'medical', 'cancer', 'surgery'],
    family: ['family', 'marriage', 'child', 'parent', 'spouse', 'son', 'daughter'],
    finances: ['finance', 'money', 'job', 'debt', 'provision', 'financial', 'work'],
    relationships: ['relationship', 'friend', 'conflict', 'forgive', 'lonely', 'breakup'],
  };
  return (keywords[normalized] || [normalized]).some((keyword) => text.includes(keyword));
}

function buildD1Query(scope, userUid, status, category, urgentOnly, cursor, limit) {
  const clauses = [];
  const binds = [];

  if (scope === 'community') {
    clauses.push("privacy = 'community'");
  } else if (scope === 'mine') {
    clauses.push('author_uid = ?');
    binds.push(userUid);
  } else if (scope === 'all') {
    // no scope filter
  } else {
    clauses.push("(privacy = 'community' OR author_uid = ?)");
    binds.push(userUid);
  }

  if (status) {
    clauses.push('status = ?');
    binds.push(status);
  }
  if (urgentOnly) {
    clauses.push('urgent = 1');
  }
  if (category) {
    clauses.push('LOWER(COALESCE(category, \'\')) = ?');
    binds.push(category.trim().toLowerCase());
  }
  if (cursor) {
    clauses.push('(created_at < ? OR (created_at = ? AND id < ?))');
    binds.push(cursor.createdAt, cursor.createdAt, cursor.id);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT * FROM prayers ${where} ORDER BY created_at DESC, id DESC LIMIT ?`;
  binds.push(limit + 1);
  return { sql, binds };
}

async function listPrayersFromD1(env, options) {
  if (!env.DB) return [];
  const { sql, binds } = buildD1Query(
    options.scope,
    options.userUid,
    options.status,
    options.category,
    options.urgentOnly,
    options.cursor,
    options.limit,
  );
  const statement = env.DB.prepare(sql);
  const result = await statement.bind(...binds).all();
  return (result.results || []).map(serializePrayerRow);
}

async function listPrayersFromFirestore(env, firestoreApi, options) {
  const filters = [];
  if (options.scope === 'community') {
    filters.push({
      fieldFilter: {
        field: { fieldPath: 'privacy' },
        op: 'EQUAL',
        value: { stringValue: 'community' },
      },
    });
  } else if (options.scope === 'mine') {
    filters.push({
      fieldFilter: {
        field: { fieldPath: 'authorUid' },
        op: 'EQUAL',
        value: { stringValue: options.userUid },
      },
    });
  }

  if (options.status) {
    filters.push({
      fieldFilter: {
        field: { fieldPath: 'status' },
        op: 'EQUAL',
        value: { stringValue: options.status },
      },
    });
  }

  const orderByFields = [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }];
  const docs = await firestoreApi.runCollectionQuery(env, 'prayers', filters, orderByFields);

  let items = docs.map((doc) => {
    const id = doc.name.split('/').pop();
    return serializePrayerFromFirestore(id, firestoreApi.fromFirestoreFields(doc.fields));
  });

  if (options.scope === 'feed') {
    const own = await firestoreApi.runCollectionQuery(env, 'prayers', [{
      fieldFilter: {
        field: { fieldPath: 'authorUid' },
        op: 'EQUAL',
        value: { stringValue: options.userUid },
      },
    }], orderByFields);
    const byId = new Map(items.map((item) => [item.id, item]));
    own.forEach((doc) => {
      const id = doc.name.split('/').pop();
      byId.set(id, serializePrayerFromFirestore(id, firestoreApi.fromFirestoreFields(doc.fields)));
    });
    items = Array.from(byId.values());
  }

  if (options.urgentOnly) {
    items = items.filter((item) => item.urgent);
  }
  if (options.category) {
    items = items.filter((item) => categoryMatches(item, options.category));
  }

  items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

  if (options.cursor) {
    const cursorAt = options.cursor.createdAt;
    const cursorId = options.cursor.id;
    items = items.filter((item) => (
      String(item.createdAt) < cursorAt
      || (String(item.createdAt) === cursorAt && String(item.id) < cursorId)
    ));
  }

  return items.slice(0, options.limit + 1);
}

export async function getPrayersFeed(env, user, url, firestoreApi, requireAdmin) {
  const params = url.searchParams;
  const scope = params.get('scope') || 'feed';
  if (!SCOPES.has(scope)) {
    return { status: 400, body: { error: 'Invalid scope. Use feed, community, mine, or all.' } };
  }
  if (scope === 'all') {
    await requireAdmin(env, user);
  }

  const statusParam = params.get('status');
  const status = statusParam && STATUSES.has(statusParam) ? statusParam : null;
  const category = params.get('category') || '';
  const urgentOnly = params.get('urgent') === '1' || params.get('urgent') === 'true';
  const limit = clampLimit(params.get('limit'));
  const cursor = decodeCursor(params.get('cursor'));

  const options = {
    scope,
    userUid: user.uid,
    status,
    category,
    urgentOnly,
    cursor,
    limit,
  };

  let items = await listPrayersFromD1(env, options);
  if (!items.length) {
    items = await listPrayersFromFirestore(env, firestoreApi, options);
  }

  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last?.createdAt && last?.id
    ? encodeCursor(String(last.createdAt), String(last.id))
    : null;

  return {
    status: 200,
    body: {
      items: page,
      nextCursor,
    },
  };
}

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 100;

function clampLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

export function serializeTestimony(id, data) {
  const isAnonymous = Boolean(data.isAnonymous);
  return {
    id,
    title: data.title,
    body: data.body,
    authorUid: data.authorUid,
    authorName: isAnonymous ? 'Anonymous' : (data.authorName || 'Anonymous'),
    isAnonymous,
    amen: data.amen || 0,
    praiseGod: data.praiseGod || 0,
    prayerId: data.prayerId ?? null,
    createdAt: data.createdAt,
  };
}

export async function getTestimoniesFeed(env, url, firestoreApi) {
  const limit = clampLimit(url.searchParams.get('limit'));
  const docs = await firestoreApi.runCollectionQuery(
    env,
    'testimonies',
    [],
    [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
  );
  const items = docs.slice(0, limit).map((doc) => {
    const id = doc.name.split('/').pop();
    return serializeTestimony(id, firestoreApi.fromFirestoreFields(doc.fields));
  });
  return { status: 200, body: { items } };
}

export function serializePrayerSession(id, data) {
  return {
    id,
    authorUid: data.authorUid,
    prayerId: data.prayerId,
    title: data.title || 'Prayer session',
    seconds: Number(data.seconds || 0),
    createdAt: data.createdAt,
  };
}

export async function getMyPrayerSessions(env, user, firestoreApi) {
  const docs = await firestoreApi.runCollectionQuery(
    env,
    'prayerSessions',
    [{
      fieldFilter: {
        field: { fieldPath: 'authorUid' },
        op: 'EQUAL',
        value: { stringValue: user.uid },
      },
    }],
    [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
  );

  const sessions = docs.map((doc) => {
    const id = doc.name.split('/').pop();
    return serializePrayerSession(id, firestoreApi.fromFirestoreFields(doc.fields));
  });

  return { status: 200, body: { sessions } };
}

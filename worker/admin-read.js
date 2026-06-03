import { serializeProfile } from './profile.js';

export function serializeReport(id, data) {
  return {
    id,
    targetId: data.targetId,
    targetType: data.targetType,
    reason: data.reason,
    reportedByUid: data.reportedByUid,
    status: data.status || 'pending',
    createdAt: data.createdAt,
  };
}

export async function getAdminReports(env, firestoreApi) {
  const docs = await firestoreApi.runCollectionQuery(
    env,
    'reports',
    [],
    [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
  );
  const reports = docs.map((doc) => {
    const id = doc.name.split('/').pop();
    return serializeReport(id, firestoreApi.fromFirestoreFields(doc.fields));
  });
  return { status: 200, body: { reports } };
}

export async function getAdminUsers(env, firestoreApi) {
  const docs = await firestoreApi.runCollectionQuery(
    env,
    'users',
    [],
    [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
  );
  const users = docs.map((doc) => {
    const uid = doc.name.split('/').pop();
    const data = firestoreApi.fromFirestoreFields(doc.fields);
    return {
      id: uid,
      ...serializeProfile({ uid, ...data, id: uid }),
      email: data.email ?? null,
      registrationState: data.registrationState ?? null,
    };
  });
  return { status: 200, body: { users } };
}

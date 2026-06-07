export function serializeDevotion(id, data) {
  return { id, ...data };
}

export function serializeStudyGuide(id, data) {
  if (!data || data.status !== 'active') return null;
  return { id, ...data };
}

export function serializeLesson(id, data) {
  if (!data || data.status !== 'active') return null;
  return { id, ...data };
}

export async function getDevotions(env, firestoreApi) {
  let docs;
  try {
    docs = await firestoreApi.runCollectionQuery(
      env,
      'devotions',
      [{
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: 'active' },
        },
      }],
      [{ field: { fieldPath: 'order' }, direction: 'ASCENDING' }],
    );
  } catch {
    docs = (await firestoreApi.listDocuments(env, firestoreApi.docName(env, 'devotions')))
      .filter((doc) => firestoreApi.fromFirestoreFields(doc.fields || {}).status === 'active');
  }

  const devotions = docs.map((doc) => {
    const id = doc.name.split('/').pop();
    return serializeDevotion(id, firestoreApi.fromFirestoreFields(doc.fields));
  }).sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  return { status: 200, body: { devotions } };
}

export async function getStudyGuide(env, guideId, firestoreApi) {
  const doc = await firestoreApi.getDocument(env, firestoreApi.docName(env, 'studyGuides', guideId));
  if (!doc.exists) return { status: 404, body: { error: 'Study guide not found.' } };
  const data = firestoreApi.fromFirestoreFields(doc.fields);
  const guide = serializeStudyGuide(guideId, data);
  if (!guide) return { status: 404, body: { error: 'Study guide not found.' } };
  return { status: 200, body: { guide } };
}

export async function getStudyGuideLesson(env, guideId, lessonId, firestoreApi) {
  if (lessonId) {
    const doc = await firestoreApi.getDocument(
      env,
      firestoreApi.docName(env, 'studyGuides', guideId, 'lessons', lessonId),
    );
    if (!doc.exists) return { status: 404, body: { error: 'Lesson not found.' } };
    const lesson = serializeLesson(lessonId, firestoreApi.fromFirestoreFields(doc.fields));
    if (!lesson) return { status: 404, body: { error: 'Lesson not found.' } };
    return { status: 200, body: { lesson } };
  }

  let docs;
  try {
    docs = await firestoreApi.listDocuments(
      env,
      firestoreApi.docName(env, 'studyGuides', guideId, 'lessons'),
    );
  } catch {
    docs = [];
  }

  const lessons = docs
    .map((doc) => {
      const id = doc.name.split('/').pop();
      return serializeLesson(id, firestoreApi.fromFirestoreFields(doc.fields));
    })
    .filter(Boolean)
    .sort((a, b) => Number(a.day || 0) - Number(b.day || 0));

  const lesson = lessons[0] || null;
  return { status: 200, body: { lesson } };
}

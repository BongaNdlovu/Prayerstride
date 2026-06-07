import { describe, expect, it, vi } from 'vitest';
import { getDevotions, getStudyGuideLesson } from '../../../worker/content-read.js';

function makeFirestoreApi({ queryDocs = [], listDocs = [], queryError = null, listError = null } = {}) {
  return {
    docName: vi.fn((_env, ...parts) => parts.join('/')),
    fromFirestoreFields: vi.fn((fields = {}) => fields),
    runCollectionQuery: vi.fn(async () => {
      if (queryError) throw queryError;
      return queryDocs;
    }),
    listDocuments: vi.fn(async () => {
      if (listError) throw listError;
      return listDocs;
    }),
  };
}

describe('content read fallbacks', () => {
  it('falls back to listed devotions when the structured query fails', async () => {
    const firestoreApi = makeFirestoreApi({
      queryError: new Error('missing index'),
      listDocs: [
        { name: 'devotions/inactive', fields: { status: 'archived', order: 1, title: 'Hidden' } },
        { name: 'devotions/second', fields: { status: 'active', order: 2, title: 'Second' } },
        { name: 'devotions/first', fields: { status: 'active', order: 1, title: 'First' } },
      ],
    });

    const result = await getDevotions({}, firestoreApi);

    expect(result.status).toBe(200);
    expect(result.body.devotions.map((item) => item.title)).toEqual(['First', 'Second']);
  });

  it('returns no default lesson when lesson listing fails', async () => {
    const firestoreApi = makeFirestoreApi({ listError: new Error('list failed') });

    const result = await getStudyGuideLesson({}, 'guide-1', null, firestoreApi);

    expect(result).toEqual({ status: 200, body: { lesson: null } });
  });
});

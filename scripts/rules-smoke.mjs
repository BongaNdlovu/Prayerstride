import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROJECT_ID = 'prayerstride-test';
const rules = readFileSync(resolve('firestore.rules'), 'utf-8');

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: { rules },
});

async function seedFixtures() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.doc('users/admin-user').set({
      uid: 'admin-user',
      email: 'admin@test.com',
      displayName: 'Admin',
      role: 'admin',
      owner: true,
    });

    await db.doc('users/user-a').set({
      uid: 'user-a',
      email: 'a@test.com',
      displayName: 'User A',
      role: 'user',
      owner: false,
    });

    await db.doc('users/user-b').set({
      uid: 'user-b',
      email: 'b@test.com',
      displayName: 'User B',
      role: 'user',
      owner: false,
    });

    await db.doc('notifications/notification-a').set({
      recipientUid: 'user-a',
      type: 'prayer_activity',
      message: 'Test notification',
      read: false,
      createdAt: new Date(),
      relatedId: null,
    });
  });
}

async function runTests() {
  await testEnv.clearFirestore();
  await seedFixtures();

  const aDb = testEnv.authenticatedContext('user-a', { email: 'a@test.com' }).firestore();
  const bDb = testEnv.authenticatedContext('user-b', { email: 'b@test.com' }).firestore();
  const adminDb = testEnv.authenticatedContext('admin-user', { email: 'admin@test.com' }).firestore();
  const unauthDb = testEnv.unauthenticatedContext().firestore();

  await assertSucceeds(aDb.doc('users/user-a').get());
  await assertSucceeds(aDb.doc('users/user-a').update({ displayName: 'Updated User A' }));
  await assertFails(aDb.doc('users/user-b').get());

  await assertFails(unauthDb.collection('prayers').get());
  await assertSucceeds(aDb.collection('prayers').get());

  const prayerRef = aDb.collection('prayers').doc('prayer-a');
  await assertSucceeds(prayerRef.set({
    title: 'Test',
    body: 'Test body',
    authorUid: 'user-a',
    authorName: 'User A',
    isAnonymous: false,
    prayedCount: 0,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await assertSucceeds(bDb.collection('prayers').doc('prayer-a').get());
  await assertFails(bDb.collection('prayers').doc('prayer-a').delete());
  await assertSucceeds(prayerRef.update({ status: 'answered' }));
  await assertSucceeds(adminDb.collection('prayers').doc('prayer-a').delete());

  const reportRef = aDb.collection('reports').doc('report-a');
  await assertSucceeds(reportRef.set({
    targetId: 'target-1',
    targetType: 'prayer',
    reason: 'Test report',
    reportedByUid: 'user-a',
    status: 'pending',
    createdAt: new Date(),
  }));

  await assertFails(aDb.collection('reports').get());
  await assertSucceeds(adminDb.collection('reports').get());
  await assertSucceeds(adminDb.collection('reports').doc('report-a').update({ status: 'resolved' }));
  await assertSucceeds(adminDb.collection('reports').doc('report-a').update({ status: 'dismissed' }));
  await assertFails(adminDb.collection('reports').doc('report-a').update({ targetId: 'changed' }));

  await assertFails(aDb.collection('notifications').doc('bad-create').set({
    recipientUid: 'user-a',
    type: 'test',
    message: 'Test',
    read: false,
    createdAt: new Date(),
    relatedId: null,
  }));

  await assertSucceeds(aDb.collection('notifications').doc('notification-a').get());
  await assertSucceeds(aDb.collection('notifications').doc('notification-a').update({ read: true }));
  await assertFails(bDb.collection('notifications').doc('notification-a').get());

  console.log('All rules smoke tests passed.');
}

runTests()
  .then(() => testEnv.cleanup())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Rules test failed:', err);
    process.exit(1);
  });

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
      createdAt: new Date(),
    });

    await db.doc('users/user-a').set({
      uid: 'user-a',
      email: 'a@test.com',
      displayName: 'User A',
      role: 'user',
      owner: false,
      photoURL: null,
      createdAt: new Date(),
    });

    await db.doc('users/user-b').set({
      uid: 'user-b',
      email: 'b@test.com',
      displayName: 'User B',
      role: 'user',
      owner: false,
      photoURL: null,
      createdAt: new Date(),
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

const prayerDoc = (authorUid = 'user-a') => ({
  title: 'Test',
  body: 'Test body',
  authorUid,
  authorName: authorUid,
  isAnonymous: false,
  prayedCount: 0,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  privacy: 'community',
  urgent: false,
  allowShare: true,
});

const testimonyDoc = (authorUid = 'user-a') => ({
  title: 'Answered',
  body: 'God answered.',
  authorUid,
  authorName: authorUid,
  isAnonymous: false,
  amen: 0,
  praiseGod: 0,
  shared: false,
  prayerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

async function runTests() {
  await testEnv.clearFirestore();
  await seedFixtures();

  const aDb = testEnv.authenticatedContext('user-a', { email: 'a@test.com' }).firestore();
  const bDb = testEnv.authenticatedContext('user-b', { email: 'b@test.com' }).firestore();
  const adminDb = testEnv.authenticatedContext('admin-user', { email: 'admin@test.com' }).firestore();
  const unauthDb = testEnv.unauthenticatedContext().firestore();

  await assertSucceeds(aDb.doc('users/user-a').get());
  await assertSucceeds(aDb.doc('users/user-a').update({ displayName: 'Updated User A', bio: 'Short bio' }));
  await assertFails(aDb.doc('users/user-a').update({ role: 'admin' }));
  await assertFails(aDb.doc('users/user-b').get());
  await assertFails(aDb.doc('users/user-b').update({ displayName: 'Hacked' }));
  await assertFails(aDb.doc('users/user-a').delete());

  await assertFails(unauthDb.collection('prayers').get());
  await assertSucceeds(aDb.collection('prayers').get());

  const prayerRef = aDb.collection('prayers').doc('prayer-a');
  await assertSucceeds(prayerRef.set(prayerDoc()));
  await assertFails(prayerRef.update({ prayedCount: 12 }));
  await assertFails(prayerRef.update({ authorUid: 'user-b' }));
  await assertFails(prayerRef.update({ status: 'archived' }));
  await assertSucceeds(prayerRef.update({ status: 'answered', updatedAt: new Date() }));
  await assertFails(bDb.collection('prayers').doc('prayer-a').delete());
  await assertSucceeds(adminDb.collection('prayers').doc('prayer-a').delete());

  const testimonyRef = aDb.collection('testimonies').doc('testimony-a');
  await assertSucceeds(testimonyRef.set(testimonyDoc()));
  await assertFails(testimonyRef.update({ amen: 99 }));
  await assertFails(testimonyRef.update({ praiseGod: 99 }));
  await assertSucceeds(testimonyRef.update({ title: 'Updated', updatedAt: new Date() }));

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

  await assertSucceeds(aDb.collection('encouragements').doc('encouragement-a').set({
    threadId: 'prayer-a',
    authorUid: 'user-a',
    authorName: 'User A',
    text: 'Praying with you.',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await assertFails(aDb.collection('encouragements').doc('encouragement-b').set({
    threadId: 'prayer-a',
    authorUid: 'user-a',
    authorName: 'User A',
    text: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await assertSucceeds(aDb.collection('prayerSessions').doc('session-a').set({
    authorUid: 'user-a',
    title: 'Morning prayer',
    seconds: 120,
    prayerId: null,
    createdAt: new Date(),
  }));
  await assertFails(aDb.collection('prayerSessions').doc('session-b').set({
    authorUid: 'user-a',
    title: 'Invalid',
    seconds: 999999,
    createdAt: new Date(),
  }));

  await assertSucceeds(aDb.doc('notificationSettings/user-a').set({
    prayerActivity: false,
    testimonyReactions: true,
    pushEnabled: false,
    updatedAt: new Date(),
  }));
  await assertFails(bDb.doc('notificationSettings/user-a').get());

  console.log('All rules smoke tests passed.');
}

runTests()
  .then(() => testEnv.cleanup())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Rules test failed:', err);
    process.exit(1);
  });

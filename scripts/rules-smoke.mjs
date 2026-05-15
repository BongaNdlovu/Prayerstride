import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROJECT_ID = 'prayerstride-test';
const rules = readFileSync(resolve('firestore.rules'), 'utf-8');

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: { rules },
});

const USER_A = { uid: 'user-a', email: 'a@test.com' };
const USER_B = { uid: 'user-b', email: 'b@test.com' };
const ADMIN_USER = { uid: 'admin-user', email: 'admin@test.com' };

const UNAUTH = null;

async function setupRoles() {
  const adminDb = testEnv.authenticatedContext(ADMIN_USER).firestore();
  await adminDb.doc('users/admin-user').set({
    uid: 'admin-user',
    email: 'admin@test.com',
    displayName: 'Admin',
    role: 'admin',
  });
  await adminDb.doc('users/user-a').set({
    uid: 'user-a',
    email: 'a@test.com',
    displayName: 'User A',
    role: 'user',
  });
}

async function runTests() {
  await testEnv.clearFirestore();
  await setupRoles();

  // 1. Users: self read/write, cross-user reject
  const aDb = testEnv.authenticatedContext(USER_A, { email_verified: true }).firestore();
  await assertSucceeds(aDb.doc('users/user-a').set({ uid: 'user-a', role: 'user' }));
  await assertSucceeds(aDb.doc('users/user-a').get());
  await assertFails(aDb.doc('users/user-b').get());

  // 2. Signed-in user reads prayers
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(unauthDb.collection('prayers').get());
  await assertSucceeds(aDb.collection('prayers').get());

  // 3. Author can update own prayer; non-author cannot delete
  const prayerRef = aDb.collection('prayers').doc();
  await assertSucceeds(prayerRef.set({
    title: 'Test',
    body: 'Test body',
    authorUid: 'user-a',
    authorName: 'User A',
    isAnonymous: false,
    prayedCount: 0,
    status: 'active',
  }));

  const bDb = testEnv.authenticatedContext(USER_B, { email_verified: true }).firestore();
  const bPrayerRef = bDb.collection('prayers').doc(prayerRef.id);
  await assertSucceeds(bPrayerRef.get());
  await assertFails(bPrayerRef.delete());
  await assertSucceeds(prayerRef.update({ status: 'answered' }));

  // 4. Admin can delete any prayer
  const adminDbCtx = testEnv.authenticatedContext(ADMIN_USER, { email_verified: true }).firestore();
  const adminPrayerRef = adminDbCtx.collection('prayers').doc(prayerRef.id);
  await assertSucceeds(adminPrayerRef.delete());

  // 5. Signed-in user can create a report
  const reportRef = aDb.collection('reports').doc();
  await assertSucceeds(reportRef.set({
    targetId: 'target-1',
    targetType: 'prayer',
    reason: 'Test report',
    reportedByUid: 'user-a',
    status: 'pending',
  }));

  // 6. Non-admin cannot read reports
  await assertFails(aDb.collection('reports').get());

  // 7. Admin can read/update reports
  const adminReportRef = adminDbCtx.collection('reports').doc(reportRef.id);
  await assertSucceeds(adminDbCtx.collection('reports').get());
  await assertSucceeds(adminReportRef.update({ status: 'resolved' }));
  await assertSucceeds(adminReportRef.update({ status: 'dismissed' }));
  await assertFails(aDb.doc(`reports/${reportRef.id}`).get());

  // 8. Recipient can read/update own notification; cannot create notifications
  const notificationRef = adminDbCtx.collection('notifications').doc();
  await assertFails(aDb.collection('notifications').doc().set({
    recipientUid: 'user-a',
    type: 'test',
    message: 'Test',
    read: false,
  }));

  const existingNotificationRef = adminDbCtx.collection('notifications').doc();
  await existingNotificationRef.set({
    recipientUid: 'user-a',
    type: 'prayer_activity',
    message: 'Test notification',
    read: false,
  });

  const aNotificationRef = aDb.collection('notifications').doc(existingNotificationRef.id);
  await assertSucceeds(aNotificationRef.get());
  await assertSucceeds(aNotificationRef.update({ read: true }));
  await assertFails(bDb.collection('notifications').doc(existingNotificationRef.id).get());

  console.log('All rules smoke tests passed.');
}

runTests()
  .then(() => testEnv.cleanup())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Rules test failed:', err);
    process.exit(1);
  });

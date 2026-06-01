import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { Timestamp } from 'firebase/firestore';
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

    await db.doc('users/suspended-admin').set({
      uid: 'suspended-admin',
      email: 'suspended-admin@test.com',
      displayName: 'Suspended Admin',
      role: 'admin',
      owner: false,
      suspended: true,
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

    await db.doc('users/user-a/following/following-a').set({
      displayName: 'Followed User',
      handle: '@followed',
      createdAt: new Date(),
    });

    await db.doc('devotions/devotion-a').set({
      title: 'Published devotion',
      reference: 'Psalm 23',
      status: 'active',
      order: 1,
    });

    await db.doc('devotions/devotion-archived').set({
      title: 'Archived devotion',
      reference: 'Psalm 24',
      status: 'archived',
      order: 2,
    });

    await db.doc('studyGuides/guide-a').set({
      title: 'Published guide',
      status: 'active',
      order: 1,
    });

    await db.doc('studyGuides/guide-a/lessons/lesson-a').set({
      title: 'Published lesson',
      body: 'Lesson body',
      status: 'active',
      day: 1,
    });

    await db.doc('studyGuides/guide-a/lessons/lesson-archived').set({
      title: 'Archived lesson',
      body: 'Old lesson',
      status: 'archived',
      day: 2,
    });

    await db.doc('prayers/prayer-a').set(prayerDoc());
    await db.doc('prayers/prayer-linked').set(prayerDoc());
    await db.doc('testimonies/testimony-a').set(testimonyDoc());
    await db.doc('encouragements/encouragement-a').set({
      threadId: 'prayer-linked',
      authorUid: 'user-a',
      authorName: 'User A',
      text: 'Praying with you.',
      createdAt: new Date(),
      updatedAt: new Date(),
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
  const suspendedAdminDb = testEnv.authenticatedContext('suspended-admin', { email: 'suspended-admin@test.com' }).firestore();
  const unauthDb = testEnv.unauthenticatedContext().firestore();

  await assertSucceeds(aDb.doc('users/user-a').get());
  await assertSucceeds(aDb.doc('users/user-a').update({ displayName: 'Updated User A', bio: 'Short bio' }));
  await assertFails(aDb.doc('users/user-a').update({ role: 'admin' }));
  await assertFails(aDb.doc('users/user-a').update({ owner: true }));
  await assertFails(aDb.doc('users/user-b').get());
  await assertFails(aDb.doc('users/user-b').update({ displayName: 'Hacked' }));
  await assertFails(aDb.doc('users/user-a').delete());

  await assertFails(unauthDb.collection('prayers').get());
  await assertSucceeds(aDb.collection('prayers').get());

  const prayerRef = aDb.collection('prayers').doc('prayer-new');
  await assertFails(prayerRef.set(prayerDoc()));
  await assertFails(aDb.collection('prayers').doc('prayer-a').update({ title: 'Updated', updatedAt: new Date() }));
  await assertFails(aDb.collection('prayers').doc('prayer-a').update({ prayedCount: 12 }));
  await assertFails(aDb.collection('prayers').doc('prayer-a').delete());
  await assertFails(bDb.collection('prayers').doc('prayer-a').delete());
  await assertFails(adminDb.collection('prayers').doc('prayer-a').delete());

  const testimonyRef = aDb.collection('testimonies').doc('testimony-new');
  await assertFails(testimonyRef.set(testimonyDoc()));
  await assertFails(aDb.collection('testimonies').doc('testimony-a').update({ title: 'Updated', updatedAt: new Date() }));
  await assertFails(aDb.collection('testimonies').doc('testimony-a').update({ amen: 99 }));
  await assertFails(aDb.collection('testimonies').doc('testimony-a').delete());

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
  await assertFails(suspendedAdminDb.collection('reports').get());
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

  await assertFails(aDb.collection('encouragements').doc('encouragement-new').set({
    threadId: 'prayer-linked',
    authorUid: 'user-a',
    authorName: 'User A',
    text: 'Praying with you.',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await assertFails(aDb.collection('encouragements').doc('encouragement-a').update({
    text: 'Updated encouragement',
    updatedAt: new Date(),
  }));
  await assertFails(aDb.collection('encouragements').doc('encouragement-a').delete());
  await assertFails(aDb.collection('encouragements').doc('encouragement-a').get());

  await assertSucceeds(aDb.collection('prayerSessions').doc('session-a').set({
    authorUid: 'user-a',
    title: 'Morning prayer',
    seconds: 120,
    prayerId: 'prayer-linked',
    createdAt: new Date(),
  }));
  await assertSucceeds(aDb.collection('prayerSessions').doc('session-unlinked').set({
    authorUid: 'user-a',
    title: 'Quiet prayer',
    seconds: 60,
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
    announcements: true,
    updatedAt: new Date(),
  }));
  await assertFails(bDb.doc('notificationSettings/user-a').get());

  await assertSucceeds(aDb.doc('users/user-a/following/following-a').get());
  await assertFails(bDb.doc('users/user-a/following/following-a').get());
  await assertFails(aDb.doc('users/user-a/following/following-new').set({
    displayName: 'Client write',
    createdAt: new Date(),
  }));
  await assertSucceeds(aDb.doc('devotions/devotion-a').get());
  await assertFails(aDb.doc('devotions/devotion-archived').get());
  await assertFails(aDb.doc('devotions/devotion-new').set({
    title: 'Client devotion',
    status: 'active',
    order: 3,
  }));
  await assertSucceeds(aDb.doc('studyGuides/guide-a').get());
  await assertSucceeds(aDb.doc('studyGuides/guide-a/lessons/lesson-a').get());
  await assertFails(aDb.doc('studyGuides/guide-a/lessons/lesson-archived').get());
  await assertFails(aDb.doc('studyGuides/guide-a/lessons/lesson-new').set({
    title: 'Client lesson',
    body: 'Nope',
    status: 'active',
    day: 3,
  }));

  const eventRef = aDb.collection('calendarEvents').doc('event-a');
  await assertSucceeds(eventRef.set({
    ownerUid: 'user-a',
    title: 'Morning prayer',
    notes: 'Quiet time',
    dateKey: '2026-05-22',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }));
  await assertFails(bDb.collection('calendarEvents').doc('event-a').get());
  await assertFails(bDb.collection('calendarEvents').doc('event-a').update({ title: 'Hacked' }));
  await assertSucceeds(eventRef.update({
    title: 'Evening prayer',
    notes: 'Quiet time',
    dateKey: '2026-05-23',
    updatedAt: Timestamp.now(),
  }));

  const bookmarkRef = aDb.collection('calendarBookmarks').doc('user-a_2026-05-22');
  await assertSucceeds(bookmarkRef.set({
    ownerUid: 'user-a',
    dateKey: '2026-05-22',
    createdAt: Timestamp.now(),
  }));
  await assertFails(aDb.collection('calendarBookmarks').doc('user-b_2026-05-22').set({
    ownerUid: 'user-a',
    dateKey: '2026-05-22',
    createdAt: Timestamp.now(),
  }));
  await assertFails(bDb.collection('calendarBookmarks').doc('user-a_2026-05-22').delete());

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc('announcements/announcement-a').set({
      title: 'Community Night',
      body: 'Join us this week.',
      category: 'events',
      startsAt: new Date(),
      endsAt: null,
      status: 'active',
      createdByUid: 'admin-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await context.firestore().doc('announcements/announcement-archived').set({
      title: 'Archived item',
      body: 'Old update',
      category: 'updates',
      startsAt: new Date(),
      endsAt: null,
      status: 'archived',
      createdByUid: 'admin-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  await assertSucceeds(aDb.collection('announcements').doc('announcement-a').get());
  await assertFails(aDb.collection('announcements').doc('announcement-archived').get());
  await assertSucceeds(adminDb.collection('announcements').doc('announcement-archived').get());
  await assertFails(suspendedAdminDb.collection('announcements').doc('announcement-archived').get());
  await assertFails(aDb.collection('announcements').doc('announcement-new').set({
    title: 'Blocked',
    body: 'Client write',
    category: 'updates',
    startsAt: new Date(),
    status: 'active',
    createdByUid: 'user-a',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await assertFails(adminDb.collection('announcements').doc('announcement-a').update({ title: 'Hacked' }));

  console.log('All rules smoke tests passed.');
}

runTests()
  .then(() => testEnv.cleanup())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Rules test failed:', err);
    process.exit(1);
  });

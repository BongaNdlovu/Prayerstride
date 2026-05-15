import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const serviceAccount = JSON.parse(readFileSync(resolve('serviceAccountKey.json'), 'utf-8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed() {
  await db.collection('prayers').add({
    title: 'Pray for peace',
    body: 'Please pray for peace in our home.',
    authorUid: 'seed-user',
    authorName: 'Seed User',
    isAnonymous: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    prayedCount: 0,
    status: 'active',
  });

  await db.collection('testimonies').add({
    title: 'Answered prayer',
    body: 'God provided at the right time.',
    prayerId: null,
    shared: true,
    authorUid: 'seed-user',
    authorName: 'Seed User',
    isAnonymous: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    tags: ['provision'],
  });

  await db.collection('reports').add({
    targetId: 'seed-target',
    targetType: 'prayer',
    reason: 'Seed report',
    reportedByUid: 'seed-user',
    createdAt: FieldValue.serverTimestamp(),
    status: 'pending',
  });

  await db.collection('notifications').add({
    recipientUid: 'seed-user',
    type: 'prayer_activity',
    message: 'Someone prayed for your request.',
    read: false,
    createdAt: FieldValue.serverTimestamp(),
    relatedId: null,
  });

  console.log('Firestore seeded successfully.');
}

seed().catch(console.error).then(() => process.exit(0));

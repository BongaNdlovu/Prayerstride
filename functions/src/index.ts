import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

initializeApp();

export const notifyPrayerAuthorOnPrayed = onDocumentUpdated(
  'prayers/{prayerId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    const beforeCount = Number(before.prayedCount || 0);
    const afterCount = Number(after.prayedCount || 0);

    if (afterCount <= beforeCount) return;
    if (!after.authorUid) return;

    await getFirestore().collection('notifications').add({
      recipientUid: after.authorUid,
      type: 'prayer_prayed',
      message: 'Someone prayed for your request.',
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      relatedId: event.params.prayerId,
    });
  },
);

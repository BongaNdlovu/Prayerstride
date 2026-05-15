import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();

export const notifyPrayerAuthorOnPrayed = onDocumentUpdated(
  'prayers/{prayerId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const prayerId = event.params.prayerId;

    if (!before || !after) return;

    const beforeCount = before.prayedCount || 0;
    const afterCount = after.prayedCount || 0;

    if (afterCount <= beforeCount) return;

    await getFirestore().collection('notifications').add({
      recipientUid: after.authorUid,
      type: 'prayer_prayed',
      message: 'Someone prayed for your request.',
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      relatedId: prayerId,
    });
  },
);

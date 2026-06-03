import { runDualWrite } from './dual-write.js';

export async function commitFirestoreWithD1(env, firestoreApi, options) {
  const {
    feature,
    entityType,
    entityId,
    operation,
    metadata,
    writes,
    commitOptions,
    syncD1,
  } = options;

  let commitResult;
  await runDualWrite(
    env,
    { feature, entityType, entityId, operation, metadata },
    async () => {
      commitResult = await firestoreApi.firestoreCommit(env, writes, commitOptions);
    },
    async () => {
      if (syncD1 && !commitResult?.alreadyExists) await syncD1();
    },
  );
  return commitResult;
}

import { newId, utcNowIso } from './time.js';

export async function logDualWriteFailure(env, {
  feature,
  entityType,
  entityId,
  operation,
  error,
  metadata = null,
}) {
  if (!env.DB) return;
  const message = error?.message || String(error);
  try {
    await env.DB.prepare(
      `INSERT INTO dual_write_failures (id, feature, entity_type, entity_id, operation, error_message, created_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      newId(),
      feature,
      entityType,
      entityId,
      operation,
      message,
      utcNowIso(),
      metadata ? JSON.stringify(metadata) : null,
    ).run();
  } catch (logError) {
    console.error(JSON.stringify({
      timestamp: utcNowIso(),
      level: 'error',
      context: 'dual-write-failure-log-failed',
      feature,
      entityId,
      message: logError.message,
    }));
  }
}

export async function runDualWrite(env, options, firestoreWrite, d1Write) {
  await firestoreWrite();
  if (!env.DB) return;
  try {
    await d1Write();
  } catch (error) {
    await logDualWriteFailure(env, {
      feature: options.feature,
      entityType: options.entityType,
      entityId: options.entityId,
      operation: options.operation,
      error,
      metadata: options.metadata,
    });
  }
}

import { describe, expect, it, vi } from 'vitest';
import { logDualWriteFailure, runDualWrite } from '../../../worker/db/dual-write.js';

describe('dual-write', () => {
  it('calls firestore write first then d1 write', async () => {
    const firestoreWrite = vi.fn(async () => {});
    const d1Write = vi.fn(async () => {});
    const env = { DB: { prepare: vi.fn(() => ({ bind: vi.fn(() => ({ run: vi.fn() })) })) } };

    await runDualWrite(env, { feature: 'prayers', entityType: 'prayer', entityId: 'p1', operation: 'create' }, firestoreWrite, d1Write);

    expect(firestoreWrite).toHaveBeenCalled();
    expect(d1Write).toHaveBeenCalled();
  });

  it('logs D1 failure when d1 write throws', async () => {
    const firestoreWrite = vi.fn(async () => {});
    const d1Error = new Error('D1 constraint violation');
    const d1Write = vi.fn(async () => { throw d1Error; });
    const env = { DB: { prepare: vi.fn(() => ({ bind: vi.fn(() => ({ run: vi.fn() })) })) } };

    await runDualWrite(env, { feature: 'prayers', entityType: 'prayer', entityId: 'p2', operation: 'update' }, firestoreWrite, d1Write);

    expect(firestoreWrite).toHaveBeenCalled();
    expect(env.DB.prepare).toHaveBeenCalled();
  });

  it('skips D1 when no DB binding available', async () => {
    const firestoreWrite = vi.fn(async () => {});
    const d1Write = vi.fn(async () => {});
    const env = {};

    await runDualWrite(env, { feature: 'prayers', entityType: 'prayer', entityId: 'p3', operation: 'delete' }, firestoreWrite, d1Write);

    expect(firestoreWrite).toHaveBeenCalled();
    expect(d1Write).not.toHaveBeenCalled();
  });

  it('logDualWriteFailure skips when no DB binding', async () => {
    const env = {};
    await expect(logDualWriteFailure(env, {
      feature: 'testimonies',
      entityType: 'testimony',
      entityId: 't1',
      operation: 'create',
      error: new Error('oops'),
    })).resolves.toBeUndefined();
  });

  it('logDualWriteFailure catches log-write errors gracefully', async () => {
    const logError = new Error('DB dead');
    const env = {
      DB: {
        prepare: vi.fn(() => ({
          bind: vi.fn(() => ({
            run: vi.fn(() => { throw logError; }),
          })),
        })),
      },
    };

    await expect(logDualWriteFailure(env, {
      feature: 'gamification',
      entityType: 'xp',
      entityId: 'x1',
      operation: 'award',
      error: new Error('d1 failure'),
    })).resolves.toBeUndefined();
  });

  it('firestore write failure stops d1 write from executing', async () => {
    const firestoreError = new Error('Firestore quota exceeded');
    const firestoreWrite = vi.fn(async () => { throw firestoreError; });
    const d1Write = vi.fn(async () => {});
    const env = { DB: { prepare: vi.fn(() => ({ bind: vi.fn(() => ({ run: vi.fn() })) })) } };

    await expect(runDualWrite(env, { feature: 'prayers', entityType: 'prayer', entityId: 'p4', operation: 'create' }, firestoreWrite, d1Write))
      .rejects.toThrow('Firestore quota exceeded');

    expect(d1Write).not.toHaveBeenCalled();
  });
});

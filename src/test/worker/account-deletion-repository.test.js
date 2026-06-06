import { describe, expect, it, vi } from 'vitest';
import { deleteUserMirrorData } from '../../../worker/db/account-deletion-repository.js';

describe('account deletion repository', () => {
  it('deletes user-owned D1 mirror rows across mirrored tables', async () => {
    const statements = [];
    const env = {
      DB: {
        prepare: vi.fn((sql) => ({
          bind: vi.fn((...binds) => {
            const statement = { sql, binds };
            statements.push(statement);
            return statement;
          }),
        })),
        batch: vi.fn(async () => {}),
      },
    };

    await deleteUserMirrorData(env, 'uid-1');

    expect(env.DB.batch).toHaveBeenCalledTimes(1);
    expect(statements.map((statement) => statement.sql)).toEqual([
      'DELETE FROM prayer_prays WHERE uid = ? OR author_uid = ?',
      'DELETE FROM prayer_prays WHERE prayer_id IN (SELECT id FROM prayers WHERE author_uid = ?)',
      'DELETE FROM prayers WHERE author_uid = ?',
      'DELETE FROM calendar_events WHERE owner_uid = ?',
      'DELETE FROM calendar_bookmarks WHERE owner_uid = ?',
      'DELETE FROM notifications WHERE recipient_uid = ? OR actor_uid = ?',
      'DELETE FROM notification_settings WHERE uid = ?',
      'DELETE FROM push_tokens WHERE uid = ?',
      'DELETE FROM users WHERE uid = ?',
    ]);
    expect(statements[0].binds).toEqual(['uid-1', 'uid-1']);
    expect(statements.at(-1).binds).toEqual(['uid-1']);
  });
});

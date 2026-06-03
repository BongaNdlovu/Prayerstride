import { describe, expect, it } from 'vitest';
import { buildUpsertSql, sqlLiteral } from '../../../scripts/lib/d1-sql.mjs';

describe('d1 sql helpers', () => {
  it('escapes string literals for SQL', () => {
    expect(sqlLiteral("O'Brien")).toBe("'O''Brien'");
    expect(sqlLiteral(null)).toBe('NULL');
  });

  it('builds idempotent upsert statements', () => {
    const sql = buildUpsertSql('users', { uid: 'u1', display_name: 'Alex' }, 'uid', ['display_name']);
    expect(sql).toContain('INSERT INTO users');
    expect(sql).toContain("ON CONFLICT(uid) DO UPDATE SET display_name = excluded.display_name");
  });
});

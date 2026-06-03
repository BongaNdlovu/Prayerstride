export function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function buildUpsertSql(table, row, conflictKey, updateColumns) {
  const columns = Object.keys(row);
  const values = columns.map((column) => sqlLiteral(row[column]));
  const assignments = updateColumns.map((column) => `${column} = excluded.${column}`).join(', ');
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT(${conflictKey}) DO UPDATE SET ${assignments};`;
}

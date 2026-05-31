import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const screenDir = join(root, 'src', 'mobile', 'screens');
const screens = readdirSync(screenDir).filter((file) => file.endsWith('.jsx')).sort();

const rows = screens.map((file) => {
  const source = readFileSync(join(screenDir, file), 'utf8');
  const usesScene = source.includes('scenes.') || source.includes('SceneImage');
  const usesScaffold = source.includes('ScreenScaffold');
  const usesTheme = source.includes('theme') || source.includes('colors.');

  return {
    file,
    status: usesScaffold || usesScene || usesTheme ? 'ok' : 'review',
    style: usesScene ? 'scene' : usesScaffold ? 'scaffold' : 'mixed',
  };
});

const review = rows.filter((row) => row.status === 'review');

console.log('Mobile screen audit');
for (const row of rows) {
  console.log(`${row.status.padEnd(6)} ${row.file.padEnd(36)} ${row.style}`);
}

if (review.length) {
  console.log('\nScreens to review for shared layout or scene usage:');
  for (const row of review) console.log(`- ${row.file}`);
} else {
  console.log('\nAll mobile screens use shared layout or scene assets.');
}

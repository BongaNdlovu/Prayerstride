import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const screenDir = join(root, 'src', 'components', 'screens');
const screens = readdirSync(screenDir).filter((file) => file.endsWith('.jsx')).sort();

const rows = screens.map((file) => {
  const source = readFileSync(join(screenDir, file), 'utf8');
  const cinematic = source.includes('cinematic-bg') || source.includes('SceneImage');
  const appScreen = source.includes('<AppScreen');
  const legacyShell = /className="[^"]*(?:h-full|flex h-full|relative flex h-full)[^"]*bg-sand/.test(source);
  const warmCards = (source.match(/warm-panel|bg-white\/|bg-white|border-\[#e6ddcf\]/g) || []).length;
  const likelyUnpolished = legacyShell && !cinematic && !appScreen;

  return {
    file,
    status: likelyUnpolished ? 'review' : 'ok',
    style: cinematic ? 'cinematic' : appScreen ? 'app-screen' : legacyShell ? 'legacy-light' : 'mixed',
    warmCards,
  };
});

const review = rows.filter((row) => row.status === 'review');

console.log('Screen style audit');
for (const row of rows) {
  console.log(`${row.status.padEnd(6)} ${row.file.padEnd(28)} ${row.style.padEnd(13)} warm/light refs: ${row.warmCards}`);
}

if (review.length) {
  console.log('\nScreens to review for the newer visual direction:');
  for (const row of review) console.log(`- ${row.file}`);
} else {
  console.log('\nNo obvious legacy full-screen shells found.');
}

import { access } from 'node:fs/promises';
import { join } from 'node:path';

const SCENE_DIR = join(process.cwd(), 'src', 'assets', 'compressed-scenes');
const FILES = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];
const failures = [];

for (const file of FILES) {
  try {
    await access(join(SCENE_DIR, file));
  } catch {
    failures.push(`Missing scene asset: src/assets/compressed-scenes/${file}`);
  }
}

if (failures.length) {
  console.error('Scene asset smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('Run: node scripts/ensure-scene-assets.mjs');
  process.exit(1);
}

console.log('Scene asset smoke test passed: all 6 compressed scene images are bundled.');

import { access } from 'node:fs/promises';
import { join } from 'node:path';

const SCENE_DIR = join(process.cwd(), 'src', 'assets', 'compressed-scenes');
const FILES = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];
const missing = [];

for (const file of FILES) {
  try {
    await access(join(SCENE_DIR, file));
  } catch {
    missing.push(file);
  }
}

if (missing.length) {
  console.error(`Missing proprietary scene assets: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('All proprietary scene assets are present.');

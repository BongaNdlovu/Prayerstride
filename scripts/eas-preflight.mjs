import { existsSync, lstatSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();

const generatedAndroidDirs = [
  'android/.gradle',
  'android/.kotlin',
  'android/build',
  'android/app/.cxx',
  'android/app/build',
  '.gradle-user-home',
  '.gradle-user-home-check',
  '.gradle-user-home-verify',
];

for (const dir of generatedAndroidDirs) {
  try {
    rmSync(join(root, dir), { recursive: true, force: true });
  } catch (error) {
    console.warn(`EAS preflight warning: could not fully remove ${dir}: ${error.message}`);
  }
}

const ignoredDirs = new Set([
  '.git',
  '.expo',
  '.gradle-user-home',
  '.gradle-user-home-check',
  '.gradle-user-home-verify',
  'android-capacitor-legacy',
  'artifacts',
  'dist',
  'node_modules',
]);

const ignoredAndroidDirs = new Set([
  'android/.gradle',
  'android/.kotlin',
  'android/build',
  'android/app/.cxx',
  'android/app/build',
]);

const textExtensions = new Set([
  '.cjs',
  '.gradle',
  '.js',
  '.json',
  '.jsx',
  '.kt',
  '.mjs',
  '.properties',
  '.toml',
  '.ts',
  '.tsx',
  '.xml',
]);

const windowsDrivePath = /(?<![A-Za-z])[A-Za-z]:[\\/]/;
const offenders = [];
const ignoredFiles = new Set([
  'scripts/visual-smoke.mjs',
]);

function shouldSkipDir(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  const topLevel = normalized.split('/')[0];

  return ignoredDirs.has(topLevel) || ignoredAndroidDirs.has(normalized);
}

function scanDir(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = lstatSync(fullPath);
    const relPath = relative(root, fullPath);

    if (stats.isDirectory()) {
      if (!shouldSkipDir(relPath)) scanDir(fullPath);
      continue;
    }

    const extension = entry.slice(entry.lastIndexOf('.'));
    const normalizedRelPath = relPath.replaceAll('\\', '/');
    if (ignoredFiles.has(normalizedRelPath)) continue;
    if (!textExtensions.has(extension)) continue;

    const contents = readFileSync(fullPath, 'utf8');
    if (windowsDrivePath.test(contents)) {
      offenders.push(normalizedRelPath);
    }
  }
}

scanDir(root);

if (offenders.length) {
  console.error('EAS preflight failed: Windows absolute paths were found in source files:');
  for (const offender of offenders) console.error(`- ${offender}`);
  process.exit(1);
}

console.log('EAS preflight passed: generated Android caches removed and source paths are portable.');

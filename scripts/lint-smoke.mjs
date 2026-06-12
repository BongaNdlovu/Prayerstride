import { parse } from '@babel/parser';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const sourceRoots = ['app', 'src', 'worker', 'scripts', 'shared'];
const extensions = new Set(['.cjs', '.js', '.jsx', '.mjs']);
const ignoredDirectories = new Set([
  '.expo',
  '.git',
  '.gradle',
  '.kotlin',
  '.wrangler',
  'android',
  'artifacts',
  'coverage',
  'dist',
  'node_modules',
]);

function extensionOf(filePath) {
  const match = filePath.match(/\.[^.]+$/);
  return match ? match[0] : '';
}

function collectFiles(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      collectFiles(fullPath, files);
      continue;
    }
    if (extensions.has(extensionOf(entry))) files.push(fullPath);
  }
  return files;
}

const files = sourceRoots.flatMap((sourceRoot) => collectFiles(join(root, sourceRoot)));
const failures = [];

for (const filePath of files) {
  const source = readFileSync(filePath, 'utf8');
  try {
    parse(source, {
      sourceType: 'unambiguous',
      plugins: ['jsx'],
    });
  } catch (error) {
    failures.push({
      file: relative(root, filePath),
      message: error.message,
    });
  }
}

if (failures.length) {
  console.error('Lint smoke failed:');
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.message}`);
  }
  process.exit(1);
}

console.log(`Lint smoke passed: parsed ${files.length} source files.`);

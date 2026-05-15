import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_SCREENS, NAV_TO_SCREEN } from '../src/data/constants.js';

const root = process.cwd();
const app = readFileSync(join(root, 'src', 'App.jsx'), 'utf8');
const nav = readFileSync(join(root, 'src', 'data', 'constants.js'), 'utf8');
const hooks = readFileSync(join(root, 'src', 'hooks', 'useNavigation.js'), 'utf8');
const files = [app, nav, hooks];

const handledScreens = new Set([...app.matchAll(/screen === "([^"]+)"/g)].map((match) => match[1]));
const missingHandlers = APP_SCREENS.filter((screen) => !handledScreens.has(screen));
const unknownNavTargets = Object.values(NAV_TO_SCREEN).filter((screen) => !APP_SCREENS.includes(screen));

const goTargets = new Set();
for (const file of files) {
  for (const match of file.matchAll(/go\("([^"]+)"/g)) {
    goTargets.add(match[1]);
  }
  for (const match of file.matchAll(/fallback = '([^']+)'/g)) {
    goTargets.add(match[1]);
  }
}

const unknownGoTargets = [...goTargets].filter((screen) => !APP_SCREENS.includes(screen));

const failures = [
  ...missingHandlers.map((screen) => `APP_SCREENS includes "${screen}" but App.jsx does not handle it.`),
  ...unknownNavTargets.map((screen) => `NAV_TO_SCREEN points to unknown screen "${screen}".`),
  ...unknownGoTargets.map((screen) => `go/back references unknown screen "${screen}".`),
];

if (failures.length) {
  console.error('Flow smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Flow smoke test passed: ${APP_SCREENS.length} screens checked.`);

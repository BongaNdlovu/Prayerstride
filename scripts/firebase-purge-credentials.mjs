import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadEnv(path = '.env.local') {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
      .filter(({ line }) => line && !line.startsWith('#'))
      .map(({ line, lineNumber }) => {
        const separator = line.indexOf('=');
        if (separator === -1) {
          throw new Error(`Invalid environment entry in ${path}:${lineNumber}: expected KEY=VALUE`);
        }
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

function loadServiceAccountJson(path) {
  const json = JSON.parse(readFileSync(resolve(path), 'utf8'));
  return {
    projectId: json.project_id,
    clientEmail: json.client_email,
    privateKey: json.private_key,
  };
}

export function resolveFirebasePurgeCredentials({ envFile = '.env.local', envPrefix = 'FIREBASE' } = {}) {
  const localEnv = loadEnv(envFile);
  const credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS
    || process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    || process.env[`${envPrefix}_SERVICE_ACCOUNT_PATH`];

  if (credentialsPath) {
    const fromJson = loadServiceAccountJson(credentialsPath);
    return {
      projectId:
        process.env.FIREBASE_PROJECT_ID
        || localEnv.EXPO_PUBLIC_FIREBASE_PROJECT_ID
        || fromJson.projectId,
      clientEmail: fromJson.clientEmail,
      privateKey: fromJson.privateKey,
      source: credentialsPath,
    };
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID || localEnv.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || localEnv.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY || localEnv.FIREBASE_PRIVATE_KEY,
    source: 'environment',
  };
}

export function requireFirebasePurgeCredentials(options) {
  const credentials = resolveFirebasePurgeCredentials(options);
  if (!credentials.projectId || !credentials.clientEmail || !credentials.privateKey) {
    throw new Error(
      'Firebase purge credentials missing. Set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON file, '
      + 'or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (env or .env.local).',
    );
  }
  return credentials;
}

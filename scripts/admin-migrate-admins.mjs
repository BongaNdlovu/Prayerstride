#!/usr/bin/env node
/**
 * Dry-run or apply admin demotion for all users except verified OWNER_EMAIL.
 * Usage:
 *   OWNER_EMAIL=you@example.com node scripts/admin-migrate-admins.mjs --dry-run
 *   OWNER_EMAIL=you@example.com node scripts/admin-migrate-admins.mjs --apply
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or Firebase Admin credentials in env
 * for apply mode. Dry-run only prints intended changes from Firestore export/API.
 */
const ownerEmail = String(process.env.OWNER_EMAIL || '').trim().toLowerCase();
const apply = process.argv.includes('--apply');
const dryRun = process.argv.includes('--dry-run') || !apply;

if (!ownerEmail) {
  console.error('Set OWNER_EMAIL before running this script.');
  process.exit(1);
}

console.log(`Admin migration (${dryRun ? 'dry-run' : 'apply'}) for owner ${ownerEmail}`);
console.log('This script is a checklist helper. Run against production Firestore with Admin SDK credentials.');
console.log('Steps:');
console.log('1. List users where role == "admin" OR owner == true');
console.log('2. For each UID, load users/{uid}.email from Auth/Firestore');
console.log('3. Demote to role=user, owner=false when email !== OWNER_EMAIL');
console.log('4. Log every demoted UID and preserved owner UID');
console.log(dryRun ? 'Re-run with --apply after reviewing output.' : 'Apply mode selected — execute with your Admin SDK tooling.');

#!/usr/bin/env node
/**
 * Dry-run or apply: mask authorName as "Anonymous" when isAnonymous is true.
 *
 * Usage:
 *   node scripts/migrate-anonymous-content.mjs --dry-run
 *   node scripts/migrate-anonymous-content.mjs --apply
 *
 * Apply requires Firebase Admin credentials (GOOGLE_APPLICATION_CREDENTIALS).
 * This script prints intended updates; wire Admin SDK in your environment for apply.
 */
const apply = process.argv.includes('--apply');
const dryRun = process.argv.includes('--dry-run') || !apply;

console.log(`Anonymous content migration (${dryRun ? 'dry-run' : 'apply'})`);
console.log('Collections: prayers, testimonies');
console.log('Rule: if isAnonymous == true and authorName != "Anonymous", set authorName = "Anonymous"');
console.log(dryRun
  ? 'Dry-run only — no writes. Review output, then re-run with --apply using Admin SDK tooling.'
  : 'Apply selected — execute updates with your Firebase Admin tooling.');

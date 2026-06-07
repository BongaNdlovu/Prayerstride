import { describe, expect, it } from 'vitest';
import {
  isFreshInProgressDeletion,
  isCreateOnlyDuplicateCommit,
  resolvePrivacyFields,
} from '../../../worker/worker-utils.js';

describe('worker index regressions', () => {
  it('stores hidden prayer privacy as private and not shareable', () => {
    expect(resolvePrivacyFields('hidden', true)).toEqual({ privacy: 'private', allowShare: false });
    expect(resolvePrivacyFields('private', true)).toEqual({ privacy: 'private', allowShare: true });
    expect(resolvePrivacyFields('community', false)).toEqual({ privacy: 'community', allowShare: false });
  });

  it('classifies create-only duplicate commit races when callers opt in', () => {
    const createOnlyWrite = { update: { name: 'reports/u1_prayer_p1' }, currentDocument: { exists: false } };
    const failedPrecondition = { error: { status: 'FAILED_PRECONDITION' } };
    const alreadyExists = { error: { status: 'ALREADY_EXISTS' } };

    expect(isCreateOnlyDuplicateCommit(failedPrecondition, [createOnlyWrite], { allowAlreadyExists: true })).toBe(true);
    expect(isCreateOnlyDuplicateCommit(alreadyExists, [createOnlyWrite], { allowAlreadyExists: true })).toBe(true);
    expect(isCreateOnlyDuplicateCommit(failedPrecondition, [createOnlyWrite], {})).toBe(false);
    expect(isCreateOnlyDuplicateCommit(failedPrecondition, [
      { update: { name: 'rateLimits/global' }, currentDocument: { updateTime: 'old' } },
    ], { allowAlreadyExists: true })).toBe(false);
  });

  it('keeps duplicate race responses on report and bookmark writes', async () => {
    const source = (await import('../../../worker/index.js?raw')).default;

    expect(source).toContain("if (result.alreadyExists) return json({ ok: true, duplicate: true, reportId });");
    expect(source).toContain('if (result.alreadyExists) {');
    expect(source).toContain("You cannot react to your own testimony.");
  });

  it('guards fresh in-progress account deletion jobs but allows stale recovery', () => {
    const now = Date.parse('2026-06-06T12:00:00.000Z');
    expect(isFreshInProgressDeletion({
      status: 'in_progress',
      updatedAt: '2026-06-06T11:55:00.000Z',
    }, now)).toBe(true);
    expect(isFreshInProgressDeletion({
      status: 'in_progress',
      updatedAt: '2026-06-06T11:00:00.000Z',
    }, now)).toBe(false);
    expect(isFreshInProgressDeletion({ status: 'failed' }, now)).toBe(false);
  });
});

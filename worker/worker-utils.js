export function resolvePrivacyFields(requestedPrivacy, allowShare) {
  if (requestedPrivacy === 'private') {
    return { privacy: 'private', allowShare: allowShare !== false };
  }
  if (requestedPrivacy === 'hidden') {
    return { privacy: 'private', allowShare: false };
  }
  return { privacy: 'community', allowShare: allowShare !== false };
}

export function isCreateOnlyDuplicateCommit(result, writes, options = {}) {
  const status = result?.error?.status;
  if (!options.allowAlreadyExists || (status !== 'ALREADY_EXISTS' && status !== 'FAILED_PRECONDITION')) return false;
  return writes.some((write) => write.update && write.currentDocument && write.currentDocument.exists === false);
}

export const DELETION_IN_PROGRESS_TTL_MS = 15 * 60 * 1000;

export function isFreshInProgressDeletion(job, now = Date.now()) {
  if (job?.status !== 'in_progress') return false;
  const updatedAt = Date.parse(job.updatedAt || job.startedAt || '');
  return Number.isFinite(updatedAt) && now - updatedAt < DELETION_IN_PROGRESS_TTL_MS;
}

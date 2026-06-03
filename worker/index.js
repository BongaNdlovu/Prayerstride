import {
  assertModerationAllowed,
  parseBlocklistConfig,
} from './moderation.js';
import {
  ageBandFromAge,
  calculateAge,
  communityAccessForAgeBand,
  isValidEmail,
  parseDateOfBirth,
} from './age.js';
import {
  deleteAccountPageHtml,
  guardianApprovedPageHtml,
  guardianInvalidPageHtml,
  htmlResponse,
  privacyPageHtml,
  termsPageHtml,
} from './legal-pages.js';
import { listAllDocumentPages } from './firestore-list.js';
import {
  computeSpiritualEngagementMetrics,
  normalizeEngagementDays,
} from './spiritual-engagement.js';
import {
  awardPrayActionXp,
  awardTestimonyXp,
  backfillGamificationXp,
  buildGamificationSummary,
  createPrayerSessionRecord,
  deleteUserGamificationSummary,
  deleteUserXpEvents,
  recordPrayerAnswered,
  recordPrayerCreated,
  resolveUserTimeZone,
  updateGamificationTimeZone,
} from './gamification.js';
import {
  dayKeyInTimeZone,
  isoWeekKeyFromDayKey,
} from '../shared/gamificationLogic.js';
import { uploadMyAvatar, serveAvatar } from './avatars.js';
import {
  bookmarkCalendarDate,
  createCalendarEvent as createCalendarEventApi,
  deleteCalendarEventApi,
  unbookmarkCalendarDate,
  updateCalendarEvent as updateCalendarEventApi,
} from './calendar-api.js';
import { getMyCalendarBookmarks, getMyCalendarEvents } from './calendar-read.js';
import { commitFirestoreWithD1 } from './db/commit.js';
import { logDualWriteFailure } from './db/dual-write.js';
import {
  deletePrayerById,
  incrementPrayerPrayedCount,
  insertPrayerPray,
  prayerRowFromFirestore,
  upsertPrayer,
} from './db/prayers-repository.js';
import {
  getMyNotificationSettings,
  getMyNotifications,
  markAllNotificationsRead as markAllNotificationsReadApi,
  markNotificationRead as markNotificationReadApi,
  updateNotificationSettings as updateNotificationSettingsApi,
} from './notifications-api.js';
import { getAdminReports, getAdminUsers } from './admin-read.js';
import { getAnnouncementsFeed } from './announcements-read.js';
import { getDevotions, getStudyGuide, getStudyGuideLesson } from './content-read.js';
import { getMyPrayerSessions } from './prayer-sessions-read.js';
import { getPrayersFeed } from './prayers-read.js';
import { deletePushTokenById, listPushTokensForUid, upsertPushToken } from './db/push-tokens-repository.js';
import { getTestimoniesFeed } from './testimonies-read.js';
import { invalidateUserNotificationStream } from './notification-stream.js';
import { avatarUrlForUid, getMyProfile, updateMyProfile } from './profile.js';

export { UserNotificationStream } from './durable-objects/UserNotificationStream.js';
export { AdminEventStream } from './durable-objects/AdminEventStream.js';

const FIREBASE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIREBASE_SCOPE = 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/devstorage.read_write';
const CURRENT_TERMS_VERSION = '2026-05-31';
const CURRENT_PRIVACY_VERSION = '2026-05-31';
const RATE_LIMIT_COMMIT_ATTEMPTS = 3;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const requestId = crypto.randomUUID().slice(0, 8);
    const startTime = Date.now();
    log(env, 'info', { requestId, method: request.method, path: url.pathname }, 'request');

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), env, request);
    }

    try {
      if (url.pathname === '/privacy') {
        return withCors(htmlResponse(privacyPageHtml()), env, request);
      }
      if (url.pathname === '/terms') {
        return withCors(htmlResponse(termsPageHtml()), env, request);
      }
      if (url.pathname === '/delete-account') {
        return withCors(htmlResponse(deleteAccountPageHtml()), env, request);
      }
      if (url.pathname === '/guardian/approve' && request.method === 'GET') {
        await enforceGlobalRateLimit(env, request, requestId);
        const response = await handleGuardianApprove(env, url);
        return withCors(response, env, request);
      }
      if (url.pathname === '/' && request.method === 'GET') {
        return withCors(json({ ok: true, service: 'prayerstride-api' }), env, request);
      }

      const avatarMatch = url.pathname.match(/^\/avatars\/([^/]+)\/profile\.jpg$/);
      if (avatarMatch && request.method === 'GET') {
        const response = await serveAvatar(env, decodeURIComponent(avatarMatch[1]), firestoreApi);
        log(env, 'info', { requestId, status: response.status, durationMs: Date.now() - startTime }, 'response');
        return response;
      }

      if (url.pathname.startsWith('/api/')) {
        await enforceGlobalRateLimit(env, request, requestId);
        const response = await handleApi(request, env, url, requestId);
        log(env, 'info', { requestId, status: response.status, durationMs: Date.now() - startTime }, 'response');
        return withCors(response, env, request);
      }

      return withCors(json({ error: 'Not found' }, 404), env, request);
    } catch (error) {
      const status = Number(error.status || 500);
      const message = error.publicMessage || (status >= 500 ? 'Unexpected server error' : 'Request failed');
      log(env, status >= 500 ? 'error' : 'warn', { requestId, status, message: error.message }, 'error');
      return withCors(json({ error: message }, status), env, request);
    }
  },
  async scheduled(event, env) {
    log(env, 'info', { cron: event.cron }, 'scheduled-start');
    try {
      const retriedDeletionJobs = await retryFailedDeletionJobs(env);
      log(env, 'info', retriedDeletionJobs, 'scheduled-deletion-retry');
      const purged = await purgeExpiredDeletionTombstones(env);
      log(env, 'info', { purged }, 'scheduled-tombstone-purge');
      const purgedRateLimits = await purgeExpiredRateLimits(env);
      log(env, 'info', { purged: purgedRateLimits }, 'scheduled-rate-limit-purge');
    } catch (error) {
      log(env, 'error', { message: error.message }, 'scheduled-error');
    }
  },
};

async function handleApi(request, env, url, requestId) {
  const user = await verifyFirebaseUser(request, env);
  await enforceUserRateLimit(env, user.uid, requestId);

  let match = url.pathname.match(/^\/api\/me\/profile$/);
  if (match && request.method === 'GET') {
    const result = await getMyProfile(env, user, firestoreApi);
    return json(result.body, result.status);
  }
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    const body = await parseJsonBody(request);
    const result = await updateMyProfile(env, user, body, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/me\/avatar$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    const result = await uploadMyAvatar(env, user, request, firestoreApi, { avatarUrlForUid });
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/prayers$/);
  if (match && request.method === 'GET') {
    const result = await getPrayersFeed(env, user, url, firestoreApi, requireAdmin);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/calendar-events$/);
  if (match && request.method === 'GET') {
    const result = await getMyCalendarEvents(env, user, firestoreApi);
    return json(result.body, result.status);
  }
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    const body = await parseJsonBody(request);
    const result = await createCalendarEventApi(env, user, body, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/calendar-events\/([^/]+)$/);
  if (match && request.method === 'DELETE') {
    await checkNotSuspended(env, user.uid);
    const result = await deleteCalendarEventApi(env, user, decodeURIComponent(match[1]), firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/calendar-events\/([^/]+)\/update$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    const body = await parseJsonBody(request);
    const result = await updateCalendarEventApi(env, user, decodeURIComponent(match[1]), body, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/calendar-bookmarks$/);
  if (match && request.method === 'GET') {
    const result = await getMyCalendarBookmarks(env, user, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/calendar-bookmarks\/([^/]+)$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    const result = await bookmarkCalendarDate(env, user, decodeURIComponent(match[1]), firestoreApi);
    return json(result.body, result.status);
  }
  if (match && request.method === 'DELETE') {
    await checkNotSuspended(env, user.uid);
    const result = await unbookmarkCalendarDate(env, user, decodeURIComponent(match[1]), firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/notifications$/);
  if (match && request.method === 'GET') {
    const result = await getMyNotifications(env, user, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/notifications\/read-all$/);
  if (match && request.method === 'POST') {
    const result = await markAllNotificationsReadApi(env, user, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (match && request.method === 'POST') {
    const result = await markNotificationReadApi(env, user, decodeURIComponent(match[1]), firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/notification-settings$/);
  if (match && request.method === 'GET') {
    const result = await getMyNotificationSettings(env, user, firestoreApi);
    return json(result.body, result.status);
  }
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    const body = await parseJsonBody(request);
    const result = await updateNotificationSettingsApi(env, user, body, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/me\/notifications\/stream$/);
  if (match && env.USER_NOTIFICATION_STREAM) {
    const id = env.USER_NOTIFICATION_STREAM.idFromName(user.uid);
    return env.USER_NOTIFICATION_STREAM.get(id).fetch(request);
  }

  match = url.pathname.match(/^\/api\/testimonies$/);
  if (match && request.method === 'GET') {
    const result = await getTestimoniesFeed(env, url, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/announcements$/);
  if (match && request.method === 'GET') {
    const isAdmin = await userIsAdmin(env, user);
    const result = await getAnnouncementsFeed(env, url, firestoreApi, isAdmin);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/devotions$/);
  if (match && request.method === 'GET') {
    const result = await getDevotions(env, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/study-guides\/([^/]+)\/lessons\/([^/]+)$/);
  if (match && request.method === 'GET') {
    const result = await getStudyGuideLesson(
      env,
      decodeURIComponent(match[1]),
      decodeURIComponent(match[2]),
      firestoreApi,
    );
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/study-guides\/([^/]+)\/lessons$/);
  if (match && request.method === 'GET') {
    const result = await getStudyGuideLesson(env, decodeURIComponent(match[1]), null, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/study-guides\/([^/]+)$/);
  if (match && request.method === 'GET') {
    const result = await getStudyGuide(env, decodeURIComponent(match[1]), firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/prayer-sessions$/);
  if (match && request.method === 'GET') {
    const result = await getMyPrayerSessions(env, user, firestoreApi);
    return json(result.body, result.status);
  }

  const body = await parseJsonBody(request);

  match = url.pathname.match(/^\/api\/account\/bootstrap-owner$/);
  if (match && request.method === 'POST') {
    return bootstrapOwner(env, user);
  }

  match = url.pathname.match(/^\/api\/account\/complete-registration$/);
  if (match && request.method === 'POST') {
    return completeRegistration(env, user, body);
  }

  match = url.pathname.match(/^\/api\/account\/resend-guardian-approval$/);
  if (match && request.method === 'POST') {
    return resendGuardianApproval(env, user);
  }

  match = url.pathname.match(/^\/api\/devices\/register$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return registerDevice(env, user, body);
  }

  match = url.pathname.match(/^\/api\/gamification\/summary$/);
  if (match && request.method === 'GET') {
    await checkNotSuspended(env, user.uid);
    const summary = await buildGamificationSummary(gamificationFirestore, env, user.uid, url.searchParams.get('timeZone'));
    return json(summary);
  }

  match = url.pathname.match(/^\/api\/gamification\/timezone$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    const result = await updateGamificationTimeZone(gamificationFirestore, env, user.uid, body.timeZone);
    if (result.error) return json({ error: result.error }, result.status);
    return json(result);
  }

  match = url.pathname.match(/^\/api\/gamification\/backfill$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    const result = await backfillGamificationXp(gamificationFirestore, env, user.uid, body.timeZone);
    return json(result);
  }

  match = url.pathname.match(/^\/api\/prayer-sessions$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    const result = await createPrayerSessionRecord(gamificationFirestore, env, user, body);
    if (result.error) return json({ error: result.error }, result.status);
    return json(result);
  }

  match = url.pathname.match(/^\/api\/prayers$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return createPrayer(env, user, body);
  }

  match = url.pathname.match(/^\/api\/prayers\/([^/]+)\/update$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return updatePrayer(env, user, decodeURIComponent(match[1]), body);
  }

  match = url.pathname.match(/^\/api\/prayers\/([^/]+)\/mark-answered$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return markPrayerAnswered(env, user, decodeURIComponent(match[1]));
  }

  match = url.pathname.match(/^\/api\/prayers\/([^/]+)\/pray$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return prayForRequest(env, user, decodeURIComponent(match[1]));
  }

  match = url.pathname.match(/^\/api\/prayers\/([^/]+)$/);
  if (match && request.method === 'DELETE') {
    await checkNotSuspended(env, user.uid);
    return deletePrayer(env, user, decodeURIComponent(match[1]));
  }

  match = url.pathname.match(/^\/api\/testimonies$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return createTestimony(env, user, body);
  }

  match = url.pathname.match(/^\/api\/testimonies\/([^/]+)\/update$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return updateTestimony(env, user, decodeURIComponent(match[1]), body);
  }

  match = url.pathname.match(/^\/api\/testimonies\/([^/]+)$/);
  if (match && request.method === 'DELETE') {
    await checkNotSuspended(env, user.uid);
    return deleteTestimony(env, user, decodeURIComponent(match[1]));
  }

  match = url.pathname.match(/^\/api\/testimonies\/([^/]+)\/react$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return reactToTestimony(env, user, decodeURIComponent(match[1]), body.reaction);
  }

  match = url.pathname.match(/^\/api\/blocks$/);
  if (match && request.method === 'GET') {
    await checkNotSuspended(env, user.uid);
    return listBlocks(env, user);
  }

  match = url.pathname.match(/^\/api\/blocks\/([^/]+)$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return blockUser(env, user, decodeURIComponent(match[1]));
  }
  if (match && request.method === 'DELETE') {
    await checkNotSuspended(env, user.uid);
    return unblockUser(env, user, decodeURIComponent(match[1]));
  }

  match = url.pathname.match(/^\/api\/prayer-bookmarks\/([^/]+)$/);
  if (match && request.method === 'GET') {
    await checkNotSuspended(env, user.uid);
    return getPrayerBookmark(env, user, decodeURIComponent(match[1]));
  }
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return savePrayerBookmark(env, user, decodeURIComponent(match[1]));
  }
  if (match && request.method === 'DELETE') {
    await checkNotSuspended(env, user.uid);
    return deletePrayerBookmark(env, user, decodeURIComponent(match[1]));
  }

  match = url.pathname.match(/^\/api\/reports$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return submitReport(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/delete-content$/);
  if (match && request.method === 'POST') {
    return adminDeleteContent(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/suspend-user$/);
  if (match && request.method === 'POST') {
    return adminSuspendUser(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/unsuspend-user$/);
  if (match && request.method === 'POST') {
    return adminUnsuspendUser(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/reports\/update$/);
  if (match && request.method === 'POST') {
    return adminUpdateReport(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/delete-account$/);
  if (match && request.method === 'POST') {
    return adminDeleteAccount(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/announcements\/create$/);
  if (match && request.method === 'POST') {
    return adminCreateAnnouncement(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/announcements\/update$/);
  if (match && request.method === 'POST') {
    return adminUpdateAnnouncement(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/announcements\/archive$/);
  if (match && request.method === 'POST') {
    return adminArchiveAnnouncement(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/reports$/);
  if (match && request.method === 'GET') {
    await requireAdmin(env, user);
    const result = await getAdminReports(env, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/admin\/users$/);
  if (match && request.method === 'GET') {
    await requireAdmin(env, user);
    const result = await getAdminUsers(env, firestoreApi);
    return json(result.body, result.status);
  }

  match = url.pathname.match(/^\/api\/admin\/spiritual-engagement$/);
  if (match && request.method === 'GET') {
    await requireAdmin(env, user);
    const days = normalizeEngagementDays(url.searchParams.get('days'));
    return spiritualEngagementMetrics(env, user, days);
  }

  match = url.pathname.match(/^\/api\/account$/);
  if (match && request.method === 'DELETE') {
    const authHeader = request.headers.get('Authorization') || '';
    const idToken = authHeader.replace(/^Bearer\s+/i, '');
    return deleteOwnAccount(env, user, idToken);
  }

  return knownApiPath(url.pathname)
    ? json({ error: 'Method not allowed' }, 405)
    : json({ error: 'Not found' }, 404);
}

function knownApiPath(pathname) {
  return [
    /^\/api\/me\/(?:profile|avatar)$/,
    /^\/api\/calendar-events(?:\/[^/]+(?:\/update)?)?$/,
    /^\/api\/calendar-bookmarks(?:\/[^/]+)?$/,
    /^\/api\/notifications(?:\/read-all|\/[^/]+\/read)?$/,
    /^\/api\/notification-settings$/,
    /^\/api\/account(?:\/bootstrap-owner|\/complete-registration|\/resend-guardian-approval)?$/,
    /^\/api\/devices\/register$/,
    /^\/api\/gamification\/(?:summary|timezone|backfill)$/,
    /^\/api\/prayer-sessions$/,
    /^\/api\/prayers(?:\/[^/]+(?:\/update|\/mark-answered|\/pray)?)?$/,
    /^\/api\/testimonies(?:\/[^/]+(?:\/update|\/react)?)?$/,
    /^\/api\/announcements$/,
    /^\/api\/devotions$/,
    /^\/api\/study-guides\/[^/]+(?:\/lessons(?:\/[^/]+)?)?$/,
    /^\/api\/prayer-sessions$/,
    /^\/api\/me\/notifications\/stream$/,
    /^\/api\/admin\/(?:reports|users)$/,
    /^\/api\/blocks(?:\/[^/]+)?$/,
    /^\/api\/prayer-bookmarks\/[^/]+$/,
    /^\/api\/reports$/,
    /^\/api\/admin\/(?:delete-content|suspend-user|unsuspend-user|delete-account|reports\/update|spiritual-engagement|announcements\/(?:create|update|archive))$/,
  ].some((pattern) => pattern.test(pathname));
}

async function parseJsonBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'DELETE') return {};
  try {
    return await request.json();
  } catch {
    throw Object.assign(new Error('Malformed JSON body'), { status: 400, publicMessage: 'Malformed JSON body' });
  }
}

async function completeRegistration(env, user, body) {
  if (body.termsAccepted !== true
    || body.termsVersion !== CURRENT_TERMS_VERSION
    || body.privacyVersion !== CURRENT_PRIVACY_VERSION) {
    return json({ error: 'Accept the current Terms of Service and Privacy Policy to create an account.' }, 400);
  }

  const dateOfBirth = parseDateOfBirth(body.dateOfBirth);
  if (!dateOfBirth) {
    return json({ error: 'Enter a valid date of birth (YYYY-MM-DD).' }, 400);
  }

  const age = calculateAge(dateOfBirth);
  const ageBand = ageBandFromAge(age);
  if (ageBand !== 'adult') {
    await deleteUserData(env, user.uid);
    return json({ error: 'You must be at least 18 years old to use PrayerStride.' }, 400);
  }

  const isSeventhDayAdventist = body.isSeventhDayAdventist === true;
  const churchName = isSeventhDayAdventist ? String(body.churchName || '').trim() : '';
  if (isSeventhDayAdventist && (churchName.length === 0 || churchName.length > 120)) {
    return json({ error: 'Enter the church you attend.' }, 400);
  }

  const userDoc = await getDocument(env, docName(env, 'users', user.uid));
  if (!userDoc.exists) return json({ error: 'User profile not found.' }, 404);

  const data = fromFirestoreFields(userDoc.fields);
  if (data.dateOfBirth && data.communityAccess) {
    return json({ ok: true, alreadyCompleted: true, communityAccess: data.communityAccess });
  }

  const communityAccess = communityAccessForAgeBand(ageBand);
  const now = new Date().toISOString();
  await firestoreCommit(env, [{
    update: {
      name: userDoc.name,
      fields: toFirestoreFields({
        ...data,
        dateOfBirth,
        ageBand,
        communityAccess,
        guardianEmail: null,
        isSeventhDayAdventist,
        churchName: isSeventhDayAdventist ? churchName : null,
        termsAcceptedAt: now,
        termsVersion: CURRENT_TERMS_VERSION,
        privacyVersion: CURRENT_PRIVACY_VERSION,
        registrationState: 'complete',
        updatedAt: now,
      }),
    },
  }]);
  return json({ ok: true, communityAccess });
}

async function handleGuardianApprove(env, url) {
  const token = url.searchParams.get('token');
  if (!token) return htmlResponse(guardianInvalidPageHtml('This approval link is missing a token.'), 400);

  const tokenId = await hashToken(token);
  let approvalDoc = await getDocument(env, docName(env, 'guardianApprovals', tokenId));
  // Keep links issued before token hashing usable during the transition.
  if (!approvalDoc.exists) {
    approvalDoc = await getDocument(env, docName(env, 'guardianApprovals', token));
  }
  if (!approvalDoc.exists) {
    return htmlResponse(guardianInvalidPageHtml('This approval link is invalid or has already been used.'), 404);
  }

  const approval = fromFirestoreFields(approvalDoc.fields);
  if (approval.expiresAt && new Date(approval.expiresAt).getTime() < Date.now()) {
    return htmlResponse(guardianInvalidPageHtml('This approval link has expired. Ask the user to register again or contact support.'), 410);
  }

  const userDoc = await getDocument(env, docName(env, 'users', approval.uid));
  if (!userDoc.exists) {
    return htmlResponse(guardianInvalidPageHtml('The linked account could not be found.'), 404);
  }

  const userData = fromFirestoreFields(userDoc.fields);
  const now = new Date().toISOString();
  await firestoreCommit(env, [
    {
      update: {
        name: userDoc.name,
        fields: toFirestoreFields({
          ...userData,
          communityAccess: 'active',
          guardianApprovedAt: now,
          updatedAt: now,
        }),
      },
    },
    { delete: approvalDoc.name },
  ]);

  return htmlResponse(guardianApprovedPageHtml());
}

async function sendGuardianApprovalEmail(env, { guardianEmail, token, displayName }) {
  const base = env.WORKER_PUBLIC_URL || env.CORS_ORIGIN || 'https://prayerstride.fanelesibonge50.workers.dev';
  const link = `${base}/guardian/approve?token=${encodeURIComponent(token)}`;
  const safeDisplayName = escapeHtml(displayName || 'A PrayerStride user');
  const html = `
    <p>Hello,</p>
    <p>${safeDisplayName} registered for a community account and listed you as their parent or guardian.</p>
    <p>Please review and approve community access:</p>
    <p><a href="${link}">Approve PrayerStride access</a></p>
    <p>This link expires in 48 hours. If you did not expect this email, you can ignore it.</p>
  `;
  return sendResendEmail(env, {
    to: guardianEmail,
    subject: 'Approve PrayerStride community access',
    html,
  });
}

async function resendGuardianApproval(env, user) {
  const profile = await getUserProfile(env, user.uid);
  if (!profile) return json({ error: 'User profile not found.' }, 404);
  if (profile.communityAccess !== 'pending_guardian' || !isValidEmail(profile.guardianEmail)) {
    return json({ error: 'Guardian approval is not pending for this account.' }, 400);
  }
  const token = crypto.randomUUID();
  const tokenId = await hashToken(token);
  const now = new Date().toISOString();
  await firestoreCommit(env, [{
    update: {
      name: docName(env, 'guardianApprovals', tokenId),
      fields: toFirestoreFields({
        uid: user.uid,
        guardianEmail: profile.guardianEmail,
        expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
        createdAt: now,
      }),
    },
  }]);
  const guardianEmailSent = await sendGuardianApprovalEmail(env, {
    guardianEmail: profile.guardianEmail,
    token,
    displayName: profile.displayName || user.email,
  });
  return json({ ok: true, guardianEmailSent });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

async function sendResendEmail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY) {
    log(env, 'warn', { to, subject }, 'email-skipped-no-resend-key');
    return false;
  }
  const from = env.RESEND_FROM || 'PrayerStride <onboarding@resend.dev>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    log(env, 'error', { to, subject, error: result.message || response.statusText }, 'resend-failed');
    return false;
  }
  return true;
}

async function checkCommunityAccess(env, uid) {
  const profile = await getUserProfile(env, uid);
  if (!profile) {
    throw Object.assign(new Error('User profile not found'), { status: 403, publicMessage: 'Complete registration required' });
  }
  if (profile.registrationState === 'pending_completion') {
    throw Object.assign(
      new Error('Complete registration before using community features.'),
      { status: 403, publicMessage: 'Complete registration required' },
    );
  }
  const access = profile.communityAccess;
  if (access !== 'active') {
    if (!access) {
      throw Object.assign(new Error('Complete registration before using community features.'), { status: 403, publicMessage: 'Complete registration required' });
    }
  }
  if (access === 'pending_guardian') {
    throw Object.assign(
      new Error('Guardian approval is required before you can use community features.'),
      { status: 403, publicMessage: 'Guardian approval required' },
    );
  }
  if (access === 'blocked') {
    throw Object.assign(
      new Error('Community features are not available for this account.'),
      { status: 403, publicMessage: 'Community access unavailable' },
    );
  }
  if (access !== 'active') {
    throw Object.assign(
      new Error('Community features are not available for this account.'),
      { status: 403, publicMessage: 'Community access unavailable' },
    );
  }
}

async function recipientBlockedActor(env, recipientUid, actorUid) {
  if (!recipientUid || !actorUid || recipientUid === actorUid) return false;
  const blockDoc = await getDocument(env, docName(env, 'blocks', `${recipientUid}_${actorUid}`));
  return blockDoc.exists;
}

async function bootstrapOwner(env, user) {
  const ownerEmail = String(env.OWNER_EMAIL || '').trim().toLowerCase();
  if (!ownerEmail) {
    return json({ error: 'Owner bootstrap is not configured.' }, 503);
  }
  if (!user.email || user.email.toLowerCase() !== ownerEmail) {
    return json({ error: 'Not authorized.' }, 403);
  }
  if (!user.emailVerified) {
    return json({ error: 'Verify your email before claiming owner access.' }, 403);
  }

  const userDoc = await getDocument(env, docName(env, 'users', user.uid));
  if (!userDoc.exists) return json({ error: 'User profile not found.' }, 404);

  const data = fromFirestoreFields(userDoc.fields);
  if (data.role === 'admin' && data.owner === true) {
    return json({ ok: true, alreadyAdmin: true });
  }

  await firestoreCommit(env, [{
    update: {
      name: userDoc.name,
      fields: toFirestoreFields({
        ...data,
        role: 'admin',
        owner: true,
        updatedAt: new Date().toISOString(),
      }),
    },
  }]);

  return json({ ok: true, alreadyAdmin: false });
}

async function getUserProfile(env, uid) {
  const userDoc = await getDocument(env, docName(env, 'users', uid));
  return userDoc.exists ? fromFirestoreFields(userDoc.fields) : null;
}

function resolveAuthorName(profile, user, isAnonymous) {
  if (isAnonymous) return 'Anonymous';
  return profile?.displayName || user.email || 'PrayerStride member';
}

function moderationBlocklist(env) {
  return parseBlocklistConfig(env.MODERATION_BLOCKLIST);
}

async function userIsAdmin(env, user) {
  const userDoc = await getDocument(env, docName(env, 'users', user.uid));
  if (!userDoc.exists) return false;
  const data = fromFirestoreFields(userDoc.fields);
  return data.role === 'admin' && data.suspended !== true;
}

async function loadAuthorContent(env, collection, contentId, user, { adminAllowed = true } = {}) {
  const contentDoc = await getDocument(env, docName(env, collection, contentId));
  if (!contentDoc.exists) {
    throw Object.assign(new Error('Content not found'), { status: 404, publicMessage: 'Content not found' });
  }
  const data = fromFirestoreFields(contentDoc.fields);
  if (data.authorUid !== user.uid) {
    if (!adminAllowed || !(await userIsAdmin(env, user))) {
      throw Object.assign(new Error('Forbidden'), { status: 403, publicMessage: 'You cannot modify this content.' });
    }
  }
  return { contentDoc, data };
}

async function canAccessPrayer(env, prayerId, user) {
  const prayer = await getDocument(env, docName(env, 'prayers', prayerId));
  if (!prayer.exists) return false;
  const data = fromFirestoreFields(prayer.fields);
  if (data.privacy === 'private' && data.authorUid !== user.uid && !(await userIsAdmin(env, user))) {
    return false;
  }
  return true;
}

async function createPrayer(env, user, body) {
  await checkCommunityAccess(env, user.uid);
  const title = body.title != null ? String(body.title).trim() : '';
  const prayerBody = body.body != null ? String(body.body).trim() : '';
  if (!title || !prayerBody) return json({ error: 'Missing title or body' }, 400);
  assertModerationAllowed({ title, body: prayerBody }, moderationBlocklist(env));

  const profile = await getUserProfile(env, user.uid);
  const isAnonymous = Boolean(body.isAnonymous ?? body.anonymous);
  const prayerLimit = ['daily', 'once', 'weekly'].includes(body.prayerLimit) ? body.prayerLimit : 'daily';
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const prayerFields = {
    title: title.slice(0, 120),
    body: prayerBody.slice(0, 2000),
    authorUid: user.uid,
    authorName: resolveAuthorName(profile, user, isAnonymous),
    isAnonymous,
    createdAt: now,
    updatedAt: now,
    prayedCount: 0,
    status: 'active',
    privacy: body.privacy === 'private' ? 'private' : 'community',
    prayerLimit,
    urgent: Boolean(body.urgent ?? body.urgency),
    allowShare: body.allowShare !== false,
  };

  await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'prayers',
    entityType: 'prayers',
    entityId: id,
    operation: 'create',
    writes: [{
      update: {
        name: docName(env, 'prayers', id),
        fields: toFirestoreFields(prayerFields),
      },
      currentDocument: { exists: false },
    }],
    syncD1: () => upsertPrayer(env, prayerRowFromFirestore(id, prayerFields)),
  });

  await recordPrayerCreated(gamificationFirestore, env, user.uid, body.timeZone);

  return json({ ok: true, prayerId: id });
}

async function updatePrayer(env, user, prayerId, body) {
  const { contentDoc, data } = await loadAuthorContent(env, 'prayers', prayerId, user);
  const title = body.title != null ? String(body.title).trim() : data.title;
  const prayerBody = body.body != null ? String(body.body).trim() : (body.text != null ? String(body.text).trim() : data.body);
  if (!title || !prayerBody) return json({ error: 'Missing title or body' }, 400);
  assertModerationAllowed({ title, body: prayerBody }, moderationBlocklist(env));

  const profile = await getUserProfile(env, user.uid);
  const isAnonymous = body.isAnonymous != null ? Boolean(body.isAnonymous ?? body.anonymous) : data.isAnonymous;
  const prayerLimit = body.prayerLimit != null
    ? (['daily', 'once', 'weekly'].includes(body.prayerLimit) ? body.prayerLimit : data.prayerLimit || 'daily')
    : (data.prayerLimit || 'daily');
  const now = new Date().toISOString();

  const nextFields = {
    ...data,
    title: title.slice(0, 120),
    body: prayerBody.slice(0, 2000),
    authorName: resolveAuthorName(profile, user, isAnonymous),
    isAnonymous,
    privacy: body.privacy != null ? (body.privacy === 'private' ? 'private' : 'community') : (data.privacy || 'community'),
    prayerLimit,
    urgent: body.urgent != null ? Boolean(body.urgent ?? body.urgency) : Boolean(data.urgent),
    allowShare: body.allowShare != null ? body.allowShare !== false : data.allowShare !== false,
    updatedAt: now,
  };

  await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'prayers',
    entityType: 'prayers',
    entityId: prayerId,
    operation: 'update',
    writes: [{
      update: {
        name: contentDoc.name,
        fields: toFirestoreFields(nextFields),
      },
    }],
    syncD1: () => upsertPrayer(env, prayerRowFromFirestore(prayerId, nextFields)),
  });

  return json({ ok: true, prayerId });
}

async function markPrayerAnswered(env, user, prayerId) {
  const { contentDoc, data } = await loadAuthorContent(env, 'prayers', prayerId, user);
  const alreadyAnswered = data.status === 'answered';
  const answeredFields = {
    ...data,
    status: 'answered',
    updatedAt: new Date().toISOString(),
  };
  await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'prayers',
    entityType: 'prayers',
    entityId: prayerId,
    operation: 'mark-answered',
    writes: [{
      update: {
        name: contentDoc.name,
        fields: toFirestoreFields(answeredFields),
      },
    }],
    syncD1: () => upsertPrayer(env, prayerRowFromFirestore(prayerId, answeredFields)),
  });
  if (!alreadyAnswered) {
    await recordPrayerAnswered(gamificationFirestore, env, user.uid, null);
  }
  return json({ ok: true, prayerId });
}

async function deletePrayer(env, user, prayerId) {
  const { contentDoc } = await loadAuthorContent(env, 'prayers', prayerId, user);
  await deleteContentAndActions(env, 'prayers', contentDoc);
  try {
    await deletePrayerById(env, prayerId);
  } catch (error) {
    await logDualWriteFailure(env, {
      feature: 'prayers',
      entityType: 'prayers',
      entityId: prayerId,
      operation: 'delete',
      error,
    });
  }
  return json({ ok: true, prayerId });
}

async function createTestimony(env, user, body) {
  await checkCommunityAccess(env, user.uid);
  const title = body.title != null ? String(body.title).trim() : '';
  const testimonyBody = body.body != null ? String(body.body).trim() : (body.text != null ? String(body.text).trim() : '');
  if (!title || !testimonyBody) return json({ error: 'Missing title or body' }, 400);
  assertModerationAllowed({ title, body: testimonyBody }, moderationBlocklist(env));

  const profile = await getUserProfile(env, user.uid);
  const isAnonymous = Boolean(body.isAnonymous);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const prayerId = body.prayerId || null;
  let linkedPrayerWasAnswered = false;

  const testimonyFields = {
    title: title.slice(0, 120),
    body: testimonyBody.slice(0, 2400),
    authorUid: user.uid,
    authorName: resolveAuthorName(profile, user, isAnonymous),
    isAnonymous,
    createdAt: now,
    updatedAt: now,
    amen: 0,
    praiseGod: 0,
    prayerId,
    shared: Boolean(body.shared),
    tags: normalizeTags(body.tags),
  };

  const writes = [{
    update: {
      name: docName(env, 'testimonies', id),
      fields: toFirestoreFields(testimonyFields),
    },
  }];

  if (prayerId) {
    const prayerDoc = await getDocument(env, docName(env, 'prayers', prayerId));
    if (!prayerDoc.exists) return json({ error: 'Linked prayer not found' }, 404);
    const prayerData = fromFirestoreFields(prayerDoc.fields);
    linkedPrayerWasAnswered = prayerData.status === 'answered';
    if (prayerData.authorUid !== user.uid && !(await userIsAdmin(env, user))) {
      return json({ error: 'You can only link your own prayer requests.' }, 403);
    }
    writes.push({
      update: {
        name: prayerDoc.name,
        fields: toFirestoreFields({
          ...prayerData,
          status: 'answered',
          updatedAt: now,
        }),
      },
    });
  }

  await firestoreCommit(env, writes);

  const timeZone = await resolveUserTimeZone(gamificationFirestore, env, user.uid, body.timeZone);
  await awardTestimonyXp(gamificationFirestore, env, {
    uid: user.uid,
    testimonyId: id,
    timeZone,
    now: new Date(now),
  });
  if (prayerId && !linkedPrayerWasAnswered) {
    await recordPrayerAnswered(gamificationFirestore, env, user.uid, body.timeZone);
  }

  return json({ ok: true, testimonyId: id });
}

async function updateTestimony(env, user, testimonyId, body) {
  const { contentDoc, data } = await loadAuthorContent(env, 'testimonies', testimonyId, user);
  const title = body.title != null ? String(body.title).trim() : data.title;
  const testimonyBody = body.body != null ? String(body.body).trim() : (body.text != null ? String(body.text).trim() : data.body);
  if (!title || !testimonyBody) return json({ error: 'Missing title or body' }, 400);
  assertModerationAllowed({ title, body: testimonyBody }, moderationBlocklist(env));

  const profile = await getUserProfile(env, user.uid);
  const isAnonymous = body.isAnonymous != null ? Boolean(body.isAnonymous) : data.isAnonymous;
  const now = new Date().toISOString();

  await firestoreCommit(env, [{
    update: {
      name: contentDoc.name,
      fields: toFirestoreFields({
        ...data,
        title: title.slice(0, 120),
        body: testimonyBody.slice(0, 2400),
        authorName: resolveAuthorName(profile, user, isAnonymous),
        isAnonymous,
        shared: body.shared != null ? Boolean(body.shared) : Boolean(data.shared),
        tags: body.tags != null ? normalizeTags(body.tags) : (data.tags || []),
        updatedAt: now,
      }),
    },
  }]);

  return json({ ok: true, testimonyId });
}

async function deleteTestimony(env, user, testimonyId) {
  const { contentDoc } = await loadAuthorContent(env, 'testimonies', testimonyId, user);
  await deleteContentAndActions(env, 'testimonies', contentDoc);
  return json({ ok: true, testimonyId });
}

async function deleteContentAndActions(env, collectionName, contentDoc) {
  const subcollectionName = collectionName === 'prayers' ? 'prays' : 'reactions';
  const relatedId = dataId(contentDoc);
  const actionDocs = await listDocuments(env, docName(env, collectionName, relatedId, subcollectionName));
  const notificationDocs = await runCollectionGroupQuery(env, 'notifications', [{
    fieldFilter: {
      field: { fieldPath: 'relatedId' },
      op: 'EQUAL',
      value: { stringValue: relatedId },
    },
  }], [], [], false);
  const reportDocs = await runCollectionGroupQuery(env, 'reports', [{
    fieldFilter: {
      field: { fieldPath: 'targetId' },
      op: 'EQUAL',
      value: { stringValue: relatedId },
    },
  }], [], [], false);
  await commitInChunks(env, [
    ...actionDocs.map((document) => ({ delete: document.name })),
    ...notificationDocs.map((document) => ({ delete: document.name })),
    ...reportDocs.map((document) => ({ delete: document.name })),
    { delete: contentDoc.name },
  ]);
}

async function listBlocks(env, user) {
  const docs = await runCollectionGroupQuery(env, 'blocks', [{
    fieldFilter: {
      field: { fieldPath: 'blockerUid' },
      op: 'EQUAL',
      value: { stringValue: user.uid },
    },
  }], [], [], false);
  const blockedUids = docs
    .map((document) => fromFirestoreFields(document.fields))
    .filter((item) => item.blockerUid === user.uid)
    .map((item) => item.blockedUid)
    .filter(Boolean);
  return json({ ok: true, blockedUids });
}

async function blockUser(env, user, blockedUid) {
  if (!blockedUid) return json({ error: 'Missing user id' }, 400);
  if (blockedUid === user.uid) return json({ error: 'You cannot block yourself.' }, 400);

  const target = await getDocument(env, docName(env, 'users', blockedUid));
  if (!target.exists) return json({ error: 'User not found' }, 404);

  const blockId = `${user.uid}_${blockedUid}`;
  const now = new Date().toISOString();
  await firestoreCommit(env, [{
    update: {
      name: docName(env, 'blocks', blockId),
      fields: toFirestoreFields({
        blockerUid: user.uid,
        blockedUid,
        createdAt: now,
      }),
    },
  }]);

  return json({ ok: true, blockedUid });
}

async function getPrayerBookmark(env, user, prayerId) {
  const bookmark = await getDocument(env, docName(env, 'prayerBookmarks', `${user.uid}_${prayerId}`));
  return json({ ok: true, bookmarked: bookmark.exists });
}

async function savePrayerBookmark(env, user, prayerId) {
  if (!(await canAccessPrayer(env, prayerId, user))) return json({ error: 'Prayer not found' }, 404);
  await firestoreCommit(env, [{
    update: {
      name: docName(env, 'prayerBookmarks', `${user.uid}_${prayerId}`),
      fields: toFirestoreFields({ ownerUid: user.uid, prayerId, createdAt: new Date().toISOString() }),
    },
  }]);
  return json({ ok: true, prayerId });
}

async function deletePrayerBookmark(env, user, prayerId) {
  await firestoreCommit(env, [{ delete: docName(env, 'prayerBookmarks', `${user.uid}_${prayerId}`) }]);
  return json({ ok: true, prayerId });
}

async function submitReport(env, user, body) {
  if (!body.targetId || !['prayer', 'testimony', 'user'].includes(body.targetType) || !body.reason) {
    return json({ error: 'Missing or invalid report details' }, 400);
  }
  const reportId = `${user.uid}_${body.targetType}_${body.targetId}`;
  const existing = await getDocument(env, docName(env, 'reports', reportId));
  if (existing.exists) return json({ ok: true, duplicate: true, reportId });
  await enforceCooldown(env, user.uid, 'report', 5);
  await firestoreCommit(env, [{
    update: {
      name: docName(env, 'reports', reportId),
      fields: toFirestoreFields({
        targetId: String(body.targetId).slice(0, 160),
        targetType: body.targetType,
        reason: String(body.reason).slice(0, 800),
        reportedByUid: user.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }),
    },
    currentDocument: { exists: false },
  }], { allowAlreadyExists: true });
  return json({ ok: true, reportId });
}

async function unblockUser(env, user, blockedUid) {
  if (!blockedUid) return json({ error: 'Missing user id' }, 400);
  const blockId = `${user.uid}_${blockedUid}`;
  const blockDoc = await getDocument(env, docName(env, 'blocks', blockId));
  if (!blockDoc.exists) return json({ ok: true, removed: false });
  if (fromFirestoreFields(blockDoc.fields).blockerUid !== user.uid) {
    return json({ error: 'Forbidden' }, 403);
  }
  await firestoreCommit(env, [{ delete: blockDoc.name }]);
  return json({ ok: true, removed: true });
}

async function registerDevice(env, user, body) {
  if (!body.token) return json({ error: 'Missing device token' }, 400);
  const deviceId = await hashToken(body.token);
  const now = new Date().toISOString();
  const platform = body.platform || 'android';

  await firestoreCommit(env, [
    {
      update: {
        name: docName(env, 'users', user.uid, 'devices', deviceId),
        fields: toFirestoreFields({
          token: body.token,
          platform,
          updatedAt: now,
        }),
      },
    },
  ]);

  try {
    await upsertPushToken(env, {
      id: deviceId,
      uid: user.uid,
      token: body.token,
      platform,
    });
  } catch (error) {
    await logDualWriteFailure(env, {
      feature: 'push',
      entityType: 'push_tokens',
      entityId: deviceId,
      operation: 'register',
      error,
    });
  }

  return json({ ok: true });
}

async function prayForRequest(env, user, prayerId) {
  await checkCommunityAccess(env, user.uid);
  const prayer = await getDocument(env, docName(env, 'prayers', prayerId));
  if (!prayer.exists) return json({ error: 'Prayer not found' }, 404);

  const data = fromFirestoreFields(prayer.fields);
  if (data.privacy === 'private' && data.authorUid !== user.uid) {
    return json({ error: 'Prayer not found' }, 404);
  }
  if (data.authorUid === user.uid) {
    return json({ error: 'You cannot pray for your own prayer request.' }, 403);
  }
  const now = new Date().toISOString();
  const timeZone = await resolveUserTimeZone(gamificationFirestore, env, user.uid, null);
  const dayKey = dayKeyInTimeZone(new Date(now), timeZone);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const prayerLimit = ['once', 'weekly'].includes(data.prayerLimit) ? data.prayerLimit : 'daily';
  const prayDocId = prayerLimit === 'once'
    ? user.uid
    : prayerLimit === 'weekly'
      ? `${user.uid}_${weekKey}`
      : `${user.uid}_${dayKey}`;
  const prayDoc = docName(env, 'prayers', prayerId, 'prays', prayDocId);
  const existingPray = await getDocument(env, prayDoc);
  if (existingPray.exists) return json({ ok: true, duplicate: true, dayKey, weekKey, prayerLimit });
  await enforceCooldown(env, user.uid, 'pray', 1);

  const writes = [
    {
      update: {
        name: prayDoc,
        fields: toFirestoreFields({
          uid: user.uid,
          dayKey,
          prayerId,
          prayerLimit,
          authorUid: data.authorUid || null,
          createdAt: now,
        }),
      },
      currentDocument: { exists: false },
    },
    {
      transform: {
        document: prayer.name,
        fieldTransforms: [
          { fieldPath: 'prayedCount', increment: { integerValue: '1' } },
          { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
        ],
      },
    },
  ];

  const prefs = await getNotificationSettings(env, data.authorUid);
  const notifyAllowed = data.authorUid
    && data.authorUid !== user.uid
    && prefs.prayerActivity !== false
    && !(await recipientBlockedActor(env, data.authorUid, user.uid));
  if (notifyAllowed) {
    writes.push(notificationWrite(env, data.authorUid, {
      type: 'prayer_prayed',
      message: 'Someone prayed for your request.',
      relatedId: prayerId,
      actorUid: user.uid,
    }));
  }

  const result = await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'prayers',
    entityType: 'prayer_prays',
    entityId: `${prayerId}:${prayDocId}`,
    operation: 'pray',
    writes,
    commitOptions: { allowAlreadyExists: true },
    syncD1: async () => {
      await insertPrayerPray(env, {
        id: prayDocId,
        prayer_id: prayerId,
        uid: user.uid,
        day_key: dayKey,
        week_key: weekKey,
        prayer_limit: prayerLimit,
        author_uid: data.authorUid || null,
        created_at: now,
      });
      await incrementPrayerPrayedCount(env, prayerId, now);
    },
  });
  if (result.alreadyExists) return json({ ok: true, duplicate: true, dayKey, weekKey, prayerLimit });

  if (notifyAllowed) {
    await invalidateUserNotificationStream(env, data.authorUid);
    if (prefs.pushEnabled !== false) {
      await sendPushToUser(env, data.authorUid, {
        title: 'PrayerStride',
        body: 'Someone prayed for your request.',
        data: { type: 'prayer_prayed', relatedId: prayerId },
      });
    }
  }

  const xp = await awardPrayActionXp(gamificationFirestore, env, {
    uid: user.uid,
    prayerId,
    timeZone,
    now: new Date(now),
  });

  return json({
    ok: true,
    duplicate: false,
    dayKey,
    weekKey,
    prayerLimit,
    xpAwarded: xp.awarded,
    bonuses: xp.bonuses || [],
  });
}

async function reactToTestimony(env, user, testimonyId, reaction) {
  await checkCommunityAccess(env, user.uid);
  if (!['praiseGod', 'amen'].includes(reaction)) {
    return json({ error: 'Unsupported reaction' }, 400);
  }

  const testimony = await getDocument(env, docName(env, 'testimonies', testimonyId));
  if (!testimony.exists) return json({ error: 'Testimony not found' }, 404);

  const data = fromFirestoreFields(testimony.fields);
  const now = new Date().toISOString();
  const reactionDoc = docName(env, 'testimonies', testimonyId, 'reactions', `${user.uid}_${reaction}`);
  const message = reaction === 'amen' ? 'Someone said Amen to your testimony.' : 'Someone praised God for your testimony.';
  const existingReaction = await getDocument(env, reactionDoc);
  if (existingReaction.exists) return json({ ok: true, duplicate: true });
  await enforceCooldown(env, user.uid, `react:${reaction}`, 1);

  const writes = [
    {
      update: {
        name: reactionDoc,
        fields: toFirestoreFields({
          uid: user.uid,
          reaction,
          createdAt: now,
        }),
      },
      currentDocument: { exists: false },
    },
    {
      transform: {
        document: testimony.name,
        fieldTransforms: [
          { fieldPath: reaction, increment: { integerValue: '1' } },
          { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
        ],
      },
    },
  ];

  const prefs = await getNotificationSettings(env, data.authorUid);
  const notifyAllowed = data.authorUid
    && data.authorUid !== user.uid
    && prefs.testimonyReactions !== false
    && !(await recipientBlockedActor(env, data.authorUid, user.uid));
  if (notifyAllowed) {
    writes.push(notificationWrite(env, data.authorUid, {
      type: 'testimony_reaction',
      message,
      relatedId: testimonyId,
      actorUid: user.uid,
      reaction,
    }));
  }

  const result = await firestoreCommit(env, writes, { allowAlreadyExists: true });
  if (result.alreadyExists) return json({ ok: true, duplicate: true });

  if (notifyAllowed) {
    await invalidateUserNotificationStream(env, data.authorUid);
    if (prefs.pushEnabled !== false) {
      await sendPushToUser(env, data.authorUid, {
        title: 'PrayerStride',
        body: message,
        data: { type: 'testimony_reaction', relatedId: testimonyId, reaction },
      });
    }
  }

  return json({ ok: true });
}

async function adminDeleteContent(env, user, body) {
  await requireAdmin(env, user);
  if (!body.targetId || !body.targetType) {
    return json({ error: 'Missing targetId or targetType' }, 400);
  }
  if (!['prayer', 'testimony'].includes(body.targetType)) {
    return json({ error: 'targetType must be prayer or testimony' }, 400);
  }
  const collectionMap = { prayer: 'prayers', testimony: 'testimonies' };
  const collection = collectionMap[body.targetType];
  const targetDoc = await getDocument(env, docName(env, collection, body.targetId));
  if (!targetDoc.exists) return json({ error: 'Content not found' }, 404);

  await deleteContentAndActions(env, collection, targetDoc);
  return json({ ok: true });
}

async function adminSuspendUser(env, user, body) {
  await requireAdmin(env, user);
  if (!body.targetUid) return json({ error: 'Missing targetUid' }, 400);
  if (body.targetUid === user.uid) return json({ error: 'Cannot suspend yourself' }, 400);

  const targetUser = await getDocument(env, docName(env, 'users', body.targetUid));
  if (!targetUser.exists) return json({ error: 'User not found' }, 404);

  const targetData = fromFirestoreFields(targetUser.fields);
  if (targetData.role === 'admin') return json({ error: 'Cannot suspend another admin' }, 400);

  const reason = String(body.reason || 'Violation of community guidelines').trim().slice(0, 240);
  const writes = [
    {
      update: {
        name: targetUser.name,
        fields: toFirestoreFields({
          ...targetData,
          suspended: true,
          suspendedReason: reason,
          suspendedAt: new Date().toISOString(),
          suspendedBy: user.uid,
        }),
      },
    },
    notificationWrite(env, body.targetUid, {
      type: 'account_suspended',
      message: `Your account has been suspended: ${reason}`,
      actorUid: user.uid,
    }),
  ];

  await firestoreCommit(env, writes);
  await invalidateUserNotificationStream(env, body.targetUid);
  await sendPushToUser(env, body.targetUid, {
    title: 'PrayerStride',
    body: `Your account has been suspended: ${reason}`,
    data: { type: 'account_suspended' },
    bypassQuietHours: true,
  });
  return json({ ok: true });
}

async function adminUnsuspendUser(env, user, body) {
  await requireAdmin(env, user);
  if (!body.targetUid) return json({ error: 'Missing targetUid' }, 400);
  const targetUser = await getDocument(env, docName(env, 'users', body.targetUid));
  if (!targetUser.exists) return json({ error: 'User not found' }, 404);
  const data = fromFirestoreFields(targetUser.fields);
  await firestoreCommit(env, [{
    update: {
      name: targetUser.name,
      fields: toFirestoreFields({
        ...data,
        suspended: false,
        suspendedReason: null,
        suspendedAt: null,
        suspendedBy: null,
        updatedAt: new Date().toISOString(),
      }),
    },
  }]);
  return json({ ok: true });
}

async function adminUpdateReport(env, user, body) {
  await requireAdmin(env, user);
  if (!body.reportId || !['resolved', 'dismissed'].includes(body.status)) {
    return json({ error: 'Missing or invalid report update' }, 400);
  }
  const report = await getDocument(env, docName(env, 'reports', body.reportId));
  if (!report.exists) return json({ error: 'Report not found' }, 404);
  const data = fromFirestoreFields(report.fields);
  await firestoreCommit(env, [{
    update: {
      name: report.name,
      fields: toFirestoreFields({
        ...data,
        status: body.status,
        resolvedBy: user.uid,
        resolvedAt: new Date().toISOString(),
      }),
    },
  }]);
  return json({ ok: true, reportId: body.reportId, status: body.status });
}

const ANNOUNCEMENT_CATEGORIES = ['events', 'prayer', 'updates'];

function validateAnnouncementFields(body, requireId = false) {
  const missing = [];
  if (requireId && !body.announcementId) missing.push('announcementId');
  if (!body.title) missing.push('title');
  if (!body.body) missing.push('body');
  if (!body.category) missing.push('category');
  if (!body.startsAt) missing.push('startsAt');
  if (missing.length) return { error: `Missing ${missing.join(', ')}` };
  if (!ANNOUNCEMENT_CATEGORIES.includes(body.category)) {
    return { error: 'category must be events, prayer, or updates' };
  }
  if (!isIsoDate(body.startsAt) || (body.endsAt && !isIsoDate(body.endsAt))) {
    return { error: 'startsAt and endsAt must be valid ISO timestamps' };
  }
  return null;
}

function isIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((tag) => typeof tag === 'string')
    .map((tag) => tag.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 10);
}

async function adminCreateAnnouncement(env, user, body) {
  await requireAdmin(env, user);
  const validationError = validateAnnouncementFields(body);
  if (validationError) return json(validationError, 400);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await firestoreCommit(env, [{
    update: {
      name: docName(env, 'announcements', id),
      fields: toFirestoreFields({
        title: String(body.title).slice(0, 120),
        body: String(body.body).slice(0, 2000),
        category: body.category,
        startsAt: body.startsAt,
        endsAt: body.endsAt || null,
        status: 'active',
        createdByUid: user.uid,
        createdAt: now,
        updatedAt: now,
      }),
    },
  }]);
  return json({ ok: true, announcementId: id });
}

async function adminUpdateAnnouncement(env, user, body) {
  await requireAdmin(env, user);
  const validationError = validateAnnouncementFields(body, true);
  if (validationError) return json(validationError, 400);

  const announcement = await getDocument(env, docName(env, 'announcements', body.announcementId));
  if (!announcement.exists) return json({ error: 'Announcement not found' }, 404);

  const now = new Date().toISOString();
  const data = fromFirestoreFields(announcement.fields);
  await firestoreCommit(env, [{
    update: {
      name: announcement.name,
      fields: toFirestoreFields({
        title: String(body.title).slice(0, 120),
        body: String(body.body).slice(0, 2000),
        category: body.category,
        startsAt: body.startsAt,
        endsAt: body.endsAt || null,
        status: data.status || 'active',
        createdByUid: data.createdByUid,
        createdAt: data.createdAt,
        updatedAt: now,
      }),
    },
  }]);
  return json({ ok: true, announcementId: body.announcementId });
}

async function adminArchiveAnnouncement(env, user, body) {
  await requireAdmin(env, user);
  if (!body.announcementId) return json({ error: 'Missing announcementId' }, 400);

  const announcement = await getDocument(env, docName(env, 'announcements', body.announcementId));
  if (!announcement.exists) return json({ error: 'Announcement not found' }, 404);

  const data = fromFirestoreFields(announcement.fields);
  const now = new Date().toISOString();
  await firestoreCommit(env, [{
    update: {
      name: announcement.name,
      fields: toFirestoreFields({
        ...data,
        status: 'archived',
        updatedAt: now,
      }),
    },
  }]);
  return json({ ok: true, announcementId: body.announcementId, status: 'archived' });
}

async function adminDeleteAccount(env, user, body) {
  await requireAdmin(env, user);
  if (!body.targetUid) return json({ error: 'Missing targetUid' }, 400);
  if (body.targetUid === user.uid) return json({ error: 'Cannot delete your own admin account via this endpoint. Use /api/account instead.' }, 400);

  const targetUser = await getDocument(env, docName(env, 'users', body.targetUid));
  const existingDeletionJob = await getDocument(env, docName(env, 'accountDeletionJobs', body.targetUid));
  if (!targetUser.exists && !existingDeletionJob.exists) return json({ error: 'User not found' }, 404);

  if (targetUser.exists) {
    const targetData = fromFirestoreFields(targetUser.fields);
    if (targetData.role === 'admin') return json({ error: 'Cannot delete another admin account' }, 400);
  }

  return deleteUserData(env, body.targetUid);
}

async function deleteOwnAccount(env, user, idToken) {
  return deleteUserData(env, user.uid, { selfService: true, idToken });
}

async function deleteUserData(env, uid, options = {}) {
  if (options.selfService) {
    const payload = decodeJwtPayload(options.idToken);
    const authTime = Number(payload.auth_time || 0);
    if (!authTime || (Date.now() / 1000) - authTime > 300) {
      return json({ error: 'Please sign in again before deleting your account.' }, 403);
    }
  }

  const tombstoneName = docName(env, 'accountDeletionJobs', uid);
  const existing = await getDocument(env, tombstoneName);
  if (existing.exists) {
    const job = fromFirestoreFields(existing.fields);
    if (job.status === 'complete') return json({ ok: true, alreadyDeleted: true });
  }

  const now = new Date().toISOString();
  const priorAttempts = existing.exists ? (fromFirestoreFields(existing.fields).attempts || 0) : 0;
  await firestoreCommit(env, [{
    update: {
      name: tombstoneName,
      fields: toFirestoreFields({
        uid,
        status: 'in_progress',
        startedAt: existing.exists ? fromFirestoreFields(existing.fields).startedAt || now : now,
        updatedAt: now,
        attempts: priorAttempts + 1,
        lastError: null,
      }),
    },
  }]);

  try {
    const writes = await collectUserDeletionWrites(env, uid);
    await commitInChunks(env, writes);
    try {
      await deleteStoragePrefix(env, `avatars/${uid}/`);
    } catch (storageError) {
      log(env, 'warn', { uid, message: storageError.message }, 'storage-delete-non-fatal');
    }
    await deleteFirebaseAuthUser(env, uid);
    await firestoreCommit(env, [{
      update: {
        name: tombstoneName,
        fields: toFirestoreFields({
          uid,
          status: 'complete',
          startedAt: existing.exists ? fromFirestoreFields(existing.fields).startedAt || now : now,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          purgeAfter: new Date(Date.now() + 30 * 86400000).toISOString(),
        }),
      },
    }]);
    return json({ ok: true });
  } catch (error) {
    log(env, 'error', {
      uidHashPrefix: (await hashToken(`account:${uid}`)).slice(0, 10),
      message: error.message,
    }, 'account-deletion-failed');
    await firestoreCommit(env, [{
      update: {
        name: tombstoneName,
        fields: toFirestoreFields({
          uid,
          status: 'failed',
          updatedAt: new Date().toISOString(),
          lastError: error.message,
          attempts: priorAttempts + 1,
        }),
      },
    }]);
    throw Object.assign(new Error('Account deletion failed. Please try again or contact support.'), {
      status: 500,
      publicMessage: 'Account deletion failed. Please try again or contact support.',
    });
  }
}

async function collectUserDeletionWrites(env, uid) {
  const userDoc = await getDocument(env, docName(env, 'users', uid));

  const writes = [];
  const deletedNames = new Set();
  const addDelete = (name) => {
    if (deletedNames.has(name)) return;
    deletedNames.add(name);
    writes.push({ delete: name });
  };
  if (userDoc.exists) addDelete(userDoc.name);

  const processCollection = async (collectionName, matchField) => {
    const docs = await listDocuments(env, docName(env, collectionName));
    for (const d of docs) {
      const data = fromFirestoreFields(d.fields || {});
      if (!matchField(data, d)) continue;
      addDelete(d.name);
      if (collectionName === 'prayers' || collectionName === 'testimonies') {
        const subName = collectionName === 'prayers' ? 'prays' : 'reactions';
        const subs = await listDocuments(env, docName(env, collectionName, dataId(d), subName));
        for (const s of subs) addDelete(s.name);
      }
    }
  };

  const processOwnedActionCollection = async (collectionName) => {
    const parentCollection = collectionName === 'prays' ? 'prayers' : 'testimonies';
    const matchOwned = (data) => data.uid === uid;

    try {
      const docs = await runCollectionGroupQuery(env, collectionName, [{
        fieldFilter: {
          field: { fieldPath: 'uid' },
          op: 'EQUAL',
          value: { stringValue: uid },
        },
      }]);
      for (const d of docs) {
        if (matchOwned(fromFirestoreFields(d.fields || {}))) addDelete(d.name);
      }
      return;
    } catch (error) {
      log(env, 'warn', { collectionName, message: error.message }, 'deletion-query-fallback');
    }

    const parents = await listDocuments(env, docName(env, parentCollection));
    for (const parent of parents) {
      const parentId = dataId(parent);
      const subs = await listDocuments(env, docName(env, parentCollection, parentId, collectionName));
      for (const sub of subs) {
        if (matchOwned(fromFirestoreFields(sub.fields || {}))) addDelete(sub.name);
      }
    }
  };

  await processCollection('prayers', (d) => d.authorUid === uid);
  await processCollection('testimonies', (d) => d.authorUid === uid);
  await processOwnedActionCollection('prays');
  await processOwnedActionCollection('reactions');
  await processCollection('prayerSessions', (d) => d.authorUid === uid);
  const xpDeletes = await deleteUserXpEvents(gamificationFirestore, env, uid);
  for (const write of xpDeletes) addDelete(write.delete);
  for (const write of deleteUserGamificationSummary(gamificationFirestore, env, uid)) addDelete(write.delete);
  await processCollection('calendarEvents', (d) => d.ownerUid === uid);
  await processCollection('calendarBookmarks', (d) => d.ownerUid === uid);
  await processCollection('notifications', (d) => d.recipientUid === uid || d.actorUid === uid);
  await processCollection('reports', (d) => d.reportedByUid === uid || d.targetId === uid);
  await processCollection('blocks', (d, doc) => d.blockerUid === uid || d.blockedUid === uid || doc.name.endsWith(`_${uid}`) || doc.name.startsWith(`${uid}_`));
  addDelete(docName(env, 'apiRateLimits', await hashToken(`rate:user:${uid}`)));

  const deviceDocs = await listDocuments(env, docName(env, 'users', uid, 'devices'));
  for (const d of deviceDocs) addDelete(d.name);

  addDelete(docName(env, 'notificationSettings', uid));
  return writes;
}

async function commitInChunks(env, writes, chunkSize = 400) {
  for (let i = 0; i < writes.length; i += chunkSize) {
    await firestoreCommit(env, writes.slice(i, i + chunkSize));
  }
}

async function deleteFirebaseAuthUser(env, uid) {
  const accessToken = await getGoogleAccessToken(env);
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/accounts:delete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ localId: uid, targetProjectId: env.FIREBASE_PROJECT_ID }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    const message = result.error?.message || 'Auth deletion failed';
    if (response.status === 404 || result.error?.status === 'NOT_FOUND' || String(message).includes('USER_NOT_FOUND')) return;
    throw new Error(message);
  }
}

async function deleteStoragePrefix(env, prefix) {
  const bucket = env.FIREBASE_STORAGE_BUCKET;
  if (!bucket) {
    log(env, 'warn', { prefix }, 'storage-delete-skipped-no-bucket');
    return 0;
  }

  const accessToken = await getGoogleAccessToken(env);
  let pageToken = '';
  let deleted = 0;

  do {
    const url = new URL(`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o`);
    url.searchParams.set('prefix', prefix);
    url.searchParams.set('maxResults', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const listResponse = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!listResponse.ok) {
      const result = await listResponse.json().catch(() => ({}));
      throw new Error(result.error?.message || 'Storage list failed');
    }

    const listResult = await listResponse.json();
    const items = listResult.items || [];
    for (const item of items) {
      const deleteResponse = await fetch(
        `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(item.name)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!deleteResponse.ok && deleteResponse.status !== 404) {
        const result = await deleteResponse.json().catch(() => ({}));
        throw new Error(result.error?.message || `Storage delete failed for ${item.name}`);
      }
      deleted += 1;
    }
    pageToken = listResult.nextPageToken || '';
  } while (pageToken);

  return deleted;
}

async function retryFailedDeletionJobs(env, maxJobs = 20) {
  const docs = await listDocuments(env, docName(env, 'accountDeletionJobs'));
  let retried = 0;
  let completed = 0;

  for (const document of docs) {
    if (retried >= maxJobs) break;
    const job = fromFirestoreFields(document.fields || {});
    if (job.status !== 'failed') continue;
    retried += 1;
    try {
      const response = await deleteUserData(env, job.uid || dataId(document));
      if (response.ok) completed += 1;
    } catch (error) {
      log(env, 'warn', {
        uidHashPrefix: (await hashToken(`account:${job.uid || dataId(document)}`)).slice(0, 10),
        message: error.message,
      }, 'scheduled-deletion-retry-failed');
    }
  }

  return { retried, completed };
}

async function purgeExpiredDeletionTombstones(env) {
  const docs = await listDocuments(env, docName(env, 'accountDeletionJobs'));
  const now = Date.now();
  const writes = [];

  for (const document of docs) {
    const data = fromFirestoreFields(document.fields || {});
    if (data.status !== 'complete' || !data.purgeAfter) continue;
    if (new Date(data.purgeAfter).getTime() > now) continue;
    writes.push({ delete: document.name });
  }

  if (writes.length) await commitInChunks(env, writes);
  return writes.length;
}

async function purgeExpiredRateLimits(env) {
  const docs = await listDocuments(env, docName(env, 'apiRateLimits'));
  const cutoff = Date.now() - 86400000;
  const writes = docs
    .filter((document) => {
      const updatedAt = fromFirestoreFields(document.fields || {}).updatedAt;
      return updatedAt && new Date(updatedAt).getTime() < cutoff;
    })
    .map((document) => ({ delete: document.name }));
  if (writes.length) await commitInChunks(env, writes);
  return writes.length;
}

function decodeJwtPayload(token) {
  try {
    const part = String(token || '').split('.')[1];
    if (!part) return {};
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function dataId(doc) {
  return doc.name.split('/').pop();
}

function notificationWrite(env, recipientUid, notification) {
  return {
    update: {
      name: docName(env, 'notifications', crypto.randomUUID()),
      fields: toFirestoreFields({
        ...notification,
        recipientUid,
        read: false,
        createdAt: new Date().toISOString(),
      }),
    },
    currentDocument: { exists: false },
  };
}

async function sendPushToUser(env, uid, payload) {
  if (!payload.bypassQuietHours && await pushPausedForQuietHours(env, uid)) return;
  const staleCutoff = Date.now() - 90 * 86400000;
  let mappedDevices = [];

  const d1Tokens = await listPushTokensForUid(env, uid);
  if (d1Tokens?.length) {
    mappedDevices = d1Tokens.map((row) => ({
      token: row.token,
      updatedAt: row.updatedAt,
      name: docName(env, 'users', uid, 'devices', row.id),
      id: row.id,
    }));
  } else {
    const devices = await listDocuments(env, docName(env, 'users', uid, 'devices'));
    mappedDevices = devices
      .map((document) => ({ ...fromFirestoreFields(document.fields), name: document.name }))
      .filter((device) => device.token);
  }

  const staleDevices = mappedDevices
    .filter((device) => device.updatedAt && new Date(device.updatedAt).getTime() < staleCutoff);
  if (staleDevices.length) {
    await commitInChunks(env, staleDevices.map((device) => ({ delete: device.name })));
    await Promise.all(staleDevices.map((device) => deletePushTokenById(env, device.id || device.name.split('/').pop())));
  }
  const tokens = mappedDevices
    .filter((device) => device.token)
    .filter((device) => !device.updatedAt || new Date(device.updatedAt).getTime() >= staleCutoff);

  await Promise.all(tokens.map(async (device) => {
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await sendFcm(env, device.token, payload);
        return;
      } catch (error) {
        lastError = error;
        if (error.invalidToken) break;
        if (attempt < 2) await sleep(Math.pow(2, attempt) * 200);
      }
    }
    log(env, 'error', { uid, tokenPrefix: device.token.slice(0, 10), error: lastError?.message, attempts: lastError?.invalidToken ? 1 : 3 }, 'fcm-send-failed');
    if (lastError?.invalidToken) {
      await firestoreCommit(env, [{ delete: device.name }]).catch(() => {});
      await deletePushTokenById(env, device.id || device.name.split('/').pop());
      log(env, 'info', { uid, deviceName: device.name }, 'invalid-token-cleaned');
    }
  }));
}

async function pushPausedForQuietHours(env, uid, now = new Date()) {
  const prefs = await getNotificationSettings(env, uid);
  if (prefs.pushEnabled === false) return true;
  const profile = await getUserProfile(env, uid);
  const timeZone = profile?.timeZone || 'UTC';
  let hour;
  try {
    hour = Number(new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: false,
    }).format(now));
  } catch {
    hour = now.getUTCHours();
  }
  return hour >= 22 || hour < 7;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendFcm(env, token, payload) {
  const accessToken = await getGoogleAccessToken(env);
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: payload.title, body: payload.body },
        data: stringifyData(payload.data || {}),
      },
    }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    const status = result.error?.status || '';
    if (['NOT_FOUND', 'INVALID_ARGUMENT', 'UNREGISTERED', 'SENDER_ID_MISMATCH', 'THIRD_PARTY_AUTH_ERROR'].includes(status)) {
      throw Object.assign(new Error('Invalid FCM token'), { invalidToken: true });
    }
    throw new Error(result.error?.message || 'FCM send failed');
  }
}

async function verifyFirebaseUser(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  let idToken = authHeader.replace(/^Bearer\s+/i, '');
  if (!idToken) {
    idToken = new URL(request.url).searchParams.get('access_token') || '';
  }
  if (!idToken) {
    throw Object.assign(new Error('Missing Firebase ID token'), {
      status: 401,
      publicMessage: 'Authentication required',
    });
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const result = await response.json();
  if (!response.ok || !result.users?.[0]) {
    throw Object.assign(new Error('Invalid Firebase ID token'), {
      status: 401,
      publicMessage: 'Invalid authentication token',
    });
  }
  if (result.users[0].disabled) throw Object.assign(new Error('This account has been disabled.'), { status: 403, publicMessage: 'Account disabled' });
  return {
    uid: result.users[0].localId,
    email: result.users[0].email,
    emailVerified: result.users[0].emailVerified === true,
  };
}

async function requireAdmin(env, user) {
  const userDoc = await getDocument(env, docName(env, 'users', user.uid));
  if (!userDoc.exists) throw Object.assign(new Error('User profile not found'), { status: 403, publicMessage: 'Access denied' });
  const data = fromFirestoreFields(userDoc.fields);
  if (data.suspended === true) throw Object.assign(new Error('Your account has been suspended.'), { status: 403, publicMessage: 'Account suspended' });
  if (data.role !== 'admin') throw Object.assign(new Error('Admin access required'), { status: 403, publicMessage: 'Access denied' });
}

async function checkNotSuspended(env, uid) {
  const userDoc = await getDocument(env, docName(env, 'users', uid));
  if (userDoc.exists) {
    const data = fromFirestoreFields(userDoc.fields);
    if (data.suspended === true) {
      throw Object.assign(new Error('Your account has been suspended.'), { status: 403, publicMessage: 'Account suspended' });
    }
  }
}

async function getDocument(env, name) {
  const accessToken = await getGoogleAccessToken(env);
  const response = await fetch(`https://firestore.googleapis.com/v1/${name}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 404) return { exists: false };
  const document = await response.json();
  if (!response.ok) throw new Error(document.error?.message || 'Firestore read failed');
  return { ...document, exists: true };
}

async function firestoreCommit(env, writes, options = {}) {
  const accessToken = await getGoogleAccessToken(env);
  const body = { writes };
  if (options.precondition) {
    for (const write of writes) {
      if (write.update && !write.currentDocument) {
        write.currentDocument = options.precondition;
      }
    }
  }
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    if (options.allowAlreadyExists && result.error?.status === 'ALREADY_EXISTS') {
      return { alreadyExists: true };
    }
    if (result.error?.status === 'FAILED_PRECONDITION') {
      return { preconditionFailed: true };
    }
    throw new Error(result.error?.message || 'Firestore commit failed');
  }
  return result;
}

async function listDocuments(env, parentName) {
  const accessToken = await getGoogleAccessToken(env);
  return listAllDocumentPages(async (pageToken) => {
    const url = new URL(`https://firestore.googleapis.com/v1/${parentName}`);
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.status === 404) return { status: 404 };
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        status: response.status,
        errorMessage: result.error?.message || 'Firestore list failed',
      };
    }
    return {
      status: 200,
      documents: result.documents || [],
      nextPageToken: result.nextPageToken || '',
    };
  });
}

async function getNotificationSettings(env, uid) {
  if (!uid) return {};
  const settings = await getDocument(env, docName(env, 'notificationSettings', uid));
  return settings.exists ? fromFirestoreFields(settings.fields) : {};
}

async function runStructuredQuery(env, fromClause, filters = [], orderByFields = [], selectFields = []) {
  const accessToken = await getGoogleAccessToken(env);
  const structuredQuery = { from: fromClause };

  if (selectFields.length > 0) {
    structuredQuery.select = {
      fields: selectFields.map((fieldPath) => ({ fieldPath })),
    };
  }

  if (filters.length > 0) {
    if (filters.length === 1) {
      structuredQuery.where = filters[0];
    } else {
      structuredQuery.where = { compositeFilter: { op: 'AND', filters } };
    }
  }

  if (orderByFields.length > 0) {
    structuredQuery.orderBy = orderByFields;
  }

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ structuredQuery }),
    },
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error?.message || 'Firestore query failed');
  }

  const results = await response.json();
  return (results || [])
    .filter((r) => r.document)
    .map((r) => ({
      name: r.document.name,
      fields: r.document.fields || {},
    }));
}

async function runCollectionQuery(env, collectionId, filters = [], orderByFields = [], selectFields = []) {
  return runStructuredQuery(env, [{ collectionId }], filters, orderByFields, selectFields);
}

async function runCollectionGroupQuery(env, collectionId, filters = [], orderByFields = [], selectFields = [], allDescendants = true) {
  return runStructuredQuery(
    env,
    [{ collectionId, allDescendants }],
    filters,
    orderByFields,
    selectFields,
  );
}

async function spiritualEngagementMetrics(env, user, days) {
  const now = new Date();
  const cutoffISO = new Date(now.getTime() - days * 86400000).toISOString();

  // 1. Query all prayers created in the window (collection-group on prayers)
  let prayerDocs;
  let prayDocs;
  try {
    prayerDocs = await runCollectionGroupQuery(env, 'prayers', [
    {
      fieldFilter: {
        field: { fieldPath: 'createdAt' },
        op: 'GREATER_THAN_OR_EQUAL',
        value: { timestampValue: cutoffISO },
      },
    },
  ], [
    { field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' },
    ], ['authorUid', 'createdAt']);

    prayDocs = await runCollectionGroupQuery(env, 'prays', [
      {
        fieldFilter: {
          field: { fieldPath: 'createdAt' },
          op: 'GREATER_THAN_OR_EQUAL',
          value: { timestampValue: cutoffISO },
        },
      },
    ], [
      { field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' },
    ], ['uid', 'prayerId', 'createdAt']);
  } catch (error) {
    log(env, 'warn', { message: error.message }, 'analytics-query-fallback');
    prayerDocs = (await listDocuments(env, docName(env, 'prayers')))
      .filter((d) => fromFirestoreFields(d.fields || {}).createdAt >= cutoffISO);
    const nestedPrays = await Promise.all(prayerDocs.map(async (d) => {
      const prayerId = dataId(d);
      const docs = await listDocuments(env, docName(env, 'prayers', prayerId, 'prays'));
      return docs.map((pray) => ({ ...pray, prayerId }));
    }));
    prayDocs = nestedPrays.flat()
      .filter((d) => fromFirestoreFields(d.fields || {}).createdAt >= cutoffISO);
  }

  const prayers = prayerDocs.map((d) => ({
    id: d.name.split('/').pop(),
    ...fromFirestoreFields(d.fields),
  }));

  const prays = prayDocs.map((d) => ({
    id: d.name.split('/').pop(),
    prayerId: d.prayerId || (d.name.split('/documents/')[1]?.split('/prays/')[0]?.split('/').pop() || ''),
    ...fromFirestoreFields(d.fields),
  }));

  const result = computeSpiritualEngagementMetrics(prayers, prays, days, now);
  return json({ ok: true, ...result });
}

async function enforceCooldown(env, uid, action, seconds) {
  const key = await hashToken(`${uid}:${action}`);
  const name = docName(env, 'apiRateLimits', key);
  const now = new Date();
  const current = await getDocument(env, name);
  if (current.exists) {
    const data = fromFirestoreFields(current.fields);
    const last = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
    if (Number.isFinite(last) && now.getTime() - last < seconds * 1000) {
      throw Object.assign(new Error('Please wait a moment before trying again.'), {
        status: 429,
        publicMessage: 'Please wait a moment before trying again.',
      });
    }
  }
  const precondition = current.exists
    ? { updateTime: current.updateTime }
    : { exists: false };
  await firestoreCommit(env, [{
    update: {
      name,
      fields: toFirestoreFields({ uid, action, updatedAt: now.toISOString() }),
    },
  }], { precondition }).then((result) => {
    if (result.preconditionFailed) {
      throw Object.assign(new Error('Please wait a moment before trying again.'), {
        status: 429,
        publicMessage: 'Please wait a moment before trying again.',
      });
    }
  });
}

async function enforceGlobalRateLimit(env, request, requestId) {
  const configuredLimit = Number(env.RATE_LIMIT_PER_MINUTE);
  const maxPerMinute = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 120;
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipKey = await hashToken(`rate:ip:${clientIp}`);
  const rateDoc = docName(env, 'apiRateLimits', ipKey);

  for (let attempt = 1; attempt <= RATE_LIMIT_COMMIT_ATTEMPTS; attempt += 1) {
    const now = Date.now();
    const minuteWindow = Math.floor(now / 60000).toString();
    const current = await getDocument(env, rateDoc);
    const data = current.exists ? fromFirestoreFields(current.fields) : {};
    if (data.window === minuteWindow && data.count >= maxPerMinute) {
      log(env, 'warn', { requestId, ipHashPrefix: ipKey.slice(0, 10), count: data.count }, 'rate-limited');
      throw Object.assign(new Error('Too many requests. Please slow down.'), { status: 429, publicMessage: 'Rate limit exceeded' });
    }

    const isNewWindow = !current.exists || data.window !== minuteWindow;
    const count = isNewWindow ? 1 : ((data.count || 0) + 1);
    const result = await firestoreCommit(env, [{
      update: {
        name: rateDoc,
        fields: toFirestoreFields({
          ipHash: ipKey,
          window: minuteWindow,
          count,
          updatedAt: new Date(now).toISOString(),
        }),
      },
    }], { precondition: current.exists ? { updateTime: current.updateTime } : { exists: false } });
    if (!result.preconditionFailed) return;
    await waitForRateLimitRetry(attempt);
  }

  log(env, 'warn', { requestId, ipHashPrefix: ipKey.slice(0, 10) }, 'rate-limit-precondition-failed');
  throw Object.assign(new Error('Too many concurrent requests. Please retry shortly.'), {
    status: 429,
    publicMessage: 'Please retry shortly.',
  });
}

async function enforceUserRateLimit(env, uid, requestId) {
  const configuredLimit = Number(env.USER_RATE_LIMIT_PER_MINUTE);
  const maxPerMinute = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 180;
  const userKey = await hashToken(`rate:user:${uid}`);
  const rateDoc = docName(env, 'apiRateLimits', userKey);

  for (let attempt = 1; attempt <= RATE_LIMIT_COMMIT_ATTEMPTS; attempt += 1) {
    const now = Date.now();
    const minuteWindow = Math.floor(now / 60000).toString();
    const current = await getDocument(env, rateDoc);
    const data = current.exists ? fromFirestoreFields(current.fields) : {};
    if (data.window === minuteWindow && data.count >= maxPerMinute) {
      log(env, 'warn', { requestId, uidHashPrefix: userKey.slice(0, 10), count: data.count }, 'user-rate-limited');
      throw Object.assign(new Error('Too many requests. Please slow down.'), { status: 429, publicMessage: 'Rate limit exceeded' });
    }

    const count = data.window === minuteWindow ? (data.count || 0) + 1 : 1;
    const result = await firestoreCommit(env, [{
      update: {
        name: rateDoc,
        fields: toFirestoreFields({ uidHash: userKey, window: minuteWindow, count, updatedAt: new Date(now).toISOString() }),
      },
    }], { precondition: current.exists ? { updateTime: current.updateTime } : { exists: false } });
    if (!result.preconditionFailed) return;
    await waitForRateLimitRetry(attempt);
  }

  log(env, 'warn', { requestId, uidHashPrefix: userKey.slice(0, 10) }, 'user-rate-limit-precondition-failed');
  throw Object.assign(new Error('Too many concurrent requests. Please retry shortly.'), { status: 429, publicMessage: 'Please retry shortly.' });
}

function waitForRateLimitRetry(attempt) {
  return new Promise((resolve) => setTimeout(resolve, attempt * 25));
}

let cachedAccessToken = null;
let cachedAccessTokenExpiry = 0;

async function getGoogleAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && now < cachedAccessTokenExpiry - 60) {
    return cachedAccessToken;
  }

  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64Url(JSON.stringify({
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: FIREBASE_SCOPE,
    aud: FIREBASE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }));
  const signature = await sign(`${header}.${claim}`, env.FIREBASE_PRIVATE_KEY);

  const response = await fetch(FIREBASE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error_description || 'Google auth failed');
  cachedAccessToken = result.access_token;
  cachedAccessTokenExpiry = now + 3600;
  return result.access_token;
}

async function sign(input, privateKey) {
  const pem = privateKey.replace(/\\n/g, '\n');
  const keyData = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const binary = Uint8Array.from(atob(keyData), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', binary, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(input));
  return base64UrlBytes(new Uint8Array(signature));
}

const firestoreApi = {
  docName,
  getDocument,
  firestoreCommit,
  fromFirestoreFields,
  toFirestoreFields,
  runCollectionQuery,
  listDocuments,
};

const gamificationFirestore = {
  ...firestoreApi,
  listDocuments,
  runCollectionQuery,
  runCollectionGroupQuery,
  getUserProfile,
};

function docName(env, ...parts) {
  return `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${parts.join('/')}`;
}

function toFirestoreFields(value) {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toFirestoreValue(item, key)]));
}

function toFirestoreValue(value, fieldPath = '') {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map((item) => toFirestoreValue(item)) } };
  if (typeof value === 'object') return { mapValue: { fields: toFirestoreFields(value) } };
  if (fieldPath.endsWith('At')
    && typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
    return { timestampValue: value };
  }
  return { stringValue: String(value) };
}

function fromFirestoreFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]));
}

function fromFirestoreValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in value) return fromFirestoreFields(value.mapValue.fields);
  return null;
}

async function hashToken(token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return base64UrlBytes(new Uint8Array(digest));
}

function stringifyData(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]));
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function withCors(response, env, request) {
  const next = new Response(response.body, response);
  const origin = request?.headers.get('Origin') || '';
  const allowedOrigins = [
    env.CORS_ORIGIN || 'https://api.prayerstride.app',
    'https://api.prayerstride.app',
    'https://prayerstride.app',
    'https://prayerstride.fanelesibonge50.workers.dev',
  ];
  const isDevelopment = env.ENVIRONMENT === 'development';
  const allowDevOrigins = isDevelopment && (env.ALLOW_DEV_ORIGINS === 'true' || env.ALLOW_DEV_ORIGINS === '1');
  const isDevOrigin = origin.startsWith('http://localhost:')
    || origin.startsWith('http://127.0.0.1:')
    || origin.startsWith('http://10.')
    || origin.startsWith('http://192.168.');
  let resolvedOrigin = origin ? '' : allowedOrigins[0];
  if (origin && allowedOrigins.includes(origin)) {
    resolvedOrigin = origin;
  } else if (allowDevOrigins && isDevOrigin && origin) {
    resolvedOrigin = origin;
  }
  if (resolvedOrigin) next.headers.set('Access-Control-Allow-Origin', resolvedOrigin);
  next.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  next.headers.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  next.headers.set('Access-Control-Max-Age', '86400');
  next.headers.set('Vary', 'Origin');
  return next;
}

function log(env, level, data, context) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    ...data,
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (env.LOG_LEVEL === 'debug' || level === 'warn') {
    console.warn(JSON.stringify(entry));
  }
}

function base64Url(value) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlBytes(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

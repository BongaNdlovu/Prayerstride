const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'mock']);
const MOCK_BASE_URL = 'https://mock.prayerstride.local';

let cachedState = null;
let idCounter = 1;

export function isMockDataEnabled() {
  return TRUE_VALUES.has(String(process.env.EXPO_PUBLIC_USE_MOCK_DATA || '').trim().toLowerCase());
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowDate() {
  return new Date();
}

function isoDaysAgo(days, hour = 10) {
  const date = nowDate();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function isoHoursAgo(hours) {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

function dateKeyDaysFromNow(days = 0) {
  const date = nowDate();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function mockXp(points, awarded = true, bonuses = []) {
  return { awarded, points: awarded ? points : 0, duplicate: !awarded, bonuses };
}

export function resetMockDataForTests() {
  cachedState = null;
  idCounter = 1;
}

function currentUserProfile(user) {
  const uid = user?.uid || 'demo-admin';
  const displayName = user?.displayName || 'Demo Admin';
  return {
    id: uid,
    uid,
    displayName,
    email: user?.email || 'demo@prayerstride.test',
    role: 'admin',
    owner: true,
    suspended: false,
    registrationState: 'complete',
    handle: 'demo-admin',
    bio: 'Testing the PrayerStride prototype migration.',
    photoURL: user?.photoURL || null,
    createdAt: isoDaysAgo(40),
    updatedAt: isoHoursAgo(2),
  };
}

function seedState(user) {
  const me = currentUserProfile(user);
  const prayers = [
    {
      id: 'mock-prayer-healing',
      title: 'Healing for my mother',
      body: 'Please pray for my mother as she recovers from surgery this week.',
      category: 'Healing',
      scriptureRef: 'Psalm 46:1',
      authorUid: 'member-ruth',
      authorName: 'Ruth M.',
      isAnonymous: false,
      prayedCount: 18,
      status: 'active',
      privacy: 'community',
      prayerLimit: 'daily',
      urgent: true,
      allowShare: true,
      createdAt: isoHoursAgo(5),
      updatedAt: isoHoursAgo(2),
    },
    {
      id: 'mock-prayer-family',
      title: 'Peace in our home',
      body: 'Pray that our family conversations become gentle, honest, and full of grace.',
      category: 'Family',
      scriptureRef: 'Colossians 3:13',
      authorUid: 'member-daniel',
      authorName: 'Daniel K.',
      isAnonymous: false,
      prayedCount: 11,
      status: 'active',
      privacy: 'community',
      prayerLimit: 'daily',
      urgent: false,
      allowShare: true,
      createdAt: isoDaysAgo(1, 14),
      updatedAt: isoDaysAgo(1, 15),
    },
    {
      id: 'mock-prayer-own',
      title: 'Courage for a difficult decision',
      body: 'I need wisdom and courage for a decision I have been delaying.',
      category: 'Guidance',
      scriptureRef: 'James 1:5',
      authorUid: me.uid,
      authorName: me.displayName,
      isAnonymous: false,
      prayedCount: 7,
      status: 'active',
      privacy: 'community',
      prayerLimit: 'daily',
      urgent: false,
      allowShare: true,
      createdAt: isoDaysAgo(2, 9),
      updatedAt: isoDaysAgo(1, 8),
    },
    {
      id: 'mock-prayer-provision',
      title: 'Work and provision',
      body: 'Please pray for steady work and peace while I wait for a response.',
      category: 'Provision',
      scriptureRef: 'Matthew 6:33',
      authorUid: 'member-hope',
      authorName: 'Hope N.',
      isAnonymous: false,
      prayedCount: 24,
      status: 'answered',
      privacy: 'community',
      prayerLimit: 'weekly',
      urgent: false,
      allowShare: true,
      createdAt: isoDaysAgo(6, 11),
      updatedAt: isoDaysAgo(1, 17),
    },
    {
      id: 'mock-prayer-anonymous',
      title: 'Strength for tomorrow',
      body: 'I feel spiritually tired. Please pray that I keep walking with God.',
      category: 'Strength',
      scriptureRef: 'Isaiah 40:31',
      authorUid: 'member-anonymous',
      authorName: 'Anonymous',
      isAnonymous: true,
      prayedCount: 31,
      status: 'active',
      privacy: 'community',
      prayerLimit: 'once',
      urgent: false,
      allowShare: true,
      createdAt: isoDaysAgo(3, 19),
      updatedAt: isoDaysAgo(3, 20),
    },
    {
      id: 'mock-prayer-gratitude',
      title: 'Thankful for answered prayer',
      body: 'God opened a door for reconciliation. Pray that gratitude stays rooted in our home.',
      category: 'Gratitude',
      scriptureRef: 'Psalm 100:4',
      authorUid: 'member-ana',
      authorName: 'Ana P.',
      isAnonymous: false,
      prayedCount: 14,
      status: 'answered',
      privacy: 'community',
      prayerLimit: 'daily',
      urgent: false,
      allowShare: true,
      createdAt: isoDaysAgo(8, 8),
      updatedAt: isoDaysAgo(2, 18),
    },
  ];

  const testimonies = [
    {
      id: 'mock-testimony-provision',
      title: 'God provided work',
      body: 'After weeks of waiting, I received a callback and start next Monday.',
      prayerId: 'mock-prayer-provision',
      authorUid: 'member-hope',
      authorName: 'Hope N.',
      isAnonymous: false,
      praiseGod: 12,
      amen: 9,
      tags: ['provision'],
      createdAt: isoDaysAgo(1, 18),
      updatedAt: isoDaysAgo(1, 18),
    },
    {
      id: 'mock-testimony-own',
      title: 'Peace during the waiting',
      body: 'I still do not have every answer, but God gave me peace today.',
      prayerId: 'mock-prayer-own',
      authorUid: me.uid,
      authorName: me.displayName,
      isAnonymous: false,
      praiseGod: 4,
      amen: 5,
      tags: ['guidance'],
      createdAt: isoHoursAgo(10),
      updatedAt: isoHoursAgo(10),
    },
  ];

  const sessions = [
    { id: 'mock-session-1', authorUid: me.uid, prayerId: 'mock-prayer-healing', title: 'Healing for my mother', seconds: 420, createdAt: isoHoursAgo(2) },
    { id: 'mock-session-2', authorUid: me.uid, prayerId: 'mock-prayer-family', title: 'Peace in our home', seconds: 300, createdAt: isoDaysAgo(1, 21) },
    { id: 'mock-session-3', authorUid: me.uid, prayerId: 'mock-prayer-own', title: 'Courage for a difficult decision', seconds: 540, createdAt: isoDaysAgo(2, 20) },
    { id: 'mock-session-4', authorUid: me.uid, prayerId: 'mock-prayer-anonymous', title: 'Strength for tomorrow', seconds: 240, createdAt: isoDaysAgo(3, 7) },
    { id: 'mock-session-5', authorUid: me.uid, prayerId: 'mock-prayer-provision', title: 'Work and provision', seconds: 360, createdAt: isoDaysAgo(4, 22) },
    { id: 'mock-session-6', authorUid: me.uid, prayerId: 'mock-prayer-gratitude', title: 'Thankful for answered prayer', seconds: 180, createdAt: isoDaysAgo(5, 9) },
  ];

  const users = [
    me,
    { id: 'member-ruth', uid: 'member-ruth', displayName: 'Ruth M.', email: 'ruth@example.test', role: 'user', suspended: false, createdAt: isoDaysAgo(30) },
    { id: 'member-daniel', uid: 'member-daniel', displayName: 'Daniel K.', email: 'daniel@example.test', role: 'user', suspended: false, createdAt: isoDaysAgo(25) },
    { id: 'member-hope', uid: 'member-hope', displayName: 'Hope N.', email: 'hope@example.test', role: 'user', suspended: false, createdAt: isoDaysAgo(20) },
    { id: 'member-paused', uid: 'member-paused', displayName: 'Paused User', email: 'paused@example.test', role: 'user', suspended: true, suspendedReason: 'Mock moderation test', createdAt: isoDaysAgo(18) },
  ];

  const upcomingWalkDateKey = dateKeyDaysFromNow(2);
  const familyPrayerDateKey = dateKeyDaysFromNow(4);
  const calendarEvents = [
    {
      id: 'mock-calendar-walk',
      ownerUid: me.uid,
      title: 'Sabbath prayer walk',
      notes: 'Meet by the church entrance and pray for nearby families.',
      dateKey: upcomingWalkDateKey,
      startsAt: isoDaysAgo(-2, 16),
      endsAt: isoDaysAgo(-2, 17),
      createdAt: isoDaysAgo(1),
      updatedAt: isoDaysAgo(1),
    },
    {
      id: 'mock-calendar-family',
      ownerUid: me.uid,
      title: 'Family prayer reminder',
      notes: 'Pray through the family requests saved this week.',
      dateKey: familyPrayerDateKey,
      startsAt: isoDaysAgo(-4, 19),
      endsAt: null,
      createdAt: isoHoursAgo(12),
      updatedAt: isoHoursAgo(12),
    },
  ];

  const calendarBookmarks = [
    {
      id: `${me.uid}_${upcomingWalkDateKey}`,
      ownerUid: me.uid,
      dateKey: upcomingWalkDateKey,
      createdAt: isoHoursAgo(8),
    },
  ];

  const devotions = [
    {
      id: 'mock-devotion-peace',
      title: 'Peace for the Waiting',
      body: 'Pause and remember that God is present before the answer arrives.',
      scriptureRef: 'Philippians 4:6-7',
      status: 'active',
      order: 1,
      durationMinutes: 4,
    },
    {
      id: 'mock-devotion-intercession',
      title: 'Praying for Others',
      body: 'Choose one person from the feed and pray for them by name today.',
      scriptureRef: '1 Timothy 2:1',
      status: 'active',
      order: 2,
      durationMinutes: 3,
    },
  ];

  const studyGuides = {
    'mock-prayer-basics': {
      guide: {
        id: 'mock-prayer-basics',
        title: 'Prayer Basics',
        description: 'A short mock guide for checking lesson-reader flows.',
        status: 'active',
        order: 1,
      },
      lessons: [
        {
          id: 'mock-lesson-listen',
          guideId: 'mock-prayer-basics',
          title: 'Listen First',
          body: 'Start with quiet attention before moving into requests.',
          scriptureRef: 'Psalm 46:10',
          status: 'active',
          day: 1,
        },
        {
          id: 'mock-lesson-respond',
          guideId: 'mock-prayer-basics',
          title: 'Respond With Trust',
          body: 'Name the concern, then entrust the person to God.',
          scriptureRef: '1 Peter 5:7',
          status: 'active',
          day: 2,
        },
      ],
    },
  };

  return {
    profile: me,
    users,
    prayers,
    testimonies,
    sessions,
    calendarEvents,
    calendarBookmarks,
    devotions,
    studyGuides,
    bookmarkedPrayerIds: new Set(['mock-prayer-family']),
    prayedPrayerIds: new Set(['mock-prayer-healing']),
    blockedUids: new Set(),
    notificationSettings: {
      prayerActivity: true,
      testimonyReactions: true,
      pushEnabled: true,
      announcements: true,
    },
    gamificationPreferences: {
      leaderboardVisible: true,
      darkModeEnabled: false,
      soundHapticsEnabled: true,
      xpNotificationsEnabled: true,
      streakRemindersEnabled: true,
    },
    notifications: [
      { id: 'mock-notification-1', type: 'prayer_prayed', message: 'Ruth prayed for your request.', relatedId: 'mock-prayer-own', actorUid: 'member-ruth', read: false, createdAt: isoHoursAgo(3) },
      { id: 'mock-notification-2', type: 'announcement', message: 'New Sabbath prayer walk announcement.', relatedId: 'mock-announcement-event', read: false, createdAt: isoDaysAgo(1, 8) },
      { id: 'mock-notification-3', type: 'testimony_reaction', message: 'Someone said Amen to your testimony.', relatedId: 'mock-testimony-own', read: true, createdAt: isoDaysAgo(2, 12) },
    ],
    announcements: [
      { id: 'mock-announcement-event', title: 'Sabbath prayer walk', body: 'Meet at the church entrance at 4 PM for a short community prayer walk.', category: 'events', status: 'active', startsAt: isoDaysAgo(-2, 16), endsAt: isoDaysAgo(-3, 18), createdAt: isoDaysAgo(1), updatedAt: isoDaysAgo(1) },
      { id: 'mock-announcement-prayer', title: 'Prayer focus this week', body: 'Please pray for families, students, and people recovering from illness.', category: 'prayer', status: 'active', startsAt: isoHoursAgo(8), endsAt: isoDaysAgo(-6, 20), createdAt: isoHoursAgo(9), updatedAt: isoHoursAgo(9) },
      { id: 'mock-announcement-archived', title: 'Archived test notice', body: 'This archived item appears only in the admin announcement list.', category: 'updates', status: 'archived', startsAt: isoDaysAgo(10, 10), endsAt: isoDaysAgo(7, 10), createdAt: isoDaysAgo(10), updatedAt: isoDaysAgo(7) },
    ],
    reports: [
      { id: 'mock-report-1', targetId: 'mock-prayer-anonymous', targetType: 'prayer', reason: 'Mock report: review wording for sensitivity.', reportedByUid: 'member-ruth', status: 'pending', createdAt: isoHoursAgo(7) },
      { id: 'mock-report-2', targetId: 'mock-testimony-provision', targetType: 'testimony', reason: 'Mock report: duplicate content check.', reportedByUid: 'member-daniel', status: 'dismissed', createdAt: isoDaysAgo(3, 13) },
    ],
  };
}

function getState(user) {
  const uid = user?.uid || 'demo-admin';
  if (!cachedState || cachedState.profile.uid !== uid) cachedState = seedState(user);
  return cachedState;
}

function parseBody(options = {}) {
  if (!options.body) return {};
  if (typeof options.body === 'string') {
    try {
      return JSON.parse(options.body);
    } catch {
      return {};
    }
  }
  return options.body;
}

function deriveTitle(body, fallback = 'Prayer request') {
  const raw = String(body || '').trim();
  if (!raw) return fallback;
  return raw.split(/[.!?\n]/, 1)[0].slice(0, 120) || fallback;
}

function isValidCalendarDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function normalizeIsoTimestamp(value) {
  if (value == null || value === '') return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function categoryMatches(prayer, category) {
  if (!category) return true;
  return String(prayer.category || '').toLowerCase() === String(category).toLowerCase();
}

function filteredPrayers(state, url) {
  const scope = url.searchParams.get('scope') || 'feed';
  const status = url.searchParams.get('status');
  const category = url.searchParams.get('category');
  const urgent = url.searchParams.get('urgent') === '1';
  let items = [...state.prayers];

  if (scope === 'mine') items = items.filter((item) => item.authorUid === state.profile.uid);
  if (scope === 'feed') items = items.filter((item) => item.privacy !== 'private');
  if (status) items = items.filter((item) => item.status === status);
  if (category) items = items.filter((item) => categoryMatches(item, category));
  if (urgent) items = items.filter((item) => item.urgent === true);

  return items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function buildSummary(state) {
  const totalSeconds = state.sessions.reduce((sum, item) => sum + Number(item.seconds || 0), 0);
  const answered = state.prayers.filter((item) => item.status === 'answered').length;
  const peoplePrayedFor = new Set(state.sessions.map((item) => item.prayerId)).size;
  const totalXP = 1840 + state.sessions.length * 20 + state.testimonies.length * 30;
  const level = Math.max(1, Math.floor(totalXP / 500) + 1);
  const xpIntoLevel = totalXP % 500;
  return {
    streak: 6,
    dailyPrayCount: 3,
    dailyGoalProgress: 0.6,
    dailyChallengeComplete: false,
    dailyChallengeGoal: 5,
    dailyPrayGoal: 5,
    todayXP: 85,
    totalXP,
    levelInfo: {
      level,
      totalXP,
      xpIntoLevel,
      xpToNextLevel: 500 - xpIntoLevel,
      progress: xpIntoLevel / 500,
    },
    journey: { id: 'faithful-strider', title: 'Faithful Strider', subtitle: 'Building a steady prayer rhythm' },
    weeklyStats: [
      { day: 'Sun', xp: 110 },
      { day: 'Mon', xp: 80 },
      { day: 'Tue', xp: 140 },
      { day: 'Wed', xp: 95 },
      { day: 'Thu', xp: 120 },
      { day: 'Fri', xp: 85 },
      { day: 'Sat', xp: 0 },
    ],
    activeDayIndexes: [0, 1, 2, 3, 4, 5],
    currentDayIndex: nowDate().getDay(),
    badges: [
      { id: 'first-prayer', title: 'First Prayer', description: 'Prayed for someone.', state: 'earned' },
      { id: 'three-day-streak', title: 'Three Day Streak', description: 'Prayed three days in a row.', state: 'earned' },
      { id: 'encourager', title: 'Encourager', description: 'Shared a testimony.', state: 'earned' },
      { id: 'sabbath-walker', title: 'Sabbath Walker', description: 'Keep praying through the week.', state: 'locked' },
    ],
    prayedTodayIds: Array.from(state.prayedPrayerIds),
    impact: {
      prayerSessions: state.sessions.length,
      peoplePrayedFor,
      answeredPrayers: answered,
      totalPrayerSeconds: totalSeconds,
    },
  };
}

function leaderboardFor(state, scope) {
  const rows = [
    { uid: state.profile.uid, displayName: state.profile.displayName, rank: 2, scopeXP: scope === 'weekly' ? 620 : 1840, level: 4, streak: 6, badgesEarned: 3, change: 1 },
    { uid: 'member-ruth', displayName: 'Ruth M.', rank: 1, scopeXP: scope === 'weekly' ? 710 : 2110, level: 5, streak: 9, badgesEarned: 5, change: 0 },
    { uid: 'member-daniel', displayName: 'Daniel K.', rank: 3, scopeXP: scope === 'weekly' ? 540 : 1690, level: 4, streak: 4, badgesEarned: 2, change: -1 },
    { uid: 'member-hope', displayName: 'Hope N.', rank: 4, scopeXP: scope === 'weekly' ? 420 : 1320, level: 3, streak: 3, badgesEarned: 2, change: 2 },
    { uid: 'member-ana', displayName: 'Ana P.', rank: 5, scopeXP: scope === 'weekly' ? 390 : 1180, level: 3, streak: 2, badgesEarned: 1, change: null },
  ].sort((a, b) => a.rank - b.rank);
  return {
    scope,
    resetAt: scope === 'weekly' ? 'Sunday' : null,
    rows,
    me: rows.find((row) => row.uid === state.profile.uid),
  };
}

function analytics() {
  const activityByDay = Array.from({ length: 14 }, (_, index) => {
    const date = nowDate();
    date.setDate(date.getDate() - (13 - index));
    return {
      day: date.toISOString().slice(0, 10),
      count: [2, 4, 3, 5, 8, 6, 4, 7, 5, 9, 6, 8, 7, 10][index],
    };
  });
  return {
    window: { days: 30 },
    windowTooShortForRetention: false,
    metrics: {
      requestCount: 42,
      responseRate: 76,
      density: 3.2,
      activePrayingUsers7d: 18,
      requestOnly: 6,
      prayOnly: 9,
      both: 14,
      retentionRate: 68,
      retentionEligible: 22,
      averageTimeToFirstPrayerMinutes: 34,
      medianTimeToFirstPrayerMinutes: 18,
      totalPrayActions: 138,
      activityByDay,
    },
  };
}

function updateReport(state, reportId, status) {
  const report = state.reports.find((item) => item.id === reportId);
  if (report) report.status = status;
  return { ok: true, reportId, status };
}

function applyAnnouncementMap(state, mapper) {
  state.announcements = state.announcements.map(mapper);
}

export async function mockUploadAvatar(file, user) {
  const state = getState(user);
  state.profile.photoURL = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop';
  return { ok: true, photoURL: state.profile.photoURL };
}

export async function mockApiFetch(path, options = {}, user) {
  const method = String(options.method || 'GET').toUpperCase();
  const url = new URL(path, MOCK_BASE_URL);
  const body = parseBody(options);
  const state = getState(user);
  const pathname = url.pathname;
  let match;

  if (pathname === '/api/me/profile') {
    if (method === 'POST') {
      state.profile = { ...state.profile, ...body, uid: state.profile.uid, id: state.profile.uid, updatedAt: nowDate().toISOString() };
      state.users = state.users.map((item) => (item.uid === state.profile.uid ? { ...item, ...state.profile } : item));
    }
    return clone({ ok: true, profile: state.profile });
  }

  if (pathname === '/api/account/bootstrap-owner') return clone({ ok: true, profile: state.profile });
  if (pathname === '/api/account/complete-registration') return clone({ ok: true, profile: state.profile });
  if (pathname === '/api/account/resend-guardian-approval') return clone({ ok: true });
  if (pathname === '/api/account' && method === 'DELETE') return clone({ ok: true });
  if (pathname === '/api/devices/register') return clone({ ok: true });

  if (pathname === '/api/calendar-events' && method === 'GET') {
    return clone({ events: state.calendarEvents });
  }

  if (pathname === '/api/calendar-events' && method === 'POST') {
    const id = nextId('mock-calendar');
    const now = nowDate().toISOString();
    const dateKey = isValidCalendarDateKey(body.dateKey) ? body.dateKey : dateKeyDaysFromNow(1);
    state.calendarEvents.unshift({
      id,
      ownerUid: state.profile.uid,
      title: String(body.title || 'Mock calendar event').trim().slice(0, 120),
      notes: body.notes != null ? String(body.notes).trim() || null : null,
      dateKey,
      startsAt: normalizeIsoTimestamp(body.startsAt),
      endsAt: normalizeIsoTimestamp(body.endsAt),
      createdAt: now,
      updatedAt: now,
    });
    return clone({ ok: true, eventId: id });
  }

  match = pathname.match(/^\/api\/calendar-events\/([^/]+)\/update$/);
  if (match && method === 'POST') {
    const eventId = decodeURIComponent(match[1]);
    const now = nowDate().toISOString();
    state.calendarEvents = state.calendarEvents.map((item) => (
      item.id === eventId
        ? {
          ...item,
          title: String(body.title || item.title).trim().slice(0, 120),
          notes: body.notes != null ? String(body.notes).trim() || null : item.notes ?? null,
          dateKey: isValidCalendarDateKey(body.dateKey) ? body.dateKey : item.dateKey,
          startsAt: body.startsAt !== undefined ? normalizeIsoTimestamp(body.startsAt) : item.startsAt ?? null,
          endsAt: body.endsAt !== undefined ? normalizeIsoTimestamp(body.endsAt) : item.endsAt ?? null,
          updatedAt: now,
        }
        : item
    ));
    return clone({ ok: true, eventId });
  }

  match = pathname.match(/^\/api\/calendar-events\/([^/]+)$/);
  if (match && method === 'DELETE') {
    const eventId = decodeURIComponent(match[1]);
    state.calendarEvents = state.calendarEvents.filter((item) => item.id !== eventId);
    return clone({ ok: true, eventId });
  }

  if (pathname === '/api/calendar-bookmarks' && method === 'GET') {
    return clone({ bookmarks: state.calendarBookmarks });
  }

  match = pathname.match(/^\/api\/calendar-bookmarks\/([^/]+)$/);
  if (match) {
    const dateKey = decodeURIComponent(match[1]);
    const bookmarkId = `${state.profile.uid}_${dateKey}`;
    if (method === 'POST') {
      if (!state.calendarBookmarks.some((item) => item.id === bookmarkId)) {
        state.calendarBookmarks.unshift({
          id: bookmarkId,
          ownerUid: state.profile.uid,
          dateKey,
          createdAt: nowDate().toISOString(),
        });
      }
      return clone({ ok: true, bookmarkId });
    }
    if (method === 'DELETE') {
      const beforeCount = state.calendarBookmarks.length;
      state.calendarBookmarks = state.calendarBookmarks.filter((item) => item.id !== bookmarkId);
      return clone({ ok: true, removed: state.calendarBookmarks.length < beforeCount });
    }
  }

  if (pathname === '/api/prayers' && method === 'GET') {
    return clone({ ok: true, items: filteredPrayers(state, url), nextCursor: null });
  }

  if (pathname === '/api/prayers' && method === 'POST') {
    const id = nextId('mock-prayer');
    const now = nowDate().toISOString();
    const prayer = {
      id,
      title: deriveTitle(body.body, body.title || 'Prayer request'),
      body: String(body.body || '').slice(0, 2000),
      category: body.category || 'Guidance',
      scriptureRef: body.scriptureRef || '',
      authorUid: state.profile.uid,
      authorName: body.isAnonymous ? 'Anonymous' : state.profile.displayName,
      isAnonymous: body.isAnonymous === true,
      prayedCount: 0,
      status: 'active',
      privacy: body.privacy || 'community',
      prayerLimit: body.prayerLimit || 'daily',
      urgent: body.urgent === true,
      allowShare: body.allowShare !== false,
      createdAt: now,
      updatedAt: now,
    };
    state.prayers.unshift(prayer);
    return clone({ ok: true, prayerId: id, xp: mockXp(25) });
  }

  match = pathname.match(/^\/api\/prayers\/([^/]+)\/update$/);
  if (match && method === 'POST') {
    const prayer = state.prayers.find((item) => item.id === decodeURIComponent(match[1]));
    if (prayer) {
      Object.assign(prayer, {
        title: deriveTitle(body.body || prayer.body, body.title || prayer.title),
        body: body.body || body.text || prayer.body,
        category: body.category ?? prayer.category,
        scriptureRef: body.scriptureRef ?? prayer.scriptureRef,
        privacy: body.privacy || prayer.privacy,
        prayerLimit: body.prayerLimit || prayer.prayerLimit,
        urgent: body.urgent === true,
        allowShare: body.allowShare !== false,
        updatedAt: nowDate().toISOString(),
      });
    }
    return clone({ ok: true, prayerId: decodeURIComponent(match[1]) });
  }

  match = pathname.match(/^\/api\/prayers\/([^/]+)\/mark-answered$/);
  if (match && method === 'POST') {
    const prayer = state.prayers.find((item) => item.id === decodeURIComponent(match[1]));
    if (prayer) {
      prayer.status = 'answered';
      prayer.updatedAt = nowDate().toISOString();
    }
    return clone({ ok: true, prayerId: decodeURIComponent(match[1]), xp: mockXp(40) });
  }

  match = pathname.match(/^\/api\/prayers\/([^/]+)\/pray$/);
  if (match && method === 'POST') {
    const prayerId = decodeURIComponent(match[1]);
    const duplicate = state.prayedPrayerIds.has(prayerId);
    state.prayedPrayerIds.add(prayerId);
    const prayer = state.prayers.find((item) => item.id === prayerId);
    if (prayer && !duplicate) prayer.prayedCount = Number(prayer.prayedCount || 0) + 1;
    return clone({
      ok: true,
      prayerId,
      duplicate,
      prayerLimit: prayer?.prayerLimit || 'daily',
      xp: mockXp(10, !duplicate, !duplicate && state.prayedPrayerIds.size >= 5 ? ['dailyChallenge'] : []),
    });
  }

  match = pathname.match(/^\/api\/prayers\/([^/]+)$/);
  if (match && method === 'DELETE') {
    const prayerId = decodeURIComponent(match[1]);
    state.prayers = state.prayers.filter((item) => item.id !== prayerId);
    return clone({ ok: true, prayerId });
  }

  match = pathname.match(/^\/api\/prayer-bookmarks\/([^/]+)$/);
  if (match) {
    const prayerId = decodeURIComponent(match[1]);
    if (method === 'GET') return clone({ ok: true, bookmarked: state.bookmarkedPrayerIds.has(prayerId) });
    if (method === 'POST') {
      const duplicate = state.bookmarkedPrayerIds.has(prayerId);
      state.bookmarkedPrayerIds.add(prayerId);
      return clone({ ok: true, prayerId, duplicate, xp: mockXp(5, !duplicate) });
    }
    if (method === 'DELETE') {
      state.bookmarkedPrayerIds.delete(prayerId);
      return clone({ ok: true, prayerId });
    }
  }

  if (pathname === '/api/testimonies' && method === 'GET') {
    return clone({ ok: true, items: state.testimonies });
  }

  if (pathname === '/api/testimonies' && method === 'POST') {
    const id = nextId('mock-testimony');
    const now = nowDate().toISOString();
    state.testimonies.unshift({
      id,
      title: body.title || deriveTitle(body.body, 'Prayer update'),
      body: body.body || body.text || '',
      prayerId: body.prayerId || null,
      authorUid: state.profile.uid,
      authorName: body.isAnonymous ? 'Anonymous' : state.profile.displayName,
      isAnonymous: body.isAnonymous === true,
      praiseGod: 0,
      amen: 0,
      tags: body.tags || [],
      createdAt: now,
      updatedAt: now,
    });
    return clone({ ok: true, testimonyId: id, xp: mockXp(30) });
  }

  match = pathname.match(/^\/api\/testimonies\/([^/]+)\/react$/);
  if (match && method === 'POST') {
    const testimony = state.testimonies.find((item) => item.id === decodeURIComponent(match[1]));
    const reaction = body.reaction === 'amen' ? 'amen' : 'praiseGod';
    if (testimony) testimony[reaction] = Number(testimony[reaction] || 0) + 1;
    return clone({ ok: true, testimonyId: decodeURIComponent(match[1]), reaction, duplicate: false });
  }

  match = pathname.match(/^\/api\/testimonies\/([^/]+)\/update$/);
  if (match && method === 'POST') {
    const testimonyId = decodeURIComponent(match[1]);
    state.testimonies = state.testimonies.map((item) => (
      item.id === testimonyId
        ? {
          ...item,
          title: String(body.title || item.title).trim().slice(0, 120),
          body: String(body.body || body.text || item.body).trim().slice(0, 2400),
          authorName: body.isAnonymous ? 'Anonymous' : state.profile.displayName,
          isAnonymous: body.isAnonymous != null ? body.isAnonymous === true : item.isAnonymous,
          shared: body.shared != null ? body.shared === true : item.shared,
          tags: body.tags || item.tags || [],
          updatedAt: nowDate().toISOString(),
        }
        : item
    ));
    return clone({ ok: true, testimonyId });
  }

  match = pathname.match(/^\/api\/testimonies\/([^/]+)(?:\/update)?$/);
  if (match && method === 'DELETE') {
    const testimonyId = decodeURIComponent(match[1]);
    state.testimonies = state.testimonies.filter((item) => item.id !== testimonyId);
    return clone({ ok: true, testimonyId });
  }

  if (pathname === '/api/prayer-sessions' && method === 'GET') {
    return clone({ ok: true, sessions: state.sessions });
  }

  if (pathname === '/api/prayer-sessions' && method === 'POST') {
    const sessionId = nextId('mock-session');
    const session = {
      id: sessionId,
      authorUid: state.profile.uid,
      prayerId: body.prayerId,
      title: body.title || 'Prayer session',
      seconds: Number(body.seconds || 0),
      createdAt: nowDate().toISOString(),
    };
    state.sessions.unshift(session);
    return clone({ ok: true, sessionId, xp: mockXp(20) });
  }

  if (pathname === '/api/announcements' && method === 'GET') {
    const includeArchived = url.searchParams.get('includeArchived') === '1';
    const items = includeArchived ? state.announcements : state.announcements.filter((item) => item.status === 'active');
    return clone({ ok: true, announcements: items });
  }

  if (pathname === '/api/admin/announcements/create' && method === 'POST') {
    const id = nextId('mock-announcement');
    const now = nowDate().toISOString();
    state.announcements.unshift({
      id,
      title: body.title,
      body: body.body,
      category: body.category || 'updates',
      status: 'active',
      startsAt: body.startsAt || now,
      endsAt: body.endsAt || null,
      createdAt: now,
      updatedAt: now,
    });
    return clone({ ok: true, announcementId: id });
  }

  if (pathname === '/api/admin/announcements/update' && method === 'POST') {
    applyAnnouncementMap(state, (item) => (
      item.id === body.announcementId
        ? { ...item, ...body, id: item.id, updatedAt: nowDate().toISOString() }
        : item
    ));
    return clone({ ok: true, announcementId: body.announcementId });
  }

  if (pathname === '/api/admin/announcements/archive' && method === 'POST') {
    applyAnnouncementMap(state, (item) => (
      item.id === body.announcementId
        ? { ...item, status: 'archived', updatedAt: nowDate().toISOString() }
        : item
    ));
    return clone({ ok: true, announcementId: body.announcementId });
  }

  if (pathname === '/api/notifications' && method === 'GET') {
    return clone({ ok: true, notifications: state.notifications });
  }

  if (pathname === '/api/notifications/read-all' && method === 'POST') {
    const count = state.notifications.filter((item) => !item.read).length;
    state.notifications = state.notifications.map((item) => ({ ...item, read: true }));
    return clone({ ok: true, count });
  }

  match = pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (match && method === 'POST') {
    state.notifications = state.notifications.map((item) => (
      item.id === decodeURIComponent(match[1]) ? { ...item, read: true } : item
    ));
    return clone({ ok: true, notificationId: decodeURIComponent(match[1]) });
  }

  if (pathname === '/api/notification-settings') {
    if (method === 'POST') state.notificationSettings = { ...state.notificationSettings, ...body };
    return clone({ ok: true, settings: state.notificationSettings });
  }

  if (pathname === '/api/gamification/summary') return clone(buildSummary(state));
  if (pathname === '/api/gamification/preferences') {
    if (method === 'POST') state.gamificationPreferences = { ...state.gamificationPreferences, ...body };
    return clone({ ok: true, preferences: state.gamificationPreferences });
  }
  if (pathname === '/api/gamification/leaderboard') {
    return clone(leaderboardFor(state, url.searchParams.get('scope') || 'weekly'));
  }
  if (pathname === '/api/gamification/timezone') return clone({ ok: true, timeZone: body.timeZone || 'UTC' });
  if (pathname === '/api/gamification/backfill') return clone({ ok: true, xp: mockXp(0, false) });

  if (pathname === '/api/admin/users') return clone({ ok: true, users: state.users });
  if (pathname === '/api/admin/reports') return clone({ ok: true, reports: state.reports });
  if (pathname === '/api/reports' && method === 'POST') {
    const reportId = `${state.profile.uid}_${body.targetType || 'content'}_${body.targetId || nextId('target')}`;
    const duplicate = state.reports.some((item) => item.id === reportId);
    if (!duplicate) {
      state.reports.unshift({
        id: reportId,
        targetId: String(body.targetId || '').slice(0, 160),
        targetType: body.targetType || 'prayer',
        reason: String(body.reason || 'Mock report').slice(0, 800),
        reportedByUid: state.profile.uid,
        status: 'pending',
        createdAt: nowDate().toISOString(),
      });
    }
    return clone({ ok: true, duplicate, reportId });
  }
  if (pathname === '/api/admin/reports/update' && method === 'POST') {
    return clone(updateReport(state, body.reportId, body.status || 'resolved'));
  }
  if (pathname === '/api/admin/delete-content' && method === 'POST') {
    if (body.targetType === 'prayer') state.prayers = state.prayers.filter((item) => item.id !== body.targetId);
    if (body.targetType === 'testimony') state.testimonies = state.testimonies.filter((item) => item.id !== body.targetId);
    return clone({ ok: true });
  }
  if (pathname === '/api/admin/suspend-user' && method === 'POST') {
    state.users = state.users.map((item) => (
      item.uid === body.targetUid || item.id === body.targetUid
        ? { ...item, suspended: true, suspendedReason: body.reason || 'Mock suspension' }
        : item
    ));
    return clone({ ok: true });
  }
  if (pathname === '/api/admin/unsuspend-user' && method === 'POST') {
    state.users = state.users.map((item) => (
      item.uid === body.targetUid || item.id === body.targetUid
        ? { ...item, suspended: false, suspendedReason: '' }
        : item
    ));
    return clone({ ok: true });
  }
  if (pathname === '/api/admin/delete-account' && method === 'POST') {
    state.users = state.users.filter((item) => item.uid !== body.targetUid && item.id !== body.targetUid);
    return clone({ ok: true });
  }
  if (pathname === '/api/admin/spiritual-engagement') return clone(analytics());

  if (pathname === '/api/blocks' && method === 'GET') {
    return clone({ ok: true, blockedUids: Array.from(state.blockedUids) });
  }
  match = pathname.match(/^\/api\/blocks\/([^/]+)$/);
  if (match) {
    const blockedUid = decodeURIComponent(match[1]);
    if (method === 'POST') state.blockedUids.add(blockedUid);
    if (method === 'DELETE') state.blockedUids.delete(blockedUid);
    return clone({ ok: true, blockedUid });
  }

  if (pathname === '/api/devotions') return clone({ ok: true, devotions: state.devotions });

  match = pathname.match(/^\/api\/study-guides\/([^/]+)\/lessons(?:\/([^/]+))?$/);
  if (match) {
    const guide = state.studyGuides[decodeURIComponent(match[1])];
    const lessonId = match[2] ? decodeURIComponent(match[2]) : null;
    const lesson = lessonId
      ? guide?.lessons.find((item) => item.id === lessonId)
      : guide?.lessons[0];
    return clone({ ok: true, lesson: lesson || null });
  }

  match = pathname.match(/^\/api\/study-guides\/([^/]+)$/);
  if (match) {
    const guide = state.studyGuides[decodeURIComponent(match[1])]?.guide || null;
    return clone({ ok: true, guide });
  }

  return clone({ ok: true, mock: true });
}

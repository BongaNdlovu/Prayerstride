export const DAILY_PRAY_GOAL = 5;
export const DAILY_CHALLENGE_GOAL = 5;
export const XP_PER_LEVEL = 500;
export const EARLY_RISER_HOUR = 8;

export const XP_AWARDS = {
  prayerSession: 10,
  prayAction: 15,
  testimony: 50,
  dailyChallenge: 100,
  streak7: 150,
  bookmarkPrayer: 3,
  profileUpdate: 10,
};

export const XP_EVENT_TYPES = {
  prayerSession: 'prayer_session',
  prayAction: 'pray_action',
  testimony: 'testimony',
  dailyChallenge: 'daily_challenge',
  streak7: 'streak_7',
  bookmarkPrayer: 'bookmark_prayer',
  profileUpdate: 'profile_update',
};

export const BADGE_DEFS = [
  {
    id: 'first-prayer',
    name: 'Prayer Starter',
    description: 'Share your first prayer request with the community.',
    total: 1,
    metric: 'prayers',
  },
  {
    id: 'streak-7',
    name: 'Consistent Encourager',
    description: 'Pray on seven consecutive days.',
    total: 7,
    metric: 'streak',
  },
  {
    id: 'faithful-heart',
    name: 'Faithful Reminder',
    description: 'Log one hundred prayer sessions.',
    total: 100,
    metric: 'sessions',
  },
  {
    id: 'early-riser',
    name: 'Morning Companion',
    description: 'Complete ten prayer sessions before 8 AM.',
    total: 10,
    metric: 'earlySessions',
  },
  {
    id: 'answered-prayer',
    name: 'Hope Witness',
    description: 'Mark your first prayer as answered.',
    total: 1,
    metric: 'answeredPrayers',
  },
  {
    id: 'prayer-companion',
    name: 'Prayer Companion',
    description: 'Log two hundred fifty prayer sessions.',
    total: 250,
    metric: 'sessions',
  },
  {
    id: 'compassion-helper',
    name: 'Compassion Carrier',
    description: 'Pray for twenty different requests.',
    total: 20,
    metric: 'peoplePrayedFor',
  },
  {
    id: 'faithful-minutes',
    name: 'Quiet Faithfulness',
    description: 'Spend one hundred twenty minutes in prayer.',
    total: 120,
    metric: 'minutes',
  },
  {
    id: 'night-watch',
    name: 'Evening Companion',
    description: 'Complete five prayer sessions after 10 PM.',
    total: 5,
    metric: 'nightSessions',
  },
  {
    id: 'steadfast-hour',
    name: 'Steady Presence',
    description: 'Complete four sessions of fifteen minutes or longer.',
    total: 4,
    metric: 'longSessions',
  },
  {
    id: 'keeper-of-requests',
    name: 'Faithful Keeper',
    description: 'Save ten prayer requests to return to later.',
    total: 10,
    metric: 'bookmarks',
  },
  {
    id: 'testimony-voice',
    name: 'Testimony Sharer',
    description: 'Share three testimonies.',
    total: 3,
    metric: 'testimonies',
  },
];

export const JOURNEY_STAGES = [
  { minLevel: 1, id: 'seed', title: 'Seed', subtitle: 'Beginning your prayer walk' },
  { minLevel: 3, id: 'root', title: 'Root', subtitle: 'Building a gentle rhythm' },
  { minLevel: 5, id: 'branch', title: 'Branch', subtitle: 'Carrying others in prayer' },
  { minLevel: 8, id: 'fruit', title: 'Fruit', subtitle: 'A steady presence for others' },
];

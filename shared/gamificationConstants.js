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
};

export const XP_EVENT_TYPES = {
  prayerSession: 'prayer_session',
  prayAction: 'pray_action',
  testimony: 'testimony',
  dailyChallenge: 'daily_challenge',
  streak7: 'streak_7',
};

export const BADGE_DEFS = [
  {
    id: 'first-prayer',
    name: 'First Prayer',
    description: 'Share your first prayer request with the community.',
    total: 1,
    metric: 'prayers',
  },
  {
    id: 'streak-7',
    name: 'Streak Keeper',
    description: 'Pray on seven consecutive days.',
    total: 7,
    metric: 'streak',
  },
  {
    id: 'faithful-heart',
    name: 'Faithful Heart',
    description: 'Log one hundred prayer sessions.',
    total: 100,
    metric: 'sessions',
  },
  {
    id: 'early-riser',
    name: 'Early Riser',
    description: 'Complete ten prayer sessions before 8 AM.',
    total: 10,
    metric: 'earlySessions',
  },
  {
    id: 'answered-prayer',
    name: 'Answered Prayer',
    description: 'Mark your first prayer as answered.',
    total: 1,
    metric: 'answeredPrayers',
  },
  {
    id: 'compassion-helper',
    name: 'Compassion Helper',
    description: 'Send ten encouragements to others in prayer.',
    total: 10,
    metric: 'encouragements',
  },
  {
    id: 'seasoned-warrior',
    name: 'Seasoned Warrior',
    description: 'Log two hundred fifty prayer sessions.',
    total: 250,
    metric: 'sessions',
  },
];

export const JOURNEY_STAGES = [
  { minLevel: 1, id: 'first-steps', title: 'First Steps', subtitle: 'Beginning your prayer walk' },
  { minLevel: 3, id: 'steady-path', title: 'Steady Path', subtitle: 'Building a gentle rhythm' },
  { minLevel: 5, id: 'faithful-traveler', title: 'Faithful Traveler', subtitle: 'Carrying others in prayer' },
  { minLevel: 8, id: 'prayer-companion', title: 'Prayer Companion', subtitle: 'A steady presence for others' },
  { minLevel: 12, id: 'summit-seeker', title: 'Summit Seeker', subtitle: 'Deepening your journey' },
];

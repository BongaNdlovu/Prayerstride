export const mockUsers = [
  { id: 'u1', name: 'Sarah M.', handle: '@sarahm', bio: 'Praying for my family and community.', avatarColor: '#ded3c4', role: 'user' },
  { id: 'u2', name: 'David K.', handle: '@davidk', bio: 'Grateful for every answered prayer.', avatarColor: '#d4c8b8', role: 'user' },
  { id: 'u3', name: 'Amanda J.', handle: '@amandaj', bio: 'Walking by faith.', avatarColor: '#c9bda8', role: 'user' },
  { id: 'u4', name: 'Michael T.', handle: '@michaelt', bio: 'Youth minister and prayer warrior.', avatarColor: '#beb29d', role: 'user' },
  { id: 'u5', name: 'Grace L.', handle: '@gracel', bio: 'College student seeking wisdom.', avatarColor: '#b3a792', role: 'user' },
  { id: 'u6', name: 'Pastor Daniel', handle: '@pastordaniel', bio: 'Teaching pastor at Grace Community.', avatarColor: '#a89c87', role: 'leader' },
  { id: 'u7', name: 'Hannah Grace', handle: '@hannahg', bio: 'Worship leader and songwriter.', avatarColor: '#9d9181', role: 'leader' },
  { id: 'u8', name: 'Elena Rodriguez', handle: '@elenar', bio: 'Prayer leader and intercessor.', avatarColor: '#92867a', role: 'leader' },
  { id: 'u9', name: 'Lydia James', handle: '@lydiaj', bio: 'Missionary in Southeast Asia.', avatarColor: '#877b6f', role: 'user' },
  { id: 'u10', name: 'Jacob Lee', handle: '@jacoblee', bio: 'College leader and disciple maker.', avatarColor: '#7c7064', role: 'user' },
];

export const mockPrayerRequests = [
  { id: 'p1', userId: 'u1', name: 'Sarah M.', title: 'Pray for peace in our home', text: "We've been walking through a really hard season with tension and worry. Please pray for unity and healing in our family. Thank you.", count: 35, tag: 'Family', time: '2h ago', privacy: 'community', urgency: false, anonymous: false, allowShare: true, prayed: false, answered: false },
  { id: 'p2', userId: 'u3', name: 'Amanda J.', title: "Pray for my dad's surgery", text: 'My father is having heart surgery tomorrow. Please pray for the surgeons, for his recovery, and for peace for our family.', count: 24, tag: 'Healing', time: '4h ago', privacy: 'community', urgency: true, anonymous: false, allowShare: true, prayed: false, answered: false },
  { id: 'p3', userId: 'u4', name: 'Michael T.', title: 'Wisdom for a big decision', text: 'I need to decide whether to take a new job opportunity or stay where I am. Please pray for clarity and wisdom.', count: 18, tag: 'Guidance', time: '6h ago', privacy: 'community', urgency: false, anonymous: false, allowShare: true, prayed: false, answered: false },
  { id: 'p4', userId: 'u5', name: 'Grace L.', title: 'Pray for college finals', text: 'Finals are next week and I am feeling overwhelmed. Please pray for focus, peace, and the ability to retain what I have studied.', count: 31, tag: 'Guidance', time: '8h ago', privacy: 'community', urgency: true, anonymous: false, allowShare: true, prayed: false, answered: false },
  { id: 'p5', userId: 'u2', name: 'David K.', title: 'Job offer after months of searching', text: 'So grateful! After months of applying and waiting, I received an offer this week. God is so faithful.', count: 128, tag: 'Provision', time: '1d ago', privacy: 'community', urgency: false, anonymous: false, allowShare: true, prayed: false, answered: true },
  { id: 'p6', userId: 'u1', name: 'Sarah M.', title: 'Healing for Mom', text: 'My mother was diagnosed with cancer last month. Please pray for healing, strength, and peace for our family.', count: 52, tag: 'Healing', time: '2d ago', privacy: 'community', urgency: true, anonymous: false, allowShare: true, prayed: false, answered: false },
  { id: 'p7', userId: 'u9', name: 'Lydia James', title: 'Safety on the mission field', text: 'Please pray for safety and open doors as we share the gospel in a restricted area.', count: 89, tag: 'Missions', time: '3d ago', privacy: 'community', urgency: false, anonymous: false, allowShare: true, prayed: false, answered: false },
];

export const mockTestimonies = [
  { id: 't1', prayerId: 'p5', userId: 'u2', name: 'David K.', title: 'God provided every step', text: 'After weeks of prayer, God opened a door at the right time. I am grateful for His faithfulness.', praiseGod: 128, amen: 76, time: '2d ago' },
  { id: 't2', prayerId: 'p6', userId: 'u1', name: 'Sarah M.', title: 'Healing for Mom', text: 'The doctors are amazed at my mother\'s recovery. What they called impossible, God made possible.', praiseGod: 245, amen: 132, time: '5d ago' },
  { id: 't3', prayerId: 'p4', userId: 'u5', name: 'Grace L.', title: 'New Job Opportunity', text: 'I was offered my dream internship after praying for months. God is faithful!', praiseGod: 89, amen: 48, time: '1w ago' },
  { id: 't4', prayerId: 'p3', userId: 'u4', name: 'Michael T.', title: 'Restored Relationship', text: 'After a year of estrangement, my brother and I reconciled. Prayer changes things.', praiseGod: 156, amen: 91, time: '2w ago' },
];

export const mockAnnouncements = [
  { id: 'a1', title: 'Community Worship Night', date: 'May 24', time: '7:00 PM', type: 'Events' },
  { id: 'a2', title: 'Baptism Sunday', date: 'May 18', time: '10:30 AM', type: 'Events' },
  { id: 'a3', title: 'Serve Our City', date: 'May 10', time: '9:00 AM', type: 'Events' },
  { id: 'a4', title: 'Prayer & Fasting Week', date: 'May 5–11', time: 'All day', type: 'Prayer' },
  { id: 'a5', title: 'New Study Guide Available', date: 'May 1', time: '', type: 'Updates' },
];

export const mockDevotions = [
  { id: 'd1', title: 'A Heart of Gratitude', reference: 'Psalm 107:1', date: 'Wed 14', day: 'Today' },
  { id: 'd2', title: 'Trusting in the Lord', reference: 'Proverbs 3:5–6', date: 'Tue 13', day: 'Yesterday' },
  { id: 'd3', title: 'Be Still and Know', reference: 'Psalm 46:10', date: 'Mon 12', day: '' },
  { id: 'd4', title: 'Made for Good Works', reference: 'Ephesians 2:10', date: 'Sun 11', day: '' },
  { id: 'd5', title: 'Walk by Faith', reference: '2 Corinthians 5:7', date: 'Sat 10', day: '' },
];

export const mockGuide = {
  title: 'The Sermon on the Mount',
  subtitle: 'A 7-Day Study Guide',
  days: 7,
  level: 'Beginner',
  format: 'Individual',
  description: 'Explore Jesus\' timeless teaching in Matthew 5–7 and learn how to live out the Kingdom in everyday life.',
  includes: ['Daily readings & reflections', 'Scripture insights', 'Practical applications', 'Prayer prompts'],
};

export const mockLesson = {
  day: 3,
  totalDays: 7,
  title: 'Blessed Are the Merciful',
  reference: 'Matthew 5:7',
  verse: 'Blessed are the merciful, for they will be shown mercy.',
  body: 'Mercy reflects the heart of our Father. He does not give us what we deserve—He gives us grace. When we extend mercy to others, we reflect His love and bring healing to a broken world.',
  reflection: 'Where is God inviting you to show mercy this week?',
};

export const mockStats = {
  streak: 21,
  bestStreak: 45,
  totalPrayers: 248,
  peopleSupported: 37,
  requestsSent: 63,
  testimonies: 18,
  prayerTime: '14h 32m',
  chartData: [
    { day: 'Mon', prayers: 2 },
    { day: 'Tue', prayers: 4 },
    { day: 'Wed', prayers: 3 },
    { day: 'Thu', prayers: 5 },
    { day: 'Fri', prayers: 6 },
    { day: 'Sat', prayers: 4 },
    { day: 'Sun', prayers: 7 },
    { day: 'Mon', prayers: 5 },
    { day: 'Tue', prayers: 8 },
    { day: 'Wed', prayers: 6 },
    { day: 'Thu', prayers: 9 },
    { day: 'Fri', prayers: 7 },
    { day: 'Sat', prayers: 10 },
    { day: 'Sun', prayers: 11 },
  ],
};

export const mockNotifications = [
  { id: 'n1', text: 'Emily P. is praying for your request.', type: 'new', time: '10m ago', read: false },
  { id: 'n2', text: 'Jonah T. prayed for your request.', type: 'new', time: '1h ago', read: false },
  { id: 'n3', text: 'Your request received 5 new prayers.', type: 'new', time: '2h ago', read: false },
  { id: 'n4', text: 'Katie H. shared a testimony.', type: 'earlier', time: '1d ago', read: true },
  { id: 'n5', text: 'Michael T. started following you.', type: 'earlier', time: '2d ago', read: true },
  { id: 'n6', text: 'Reminder: Your request has no activity.', type: 'earlier', time: '3d ago', read: true },
];

export const mockReminders = [
  { id: 'r1', title: 'Morning Prayer', time: '6:30 AM', schedule: 'Every day', enabled: true, category: 'daily' },
  { id: 'r2', title: 'Midday Pause', time: '12:00 PM', schedule: 'Every day', enabled: true, category: 'daily' },
  { id: 'r3', title: 'Evening Prayer', time: '8:00 PM', schedule: 'Every day', enabled: true, category: 'daily' },
  { id: 'r4', title: 'Pray for Families', time: '8:00 PM', schedule: 'Thursdays', enabled: true, category: 'weekly' },
  { id: 'r5', title: 'Community Prayer Room', time: '7:00 PM', schedule: 'Sundays', enabled: false, category: 'weekly' },
  { id: 'r6', title: 'Follow up on requests', time: '', schedule: 'Every 3 days', enabled: true, category: 'followup' },
  { id: 'r7', title: 'Thank God for answers', time: '', schedule: 'Every 7 days', enabled: true, category: 'followup' },
];

export const mockAchievements = [
  { id: 'ach1', name: 'First Steps', description: 'Complete your first prayer', completed: true, total: 1, current: 1 },
  { id: 'ach2', name: 'Consistent Heart', description: 'Pray 7 days in a row', completed: true, total: 7, current: 7 },
  { id: 'ach3', name: 'Faithful Intercessor', description: 'Pray for 25 people', completed: false, total: 25, current: 23 },
  { id: 'ach4', name: 'Community Builder', description: 'Invite 5 friends', completed: false, total: 5, current: 3 },
  { id: 'ach5', name: 'Beacon of Hope', description: 'Share 3 testimonies', completed: false, total: 3, current: 1 },
];

export const mockAdminStats = {
  activeUsers: 1248,
  newPrayerRequests: 312,
  reportsNeedReview: 68,
  usersSuspended: 24,
  positiveContent: 98,
  thanksShared: 1200,
  prayersAnswered: 320,
  recentActivity: [
    { id: 'ra1', text: 'New prayer request submitted', time: '2m ago' },
    { id: 'ra2', text: 'Prayer answered by user', time: '5m ago' },
    { id: 'ra3', text: 'New report submitted', time: '12m ago' },
    { id: 'ra4', text: 'User joined community', time: '18m ago' },
  ],
  adminChart: [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 52 },
    { day: 'Wed', value: 48 },
    { day: 'Thu', value: 61 },
    { day: 'Fri', value: 55 },
    { day: 'Sat', value: 70 },
    { day: 'Sun', value: 68 },
  ],
};

export const mockReports = [
  { id: 'rep1', reportedBy: 'User A', reportedUser: 'User B', content: 'Inappropriate prayer request', reason: 'Harassment', status: 'open' },
];

export const mockEncouragements = [
  { id: 'e1', name: 'James L.', text: 'I am lifting you up, Sarah. Praying for God\'s peace to guard your hearts this week.', time: '1h ago' },
  { id: 'e2', name: 'Olivia C.', text: 'Praying with you! Philippians 4:6–7 has been such a comfort to me.', time: '2h ago' },
];

export const mockFollowing = [
  { id: 'u6', name: 'Pastor Daniel', title: 'Teaching pastor', following: true },
  { id: 'u7', name: 'Hannah Grace', title: 'Worship leader', following: true },
  { id: 'u4', name: 'Michael O.', title: 'Youth minister', following: true },
  { id: 'u8', name: 'Elena Rodriguez', title: 'Prayer leader', following: true },
  { id: 'u10', name: 'David Park', title: 'Bible teacher', following: true },
  { id: 'u9', name: 'Lydia James', title: 'Missionary', following: false },
  { id: 'u11', name: 'Jacob Lee', title: 'College leader', following: false },
];

export const mockCalendarEvents = [
  { id: 'c1', title: 'Morning Prayer', time: '6:30 AM', type: 'Daily', date: 'May 15' },
  { id: 'c2', title: 'Community Prayer Room', time: '12:00 PM', type: 'Live', date: 'May 15' },
  { id: 'c3', title: 'Pray for Families', time: '8:00 PM', type: 'Every Thu', date: 'May 15' },
];

export const mockSavedPrayers = [
  { id: 'sp1', title: 'Wisdom for a big decision', status: 'active' },
  { id: 'sp2', title: 'My son\'s health', status: 'active' },
  { id: 'sp3', title: 'Financial provision', status: 'active' },
  { id: 'sp4', title: 'Peace in our home', status: 'answered' },
  { id: 'sp5', title: 'Provision for rent', status: 'answered' },
];

export const mockCurrentUser = {
  id: 'me',
  name: 'Bonga',
  handle: '@bonga',
  bio: 'Seeker. Believer. Intercessor. Praying for my family, community, and the world.',
  avatarColor: '#ded3c4',
  role: 'user',
  prayersShared: 128,
  answeredPrayers: 47,
  daysActive: 7,
  streak: 7,
};

// Export alias for backward compatibility
export const prayers = mockPrayerRequests;

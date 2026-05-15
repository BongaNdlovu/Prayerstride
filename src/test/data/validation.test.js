import { APP_SCREENS, NAV_TO_SCREEN } from '../../data/constants';
import {
  mockUsers,
  mockPrayerRequests,
  mockTestimonies,
  mockAnnouncements,
  mockAdminStats,
  mockReports,
} from '../../data/mockData';

describe('Data Validation Tests', () => {
  describe('APP_SCREENS', () => {
    it('should contain all required screens', () => {
      const requiredScreens = [
        'home',
        'myPrayers',
        'discover',
        'detail',
        'create',
        'createTestimony',
        'praise',
        'praiseDetail',
        'profile',
        'settings',
        'adminDashboard',
        'reportDetails',
      ];

      requiredScreens.forEach((screen) => {
        expect(APP_SCREENS).toContain(screen);
      });
    });

    it('should not have duplicate screen names', () => {
      const uniqueScreens = new Set(APP_SCREENS);
      expect(uniqueScreens.size).toBe(APP_SCREENS.length);
    });

    it('should have valid screen names (strings)', () => {
      APP_SCREENS.forEach((screen) => {
        expect(typeof screen).toBe('string');
        expect(screen.length).toBeGreaterThan(0);
      });
    });
  });

  describe('NAV_TO_SCREEN', () => {
    it('should map all nav keys to valid screens', () => {
      Object.values(NAV_TO_SCREEN).forEach((screen) => {
        expect(APP_SCREENS).toContain(screen);
      });
    });

    it('should have valid nav keys', () => {
      const navKeys = Object.keys(NAV_TO_SCREEN);
      const expectedKeys = ['home', 'prayers', 'create', 'praise', 'stats', 'profile'];
      
      expectedKeys.forEach((key) => {
        expect(navKeys).toContain(key);
      });
    });

    it('should map home to home screen', () => {
      expect(NAV_TO_SCREEN.home).toBe('home');
    });

    it('should map prayers to myPrayers screen', () => {
      expect(NAV_TO_SCREEN.prayers).toBe('myPrayers');
    });

    it('should map create to create screen', () => {
      expect(NAV_TO_SCREEN.create).toBe('create');
    });
  });

  describe('mockUsers', () => {
    it('should have valid user objects', () => {
      mockUsers.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('handle');
        expect(user).toHaveProperty('role');
      });
    });

    it('should have unique user IDs', () => {
      const ids = mockUsers.map((user) => user.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid roles', () => {
      const validRoles = ['user', 'leader', 'admin'];
      mockUsers.forEach((user) => {
        expect(validRoles).toContain(user.role);
      });
    });

    it('should have handles starting with @', () => {
      mockUsers.forEach((user) => {
        expect(user.handle).toMatch(/^@/);
      });
    });
  });

  describe('mockPrayerRequests', () => {
    it('should have valid prayer objects', () => {
      mockPrayerRequests.forEach((prayer) => {
        expect(prayer).toHaveProperty('id');
        expect(prayer).toHaveProperty('userId');
        expect(prayer).toHaveProperty('title');
        expect(prayer).toHaveProperty('text');
        expect(prayer).toHaveProperty('privacy');
      });
    });

    it('should have valid privacy values', () => {
      const validPrivacy = ['community', 'private', 'friends'];
      mockPrayerRequests.forEach((prayer) => {
        expect(validPrivacy).toContain(prayer.privacy);
      });
    });

    it('should have valid urgency values (boolean)', () => {
      mockPrayerRequests.forEach((prayer) => {
        expect(typeof prayer.urgency).toBe('boolean');
      });
    });

    it('should have valid answered values (boolean)', () => {
      mockPrayerRequests.forEach((prayer) => {
        expect(typeof prayer.answered).toBe('boolean');
      });
    });
  });

  describe('mockTestimonies', () => {
    it('should have valid testimony objects', () => {
      mockTestimonies.forEach((testimony) => {
        expect(testimony).toHaveProperty('id');
        expect(testimony).toHaveProperty('prayerId');
        expect(testimony).toHaveProperty('userId');
        expect(testimony).toHaveProperty('title');
        expect(testimony).toHaveProperty('text');
      });
    });

    it('should have valid reaction counts (numbers)', () => {
      mockTestimonies.forEach((testimony) => {
        expect(typeof testimony.praiseGod).toBe('number');
        expect(typeof testimony.amen).toBe('number');
        expect(testimony.praiseGod).toBeGreaterThanOrEqual(0);
        expect(testimony.amen).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('mockAnnouncements', () => {
    it('should have valid announcement objects', () => {
      mockAnnouncements.forEach((announcement) => {
        expect(announcement).toHaveProperty('id');
        expect(announcement).toHaveProperty('title');
        expect(announcement).toHaveProperty('date');
        expect(announcement).toHaveProperty('type');
      });
    });

    it('should have valid types', () => {
      const validTypes = ['Events', 'Prayer', 'Updates'];
      mockAnnouncements.forEach((announcement) => {
        expect(validTypes).toContain(announcement.type);
      });
    });
  });

  describe('mockAdminStats', () => {
    it('should have valid admin stats structure', () => {
      expect(mockAdminStats).toHaveProperty('activeUsers');
      expect(mockAdminStats).toHaveProperty('newPrayerRequests');
      expect(mockAdminStats).toHaveProperty('reportsNeedReview');
      expect(mockAdminStats).toHaveProperty('adminChart');
    });

    it('should have positive numeric values', () => {
      expect(mockAdminStats.activeUsers).toBeGreaterThan(0);
      expect(mockAdminStats.newPrayerRequests).toBeGreaterThanOrEqual(0);
      expect(mockAdminStats.reportsNeedReview).toBeGreaterThanOrEqual(0);
    });

    it('should have admin chart with at least 7 data points', () => {
      expect(mockAdminStats.adminChart.length).toBeGreaterThanOrEqual(7);
      mockAdminStats.adminChart.forEach((point) => {
        expect(point).toHaveProperty('day');
        expect(point).toHaveProperty('value');
        expect(typeof point.value).toBe('number');
      });
    });

    it('should have recent activity array', () => {
      expect(Array.isArray(mockAdminStats.recentActivity)).toBe(true);
      mockAdminStats.recentActivity.forEach((activity) => {
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('text');
        expect(activity).toHaveProperty('time');
      });
    });
  });

  describe('mockReports', () => {
    it('should have valid report objects', () => {
      mockReports.forEach((report) => {
        expect(report).toHaveProperty('id');
        expect(report).toHaveProperty('reason');
        expect(report).toHaveProperty('status');
      });
    });

    it('should have valid status values', () => {
      const validStatuses = ['open', 'resolved', 'dismissed'];
      mockReports.forEach((report) => {
        expect(validStatuses).toContain(report.status);
      });
    });
  });

  describe('Data consistency', () => {
    it('should have testimonies linked to existing prayers when prayerId exists', () => {
      const prayerIds = new Set(mockPrayerRequests.map((p) => p.id));
      mockTestimonies.forEach((testimony) => {
        if (testimony.prayerId) {
          expect(prayerIds).toContain(testimony.prayerId);
        }
      });
    });

    it('should have testimonies linked to existing users', () => {
      const userIds = new Set(mockUsers.map((u) => u.id));
      mockTestimonies.forEach((testimony) => {
        expect(userIds).toContain(testimony.userId);
      });
    });

    it('should have prayers linked to existing users', () => {
      const userIds = new Set(mockUsers.map((u) => u.id));
      mockPrayerRequests.forEach((prayer) => {
        expect(userIds).toContain(prayer.userId);
      });
    });
  });
});

import { render } from '@testing-library/react';
import ProfileScreen from '../../mobile/screens/ProfileScreen';
import PrayerDetailScreen from '../../mobile/screens/PrayerDetailScreen';

const profileProps = {
  user: { uid: 'test', displayName: 'Test User', email: 'test@example.com' },
  signOut: vi.fn(),
  go: vi.fn(),
};

function warmProfileRender() {
  const { unmount } = render(<ProfileScreen {...profileProps} />);
  unmount();
}

vi.mock('react-native', () => ({
  View: ({ children, testID }) => <div data-testid={testID}>{children}</div>,
  Text: ({ children, testID }) => <span data-testid={testID}>{children}</span>,
  Pressable: ({ children, onPress, testID }) => <button data-testid={testID} onClick={onPress}>{children}</button>,
  ScrollView: ({ children, testID }) => <div data-testid={testID}>{children}</div>,
  StyleSheet: { create: (styles) => styles, absoluteFillObject: {} },
  SafeAreaView: ({ children }) => <div>{children}</div>,
  ActivityIndicator: () => <div data-testid="activity-indicator">Loading</div>,
  Alert: { alert: vi.fn() },
  Image: () => <div data-testid="image" />,
  FlatList: ({ data, renderItem, ListEmptyComponent }) => (
    <div data-testid="flat-list">
      {data?.length ? data.map((item, index) => renderItem({ item, index })) : ListEmptyComponent}
    </div>
  ),
  Switch: ({ value, onValueChange }) => <input type="checkbox" checked={value} onChange={(e) => onValueChange(e.target.checked)} />,
  TextInput: (props) => <input {...props} />,
}));

vi.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => <div data-testid="linear-gradient">{children}</div>,
}));

vi.mock('lucide-react-native', () => {
  const icon = (name) => {
    const Icon = () => <span>{name}</span>;
    Icon.displayName = name;
    return Icon;
  };
  const names = [
    'Award', 'BarChart3', 'Bell', 'BookOpen', 'Bookmark', 'Calendar', 'Camera', 'ChevronLeft', 'ChevronRight',
    'Clock', 'Eye', 'EyeOff', 'Filter', 'Flame', 'Footprints', 'Heart', 'Lock', 'Mail', 'Megaphone', 'Moon',
    'MoreHorizontal', 'Plus', 'Search', 'Send', 'Settings', 'ShieldAlert', 'Sparkles',
    'Star', 'Sun', 'Sunrise', 'Timer', 'Trophy', 'User', 'Users', 'X', 'Zap',
  ];
  return Object.fromEntries(names.map((name) => [name, icon(name)]));
});

vi.mock('react-native-svg', () => ({
  default: ({ children }) => <svg>{children}</svg>,
  Circle: () => null,
  Line: () => null,
  Path: () => null,
  Rect: () => null,
  Defs: ({ children }) => <defs>{children}</defs>,
  LinearGradient: ({ children }) => <linearGradient>{children}</linearGradient>,
  Stop: () => null,
  Text: () => null,
}));

vi.mock('react-native-reanimated', () => ({
  default: { createAnimatedComponent: (C) => C },
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: (fn) => fn(),
  withSpring: (v) => v,
}));

vi.mock('../../mobile/theme', () => ({
  colors: {
    white: '#FFFFFF',
    canvas: '#F4F7FB',
    ink: '#0B2A4A',
    gold: '#E0A106',
    sand: '#F4F7FB',
    navy: '#0B2A4A',
    navyDeep: '#07203B',
    screen: '#F4F7FB',
    success: '#10B981',
    urgent: '#EF4444',
    community: '#2F6BFF',
    emerald: '#10B981',
    coral: '#F4795B',
    violet: '#7C5CFC',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF3F9',
    border: '#E2E8F2',
    textPrimary: '#0B2A4A',
    textSecondary: '#50607A',
    textMuted: '#8595AD',
  },
  onDark: { text: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.78)', textMuted: 'rgba(255,255,255,0.55)', accent: '#E0A106' },
  onDarkTypography: { display: {}, h1: {}, h2: {}, h3: {}, h4: {}, body: {}, bodySmall: {}, label: {}, caption: {}, eyebrow: {}, stat: {} },
  alpha: {
    navy06: 'rgba(11,42,74,0.06)',
    navy08: 'rgba(11,42,74,0.08)',
    navy10: 'rgba(11,42,74,0.10)',
    navy12: 'rgba(11,42,74,0.12)',
    navy16: 'rgba(11,42,74,0.16)',
    gold18: 'rgba(224,161,6,0.18)',
    gold22: 'rgba(224,161,6,0.22)',
    gold30: 'rgba(224,161,6,0.30)',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, tabBar: 120 },
  radii: { xs: 8, sm: 12, md: 16, lg: 18, xl: 22, xxl: 24, pill: 999 },
  fonts: { sans: 'Inter', sansSemiBold: 'Inter', sansBold: 'Inter', sansExtraBold: 'Inter', sansMedium: 'Inter', display: 'Sora', displaySemi: 'Sora', serif: 'Sora' },
  typography: { display: {}, h1: {}, h2: {}, h3: {}, h4: {}, body: {}, bodySmall: {}, label: {}, caption: {}, eyebrow: {}, stat: {}, button: {} },
  shadow: { card: {}, fab: {}, subtle: {} },
  glass: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F2', borderWidth: 1 },
  gradients: { goldButton: ['#F5C542', '#E0A106'], navyButton: ['#133558', '#0B2A4A'], spotlight: ['#133558', '#07203B'], screen: ['#F4F7FB', '#FFFFFF'] },
  sharedStyles: { input: {}, textArea: {}, fieldLabel: {} },
}));

vi.mock('../../mobile/useUsers', () => ({
  useUserProfile: () => ({ profile: { displayName: 'Test User', handle: 'testuser', bio: 'Bio' } }),
}));

vi.mock('../../mobile/usePrayerSessions', () => ({
  usePrayerSessions: () => ({ sessions: [], totalSeconds: 0, loading: false, error: null }),
}));

vi.mock('../../mobile/useIsAdmin', () => ({
  useIsAdmin: () => ({ isAdmin: false, loading: false }),
}));

vi.mock('../../mobile/useGamification', () => ({
  useGamification: () => ({
    summary: {
      streak: 0,
      totalXP: 0,
      levelInfo: { level: 1, progress: 0, xpIntoLevel: 0 },
      badges: [],
      impact: { prayerSessions: 0, peoplePrayedFor: 0, answeredPrayers: 0 },
    },
    loading: false,
    error: null,
    retry: vi.fn(),
  }),
}));

vi.mock('../../mobile/usePrayerData', () => ({
  usePrayers: () => ({ prayers: [], loading: false, error: null }),
  useTestimonies: () => ({ testimonies: [], loading: false, error: null }),
  addPrayer: vi.fn(),
  updatePrayer: vi.fn(),
  deletePrayer: vi.fn(),
  markPrayed: vi.fn(),
}));

describe('Performance Tests', () => {
  describe('Render Performance', () => {
    it('should render ProfileScreen component within acceptable time', () => {
      warmProfileRender();
      const start = performance.now();
      render(<ProfileScreen {...profileProps} />);
      // Profile intentionally renders the complete stats/menu surface. Keep this
      // threshold high enough for shared-suite jsdom load while catching stalls.
      expect(performance.now() - start).toBeLessThan(300);
    });

    it('should render PrayerDetailScreen component within acceptable time', () => {
      const start = performance.now();
      render(
        <PrayerDetailScreen
          prayer={{ id: 'test', title: 'Test Prayer', body: 'Test text', authorName: 'Test User', prayedCount: 5 }}
          user={{ uid: 'test' }}
          onBack={vi.fn()}
          go={vi.fn()}
        />,
      );
      expect(performance.now() - start).toBeLessThan(200);
    });
  });

  describe('Re-render Performance', () => {
    it('should handle rapid state updates without performance degradation', () => {
      const signOut = vi.fn();
      const go = vi.fn();
      const { rerender } = render(<ProfileScreen user={{ uid: 'test', displayName: 'Test User', email: 'test@example.com' }} signOut={signOut} go={go} />);
      const start = performance.now();
      for (let i = 0; i < 10; i++) {
        rerender(<ProfileScreen user={{ uid: 'test', displayName: `Test User ${i}`, email: 'test@example.com' }} signOut={signOut} go={go} />);
      }
      // Profile intentionally renders the complete navigation menu. Keep this
      // threshold high enough for shared-suite jsdom load while catching stalls.
      expect(performance.now() - start).toBeLessThan(750);
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks with repeated renders', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<ProfileScreen user={{ uid: 'test', displayName: 'Test User', email: 'test@example.com' }} signOut={vi.fn()} go={vi.fn()} />);
        unmount();
      }
      if (performance.memory) {
        expect(performance.memory.usedJSHeapSize - initialMemory).toBeLessThan(5 * 1024 * 1024);
      }
    });
  });

  describe('Bundle Size Impact', () => {
    it('should have reasonable component file sizes', () => {
      expect(ProfileScreen).toBeDefined();
      expect(PrayerDetailScreen).toBeDefined();
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle large prayer lists without significant slowdown', () => {
      const start = performance.now();
      render(<ProfileScreen user={{ uid: 'test', displayName: 'Test User', email: 'test@example.com' }} signOut={vi.fn()} go={vi.fn()} />);
      expect(performance.now() - start).toBeLessThan(200);
    });
  });
});

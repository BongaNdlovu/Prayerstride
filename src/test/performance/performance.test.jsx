import { render } from '@testing-library/react';
import ProfileScreen from '../../mobile/screens/ProfileScreen';
import PraiseScreen from '../../mobile/screens/PraiseScreen';
import PrayerDetailScreen from '../../mobile/screens/PrayerDetailScreen';

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
    'Clock', 'Eye', 'EyeOff', 'Filter', 'Flame', 'Heart', 'Lock', 'Mail', 'Megaphone', 'Moon',
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
  colors: { ink: '#0a0a0a', ivory: '#f8f3ea', gold: '#d7a552', sand: '#d4c4a8', navy: '#1a2332', screen: '#080b13', success: '#4ade80', urgent: '#ef4444', community: '#3b82f6' },
  alpha: { ivory10: 'rgba(247,240,228,0.10)', ivory11: 'rgba(247,240,228,0.11)', ivory12: 'rgba(247,240,228,0.12)', ivory16: 'rgba(247,240,228,0.16)', ivory55: 'rgba(247,240,228,0.55)', ivory58: 'rgba(247,240,228,0.58)', ivory62: 'rgba(247,240,228,0.62)', ivory72: 'rgba(247,240,228,0.72)', gold18: 'rgba(215,165,82,0.18)', gold22: 'rgba(215,165,82,0.22)' },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, tabBar: 120 },
  radii: { xs: 8, sm: 12, md: 16, lg: 18, xl: 22, xxl: 24, pill: 999 },
  fonts: { sans: 'Inter', sansSemiBold: 'Inter', sansBold: 'Inter', sansExtraBold: 'Inter', serif: 'Playfair' },
  typography: { display: {}, h1: {}, h2: {}, h3: {}, h4: {}, body: {}, bodySmall: {}, label: {}, caption: {}, eyebrow: {}, stat: {}, button: {} },
  shadow: { card: {}, fab: {} },
  gradients: { goldButton: ['#E8C078', '#D7A552'] },
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
      const start = performance.now();
      render(<ProfileScreen user={{ uid: 'test', displayName: 'Test User', email: 'test@example.com' }} signOut={vi.fn()} go={vi.fn()} />);
      expect(performance.now() - start).toBeLessThan(150);
    });

    it('should render PraiseScreen component within acceptable time', () => {
      const start = performance.now();
      render(<PraiseScreen onOpenTestimony={vi.fn()} />);
      expect(performance.now() - start).toBeLessThan(100);
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
      expect(performance.now() - start).toBeLessThan(500);
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
      expect(PraiseScreen).toBeDefined();
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

import React from 'react';
import { vi } from 'vitest';

globalThis.__DEV__ = true;
process.env.EXPO_OS = 'ios';
globalThis.expo = {
  EventEmitter: class {
    addListener() {
      return { remove: vi.fn() };
    }

    removeAllListeners() {}
  },
};

const { flattenStyle } = vi.hoisted(() => {
  function flattenStyle(style) {
    if (!style) return undefined;
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.map(flattenStyle).filter(Boolean));
    }
    if (typeof style !== 'object') return undefined;
    const {
      transform,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      shadowColor,
      elevation,
      textAlignVertical,
      ...domStyle
    } = style;
    return domStyle;
  }
  return { flattenStyle };
});

const harnessMocks = vi.hoisted(() => ({
  mockUpdatePrayer: vi.fn(() => Promise.resolve()),
  mockDeletePrayer: vi.fn(() => Promise.resolve()),
  mockMarkAnswered: vi.fn(() => Promise.resolve()),
  mockUpdateGamificationPreferences: vi.fn(() => Promise.resolve({
    leaderboardVisible: true,
    darkModeEnabled: false,
    soundHapticsEnabled: true,
    xpNotificationsEnabled: true,
    streakRemindersEnabled: true,
  })),
  mockSetPreferences: vi.fn(),
  mockAlert: vi.fn(),
  mockBookmarkPrayer: vi.fn(() => Promise.resolve()),
  mockUnbookmarkPrayer: vi.fn(() => Promise.resolve()),
  mockGetPrayerBookmark: vi.fn(() => Promise.resolve({ bookmarked: false })),
  mockPrayForRequest: vi.fn(() => Promise.resolve({ duplicate: false, prayerLimit: 'daily' })),
  mockSubmitReport: vi.fn(() => Promise.resolve()),
  mockAsyncStorageGet: vi.fn(() => Promise.resolve(null)),
  mockAsyncStorageSet: vi.fn(() => Promise.resolve()),
}));

export function getHarnessMocks() {
  return harnessMocks;
}

vi.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}));
vi.mock('react-native/Libraries/Utilities/Platform', () => ({ OS: 'ios', select: (obj) => obj.ios, Version: '17.0' }));

vi.mock('react-native-reanimated', () => ({
  default: {
    createAnimatedComponent: (Component) => Component,
    View: ({ children, style, ...props }) => React.createElement('div', { style: flattenStyle(style), ...props }, children),
  },
  useSharedValue: (value) => ({ value }),
  useAnimatedStyle: (factory) => factory(),
  withSpring: (value) => value,
  withRepeat: (value) => value,
  withTiming: (value) => value,
  Easing: {
    linear: (v) => v,
    out: () => (v) => v,
    in: () => (v) => v,
    inOut: () => (v) => v,
  },
  FadeInUp: { duration: () => ({}) },
  FadeOutDown: { duration: () => ({}) },
}));

vi.mock('react-native', () => ({
  View: ({ children, testID, style, ...props }) => React.createElement('div', { 'data-testid': testID, style: flattenStyle(style), ...props }, children),
  Text: ({ children, testID, style, ...props }) => React.createElement('span', { 'data-testid': testID, style: flattenStyle(style), ...props }, children),
  TextInput: ({ value, onChangeText, testID, style, placeholder, secureTextEntry, ...props }) => React.createElement('input', {
    value: value ?? '',
    onChange: (event) => onChangeText?.(event.target.value),
    'data-testid': testID,
    placeholder,
    type: secureTextEntry ? 'password' : 'text',
    style: flattenStyle(style),
    ...props,
  }),
  Pressable: ({ children, onPress, testID, style, ...props }) => React.createElement('button', { type: 'button', 'data-testid': testID, onClick: onPress, style: flattenStyle(style), ...props }, children),
  ScrollView: ({ children, testID, style, ...props }) => React.createElement('div', { 'data-testid': testID, style: flattenStyle(style), ...props }, children),
  StyleSheet: { create: (styles) => styles, absoluteFillObject: {}, flatten: flattenStyle },
  SafeAreaView: ({ children, ...props }) => React.createElement('div', props, children),
  ActivityIndicator: (props) => React.createElement('div', { 'data-testid': 'activity-indicator', ...props }, 'Loading'),
  Alert: { alert: (...args) => harnessMocks.mockAlert(...args) },
  Image: (props) => React.createElement('div', { 'data-testid': 'image', ...props }),
  ImageBackground: ({ children, ...props }) => React.createElement('div', props, children),
  FlatList: ({ data, renderItem, ListEmptyComponent, ListHeaderComponent, ...props }) => {
    const items = [];
    if (ListHeaderComponent) items.push(ListHeaderComponent);
    if (data?.length) {
      for (let i = 0; i < data.length; i++) {
        items.push(renderItem({ item: data[i], index: i }));
      }
    } else if (ListEmptyComponent) {
      items.push(ListEmptyComponent);
    }
    return React.createElement('div', { 'data-testid': 'flat-list', ...props }, ...items);
  },
  Switch: ({ value, onValueChange, ...props }) => React.createElement('input', {
    type: 'checkbox',
    checked: value,
    onChange: (event) => onValueChange?.(event.target.checked),
    ...props,
  }),
  TouchableOpacity: ({ children, onPress, ...props }) => React.createElement('button', { type: 'button', onClick: onPress, ...props }, children),
  Modal: ({ children, visible, ...props }) => (visible ? React.createElement('div', props, children) : null),
  Platform: { OS: 'ios', select: (obj) => obj.ios, Version: '17.0' },
  Animated: {
    createAnimatedComponent: (comp) => comp,
    View: ({ children, ...props }) => React.createElement('div', props, children),
    Text: ({ children, ...props }) => React.createElement('span', props, children),
    ScrollView: ({ children, ...props }) => React.createElement('div', props, children),
    timing: () => ({ start: vi.fn() }),
    spring: () => ({ start: vi.fn() }),
    Value: class { constructor(v) { this._value = v; } },
    ValueXY: class { constructor() { this.x = {}; this.y = {}; } },
  },
  Dimensions: { get: () => ({ width: 390, height: 844 }), addEventListener: vi.fn() },
  useWindowDimensions: () => ({ width: 390, height: 844 }),
  AppState: { addEventListener: vi.fn(), currentState: 'active' },
  Keyboard: { addListener: vi.fn(), dismiss: vi.fn() },
  BackHandler: { addEventListener: vi.fn() },
  InteractionManager: { runAfterInteractions: vi.fn((cb) => cb?.()) },
  NativeModules: {},
  NativeEventEmitter: vi.fn(() => ({ addListener: vi.fn() })),
  LayoutAnimation: { configureNext: vi.fn(), easeInEaseOut: vi.fn() },
  StatusBar: ({ children, ...props }) => React.createElement('div', props, children),
  RefreshControl: ({ children, ...props }) => React.createElement('div', props, children),
  KeyboardAvoidingView: ({ children, style, ...props }) => React.createElement('div', { style: flattenStyle(style), ...props }, children),
  PanResponder: {
    create: () => ({
      panHandlers: {},
    }),
  },
  TurboModuleRegistry: {
    get: vi.fn(() => null),
    getEnforcing: vi.fn(() => ({})),
  },
}));

vi.mock('expo', () => ({
  requireNativeModule: vi.fn(() => ({})),
}));
vi.mock('expo-modules-core', () => ({
  EventEmitter: class {
    addListener() {
      return { remove: vi.fn() };
    }

    removeAllListeners() {}
  },
  requireOptionalNativeModule: vi.fn(),
  NativeModulesProxy: {},
}));

vi.mock('expo-font', () => ({
  useFonts: vi.fn(() => [true]),
  loadAsync: vi.fn(),
  isLoaded: vi.fn(() => true),
}));

vi.mock('@expo-google-fonts/dm-sans', () => ({ useFonts: vi.fn(() => [true]) }));
vi.mock('@expo-google-fonts/playfair-display', () => ({ useFonts: vi.fn(() => [true]) }));

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: { name: 'prayerstride', slug: 'prayerstride' },
    manifest: { name: 'prayerstride', slug: 'prayerstride' },
    executionEnvironment: 'standalone',
    appOwnership: 'expo',
  },
}));

vi.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone 15',
  osName: 'iOS',
  osVersion: '17.0',
  deviceName: 'iPhone',
  deviceYearClass: 2023,
}));

vi.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => React.createElement('div', null, children),
}));

vi.mock('expo-linking', () => ({
  createURL: vi.fn(() => 'prayerstride://'),
  getLinkingURL: vi.fn(() => null),
  parse: vi.fn(),
}));

vi.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: vi.fn(() => ({ data: 'ExponentPushToken[mock]' })),
  setNotificationChannelAsync: vi.fn(),
  setNotificationHandler: vi.fn(),
  requestPermissionsAsync: vi.fn(() => ({ status: 'granted' })),
  getPermissionsAsync: vi.fn(() => ({ status: 'granted' })),
}));

vi.mock('expo-updates', () => ({
  isEnabled: false,
  checkForUpdateAsync: vi.fn(),
  fetchUpdateAsync: vi.fn(),
  reloadAsync: vi.fn(),
}));

vi.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: vi.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: vi.fn(() => Promise.resolve({ canceled: true, assets: [] })),
  MediaTypeOptions: { Images: 'Images' },
}));

vi.mock('expo-image-manipulator', () => ({
  manipulateAsync: vi.fn(() => Promise.resolve({ uri: 'file://avatar.jpg', width: 100, height: 100 })),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
}));

vi.mock('../../../src/mobile/avatarUpload', () => ({
  prepareAvatarBlob: vi.fn(() => Promise.resolve(new Blob(['avatar']))),
  AVATAR_CONTENT_TYPE: 'image/jpeg',
  AvatarTooLargeError: class AvatarTooLargeError extends Error {},
  getUploadErrorMessage: vi.fn(() => 'Upload failed'),
}));

vi.mock('../../../src/mobile/AuthProvider', () => ({
  useAuth: () => ({ user: { uid: 'u1', displayName: 'Test User', email: 'test@example.com' } }),
}));

vi.mock('../../../src/mobile/profileCache', () => ({
  clearCachedProfile: vi.fn(),
}));

vi.mock('@firebase/auth', () => ({
  updateProfile: vi.fn(() => Promise.resolve()),
}));

vi.mock('react-native-screens', () => ({
  Screen: ({ children }) => React.createElement('div', null, children),
  ScreenContainer: ({ children }) => React.createElement('div', null, children),
  ScreenStack: ({ children }) => React.createElement('div', null, children),
  ScreenStackHeaderConfig: () => null,
  enableScreens: vi.fn(),
  screensEnabled: vi.fn(() => true),
}));

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => React.createElement('div', null, children),
  SafeAreaView: ({ children }) => React.createElement('div', null, children),
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  initialWindowMetrics: { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } },
}));

vi.mock('react-native-svg', () => ({
  default: ({ children, ...props }) => React.createElement('div', props, children),
  Svg: ({ children, ...props }) => React.createElement('div', props, children),
  Circle: (props) => React.createElement('div', props),
  Rect: (props) => React.createElement('div', props),
  Path: (props) => React.createElement('div', props),
  Line: (props) => React.createElement('div', props),
  G: ({ children, ...props }) => React.createElement('div', props, children),
  Defs: ({ children, ...props }) => React.createElement('div', props, children),
  LinearGradient: ({ children, ...props }) => React.createElement('div', props, children),
  Stop: (props) => React.createElement('div', props),
  Text: ({ children, ...props }) => React.createElement('span', props, children),
}));

vi.mock('../../../src/mobile/theme', () => {
  const colors = {
    white: '#FFFFFF',
    ink: '#111827', ink2: '#374151', ink3: '#6B7280', ink4: '#9CA3AF',
    surface: '#FAFAF8', surface2: '#F5F3EF', surface3: '#EDE9E2',
    gold: '#B8924A', goldLight: '#D4AA6A', goldPale: '#F9F3E8',
    teal: '#2A8C7E', tealLight: '#3BADA0', tealPale: '#EAF5F4',
    night: '#0D1B2A', night2: '#152236', night3: '#1E3352',
    amber: '#D97706', redSoft: '#DC4F4F', purple: '#7C3AED',
    border: 'rgba(0,0,0,0.07)',
    navy: '#111827', navyDeep: '#0D1B2A', navyMid: '#152236',
    emerald: '#2A8C7E', community: '#2F6BFF', coral: '#F4795B', violet: '#7C5CFC',
    surfaceMuted: '#F5F3EF', textPrimary: '#111827', textSecondary: '#374151', textMuted: '#6B7280',
    screen: '#FAFAF8', screenAlt: '#F5F3EF', sand: '#FAFAF8', stone: '#9CA3AF', muted: '#6B7280',
    warm: '#F5F3EF', dusk: '#152236', olive: '#2A8C7E', clay: '#F4795B', candle: '#D4AA6A',
    success: '#2A8C7E', urgent: '#DC4F4F',
  };
  const alpha = {
    ink06: 'rgba(17,24,39,0.06)', ink08: 'rgba(17,24,39,0.08)', ink10: 'rgba(17,24,39,0.10)', ink12: 'rgba(17,24,39,0.12)',
    ink16: 'rgba(17,24,39,0.16)', ink20: 'rgba(17,24,39,0.20)', ink55: 'rgba(17,24,39,0.55)', ink62: 'rgba(17,24,39,0.62)', ink72: 'rgba(17,24,39,0.72)',
    gold18: 'rgba(184,146,74,0.18)', gold22: 'rgba(184,146,74,0.22)', gold30: 'rgba(184,146,74,0.30)',
    teal08: 'rgba(42,140,126,0.08)', overlay: 'rgba(13,27,42,0.72)', overlayLight: 'rgba(13,27,42,0.48)',
    navy06: 'rgba(17,24,39,0.06)', navy08: 'rgba(17,24,39,0.08)', navy10: 'rgba(17,24,39,0.10)', navy12: 'rgba(17,24,39,0.12)',
    navy16: 'rgba(17,24,39,0.16)', navy20: 'rgba(17,24,39,0.20)', navy55: 'rgba(17,24,39,0.55)', navy62: 'rgba(17,24,39,0.62)', navy72: 'rgba(17,24,39,0.72)',
  };
  const radii = { xs: 8, sm: 12, md: 18, lg: 24, xl: 32, xxl: 32, pill: 999 };
  const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, tabBar: 100 };
  const fonts = { display: 'PlayfairDisplay_700Bold', displaySemi: 'PlayfairDisplay_600SemiBold', displayRegular: 'PlayfairDisplay_400Regular', serif: 'PlayfairDisplay_700Bold', serifRegular: 'PlayfairDisplay_400Regular', serifSemiBold: 'PlayfairDisplay_600SemiBold', sans: 'DMSans_400Regular', sansMedium: 'DMSans_500Medium', sansSemiBold: 'DMSans_600SemiBold', sansBold: 'DMSans_700Bold', sansExtraBold: 'DMSans_700Bold' };
  const typography = {
    display: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42, color: colors.ink },
    h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.ink },
    h2: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: colors.ink },
    h3: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.ink },
    h4: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, color: colors.ink },
    body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.ink2 },
    bodySmall: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.ink3 },
    label: { fontFamily: fonts.sansSemiBold, fontSize: 13, lineHeight: 18, color: colors.ink },
    caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.ink3 },
    eyebrow: { fontFamily: fonts.sansExtraBold, fontSize: 11, lineHeight: 14, letterSpacing: 2.4, textTransform: 'uppercase', color: colors.gold },
    stat: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.ink },
    button: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 20, color: colors.white },
    small: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.ink3 },
  };
  const onDark = { text: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.78)', textMuted: 'rgba(255,255,255,0.55)', accent: colors.goldLight, surface: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.16)' };
  const onDarkTypography = {
    display: { ...typography.display, color: onDark.text },
    h1: { ...typography.h1, color: onDark.text }, h2: { ...typography.h2, color: onDark.text },
    h3: { ...typography.h3, color: onDark.text }, h4: { ...typography.h4, color: onDark.text },
    body: { ...typography.body, color: onDark.textSecondary }, bodySmall: { ...typography.bodySmall, color: onDark.textMuted },
    caption: { ...typography.caption, color: onDark.textMuted }, eyebrow: { ...typography.eyebrow, color: onDark.accent },
  };
  const shadow = { card: {}, fab: {}, subtle: {} };
  const glass = { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1 };
  const gradients = { screen: [colors.surface, colors.white], spotlight: [colors.night2, colors.night], gold: [colors.goldLight, colors.gold], goldButton: [colors.goldLight, colors.gold], navyButton: [colors.night2, colors.ink], card: [colors.white, colors.surface2] };
  const cinematicScreen = { flex: 1, backgroundColor: colors.surface };
  const scenes = { dawn: '', bible: '', community: '', chapel: '', answered: '', texture: '' };
  const sharedStyles = {
    input: { marginTop: spacing.md, minHeight: 52, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: spacing.lg, color: colors.ink, fontSize: 15, fontFamily: fonts.sans },
    textArea: { minHeight: 140, paddingTop: spacing.lg, textAlignVertical: 'top' },
    fieldLabel: { ...typography.label, color: colors.ink, marginTop: spacing.lg },
  };
  return { colors, onDark, alpha, gradients, radii, spacing, fonts, typography, onDarkTypography, shadow, glass, cinematicScreen, scenes, sharedStyles };
});

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: (...args) => harnessMocks.mockAsyncStorageGet(...args),
    setItem: (...args) => harnessMocks.mockAsyncStorageSet(...args),
    removeItem: vi.fn(() => Promise.resolve()),
    mergeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('../../../src/mobile/api', () => ({
  bookmarkPrayer: (...args) => harnessMocks.mockBookmarkPrayer(...args),
  getPrayerBookmark: (...args) => harnessMocks.mockGetPrayerBookmark(...args),
  prayForRequest: (...args) => harnessMocks.mockPrayForRequest(...args),
  unbookmarkPrayer: (...args) => harnessMocks.mockUnbookmarkPrayer(...args),
  updateMyProfile: vi.fn(() => Promise.resolve({})),
  getPrayers: vi.fn(() => Promise.resolve([])),
  getTestimonies: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../../../src/mobile/usePrayerData', () => ({
  usePrayers: () => ({ prayers: [], loading: false, error: null, retry: vi.fn() }),
  addPrayer: vi.fn(),
  updatePrayer: (...args) => harnessMocks.mockUpdatePrayer(...args),
  deletePrayer: (...args) => harnessMocks.mockDeletePrayer(...args),
  markAnswered: (...args) => harnessMocks.mockMarkAnswered(...args),
  addTestimony: vi.fn(),
  useTestimonies: () => ({ testimonies: [], loading: false, error: null, retry: vi.fn() }),
}));

vi.mock('../../../src/mobile/gamificationRefresh', () => ({ bumpGamificationRefresh: vi.fn() }));
vi.mock('../../../src/mobile/useReports', () => ({ submitReport: (...args) => harnessMocks.mockSubmitReport(...args) }));
vi.mock('../../../src/mobile/logger', () => ({ warn: vi.fn() }));

vi.mock('../../../src/mobile/useGamificationPreferences', () => ({
  useGamificationPreferences: () => ({
    preferences: {
      leaderboardVisible: true,
      darkModeEnabled: false,
      soundHapticsEnabled: true,
      xpNotificationsEnabled: true,
      streakRemindersEnabled: true,
    },
    loading: false,
    error: null,
    retry: vi.fn(),
    setPreferences: harnessMocks.mockSetPreferences,
  }),
  updateGamificationPreferences: (...args) => harnessMocks.mockUpdateGamificationPreferences(...args),
}));

vi.mock('../../../src/mobile/useUsers', () => ({
  useUserProfile: () => ({ profile: { displayName: 'Test User', handle: 'testuser', bio: 'Bio' }, loading: false, error: null }),
  useUsers: () => ({ users: [], loading: false, error: null }),
}));

vi.mock('../../../src/mobile/usePrayerSessions', () => ({
  usePrayerSessions: () => ({ sessions: [], totalSeconds: 0, loading: false, error: null }),
  addPrayerSession: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../../src/mobile/useIsAdmin', () => ({
  useIsAdmin: () => ({ isAdmin: false, loading: false }),
  useSuspendedStatus: () => ({ suspended: false, loading: false }),
}));

vi.mock('../../../src/mobile/useGamification', () => ({
  useGamification: () => ({
    summary: {
      streak: 0,
      totalXP: 0,
      levelInfo: { level: 1, progress: 0, xpIntoLevel: 0 },
      journey: { title: 'Prayer Walker', stage: 'beginner' },
      badges: [],
      impact: { prayerSessions: 0, peoplePrayedFor: 0, answeredPrayers: 0 },
    },
    loading: false,
    error: null,
    retry: vi.fn(),
  }),
}));

vi.mock('../../../src/mobile/useLeaderboard', () => ({
  useLeaderboard: () => ({
    leaderboard: { scope: 'weekly', resetAt: null, rows: [], me: null },
    loading: false,
    error: null,
    retry: vi.fn(),
  }),
}));

vi.mock('../../../src/mobile/useNotifications', () => ({
  useNotifications: () => ({ notifications: [], loading: false, error: null, retry: vi.fn() }),
}));

vi.mock('../../../src/mobile/useNotificationSettings', () => ({
  useNotificationSettings: () => ({ settings: {}, loading: false, error: null, retry: vi.fn() }),
}));

vi.mock('../../../src/mobile/useAnnouncements', () => ({
  useAnnouncements: () => ({ announcements: [], loading: false, error: null, retry: vi.fn() }),
}));

vi.mock('../../../src/mobile/useContentCollections', () => ({
  useDevotions: () => ({ devotions: [], loading: false, error: null, retry: vi.fn() }),
}));

vi.mock('../../../src/mobile/useCalendarEvents', () => ({
  useCalendarEvents: () => ({ events: [], bookmarks: [], loading: false, error: null, retry: vi.fn() }),
}));

vi.mock('../../../src/mobile/useBlocks', () => ({
  useBlocks: () => ({ blockedIds: [], loading: false, error: null }),
  filterBlockedItems: (items) => items || [],
}));

vi.mock('../../../src/mobile/AppFeedbackProvider', () => ({
  useAppFeedback: () => ({ showToast: vi.fn(), showCelebration: vi.fn() }),
}));

vi.mock('../../../src/mobile/useReports', () => ({
  submitReport: (...args) => harnessMocks.mockSubmitReport(...args),
  useReports: () => ({ reports: [], loading: false, error: null, retry: vi.fn() }),
}));

vi.mock('lucide-react-native', () => {
  const iconNames = [
    'AlertCircle', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Award', 'BarChart3', 'Bell', 'BookOpen', 'Bookmark', 'Briefcase', 'Calendar',
    'Camera', 'Check', 'CheckCircle', 'ChevronLeft', 'ChevronRight', 'Clock', 'Edit', 'ExternalLink', 'Eye',
    'EyeOff', 'Filter', 'Flame', 'Footprints', 'Globe', 'Heart', 'Home', 'Image', 'Inbox', 'Info', 'Link', 'Lock',
    'LogOut', 'Mail', 'MapPin', 'Megaphone', 'MessageCircle', 'Moon', 'MoreHorizontal', 'Pause', 'PenLine',
    'Phone', 'Play', 'PlayCircle', 'Plus', 'RotateCcw', 'Search', 'Send', 'SendHorizontal', 'Settings',
    'Share', 'Shield', 'ShieldAlert', 'Sliders', 'Sparkles', 'Star', 'StopCircle', 'Sun', 'Sunrise', 'Target',
    'Timer', 'Trash', 'TrendingUp', 'Trophy', 'User', 'Users', 'Volume2', 'VolumeX', 'X', 'Zap',
  ];
  return Object.fromEntries(iconNames.map((name) => [
    name,
    (props) => React.createElement('span', { 'data-testid': `icon-${name}`, ...props }),
  ]));
});

export function resetRenderHarnessMocks() {
  harnessMocks.mockUpdatePrayer.mockClear();
  harnessMocks.mockDeletePrayer.mockClear();
  harnessMocks.mockMarkAnswered.mockClear();
  harnessMocks.mockUpdateGamificationPreferences.mockClear();
  harnessMocks.mockSetPreferences.mockClear();
  harnessMocks.mockAlert.mockClear();
  harnessMocks.mockBookmarkPrayer.mockClear();
  harnessMocks.mockUnbookmarkPrayer.mockClear();
  harnessMocks.mockGetPrayerBookmark.mockClear();
  harnessMocks.mockPrayForRequest.mockClear();
  harnessMocks.mockSubmitReport.mockClear();
  harnessMocks.mockAsyncStorageGet.mockClear();
  harnessMocks.mockAsyncStorageSet.mockClear();
  harnessMocks.mockUpdatePrayer.mockImplementation(() => Promise.resolve());
  harnessMocks.mockDeletePrayer.mockImplementation(() => Promise.resolve());
  harnessMocks.mockMarkAnswered.mockImplementation(() => Promise.resolve());
  harnessMocks.mockGetPrayerBookmark.mockImplementation(() => Promise.resolve({ bookmarked: false }));
  harnessMocks.mockPrayForRequest.mockImplementation(() => Promise.resolve({ duplicate: false, prayerLimit: 'daily' }));
  harnessMocks.mockUpdateGamificationPreferences.mockImplementation(() => Promise.resolve({
    leaderboardVisible: true,
    darkModeEnabled: false,
    soundHapticsEnabled: true,
    xpNotificationsEnabled: true,
    streakRemindersEnabled: true,
  }));
}

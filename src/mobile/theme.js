export const colors = {
  white: '#FFFFFF',

  ink: '#111827',
  ink2: '#374151',
  ink3: '#6B7280',
  ink4: '#9CA3AF',

  surface: '#FAFAF8',
  surface2: '#F5F3EF',
  surface3: '#EDE9E2',

  gold: '#B8924A',
  goldLight: '#D4AA6A',
  goldPale: '#F9F3E8',

  teal: '#2A8C7E',
  tealLight: '#3BADA0',
  tealPale: '#EAF5F4',

  night: '#0D1B2A',
  night2: '#152236',
  night3: '#1E3352',

  amber: '#D97706',
  redSoft: '#DC4F4F',
  purple: '#7C3AED',

  border: 'rgba(0,0,0,0.07)',

  // Legacy aliases (backward compat for out-of-scope files)
  navy: '#111827',
  navyDeep: '#0D1B2A',
  navyMid: '#152236',
  emerald: '#2A8C7E',
  community: '#2F6BFF',
  coral: '#F4795B',
  violet: '#7C5CFC',

  surfaceMuted: '#F5F3EF',
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',

  screen: '#FAFAF8',
  screenAlt: '#F5F3EF',
  sand: '#FAFAF8',
  stone: '#9CA3AF',
  muted: '#6B7280',
  warm: '#F5F3EF',
  dusk: '#152236',
  olive: '#2A8C7E',
  clay: '#F4795B',
  candle: '#D4AA6A',
  success: '#2A8C7E',
  urgent: '#DC4F4F',
};

export const onDark = {
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.78)',
  textMuted: 'rgba(255,255,255,0.55)',
  accent: colors.goldLight,
  surface: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.16)',
};

export const alpha = {
  ink06: 'rgba(17,24,39,0.06)',
  ink08: 'rgba(17,24,39,0.08)',
  ink10: 'rgba(17,24,39,0.10)',
  ink12: 'rgba(17,24,39,0.12)',
  ink16: 'rgba(17,24,39,0.16)',
  ink20: 'rgba(17,24,39,0.20)',
  ink55: 'rgba(17,24,39,0.55)',
  ink62: 'rgba(17,24,39,0.62)',
  ink72: 'rgba(17,24,39,0.72)',
  gold18: 'rgba(184,146,74,0.18)',
  gold22: 'rgba(184,146,74,0.22)',
  gold30: 'rgba(184,146,74,0.30)',
  teal08: 'rgba(42,140,126,0.08)',
  overlay: 'rgba(13,27,42,0.72)',
  overlayLight: 'rgba(13,27,42,0.48)',

  // Legacy alpha aliases
  navy06: 'rgba(17,24,39,0.06)',
  navy08: 'rgba(17,24,39,0.08)',
  navy10: 'rgba(17,24,39,0.10)',
  navy12: 'rgba(17,24,39,0.12)',
  navy16: 'rgba(17,24,39,0.16)',
  navy20: 'rgba(17,24,39,0.20)',
  navy55: 'rgba(17,24,39,0.55)',
  navy62: 'rgba(17,24,39,0.62)',
  navy72: 'rgba(17,24,39,0.72)',
};

export const gradients = {
  screen: [colors.surface, colors.white],
  spotlight: [colors.night2, colors.night],
  gold: [colors.goldLight, colors.gold],
  goldButton: [colors.goldLight, colors.gold],
  navyButton: [colors.night2, colors.ink],
  card: [colors.white, colors.surface2],
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  xxl: 32,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  tabBar: 100,
};

export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  displaySemi: 'PlayfairDisplay_600SemiBold',
  displayRegular: 'PlayfairDisplay_400Regular',
  serif: 'PlayfairDisplay_700Bold',
  serifRegular: 'PlayfairDisplay_400Regular',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  sansBold: 'DMSans_700Bold',
  sansExtraBold: 'DMSans_700Bold',
};

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42, color: colors.ink },
  h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.ink },
  h2: { fontFamily: fonts.displaySemi, fontSize: 26, lineHeight: 32, color: colors.ink },
  h3: { fontFamily: fonts.displaySemi, fontSize: 22, lineHeight: 28, color: colors.ink },
  h4: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 26, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.ink2 },
  bodySmall: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.ink3 },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 13, lineHeight: 18, color: colors.ink },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.ink3 },
  eyebrow: {
    fontFamily: fonts.sansExtraBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.gold,
  },
  stat: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.ink },
  button: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 20, color: colors.white },
};

export const onDarkTypography = {
  display: { ...typography.display, color: onDark.text },
  h1: { ...typography.h1, color: onDark.text },
  h2: { ...typography.h2, color: onDark.text },
  h3: { ...typography.h3, color: onDark.text },
  h4: { ...typography.h4, color: onDark.text },
  body: { ...typography.body, color: onDark.textSecondary },
  bodySmall: { ...typography.bodySmall, color: onDark.textMuted },
  caption: { ...typography.caption, color: onDark.textMuted },
  eyebrow: { ...typography.eyebrow, color: onDark.accent },
};

export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  fab: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
};

export const glass = {
  backgroundColor: colors.white,
  borderColor: colors.border,
  borderWidth: 1,
};

export const cinematicScreen = {
  flex: 1,
  backgroundColor: colors.surface,
};

export const scenes = {
  dawn: require('../assets/compressed-scenes/1.jpg'),
  bible: require('../assets/compressed-scenes/2.jpg'),
  community: require('../assets/compressed-scenes/3.jpg'),
  chapel: require('../assets/compressed-scenes/4.jpg'),
  answered: require('../assets/compressed-scenes/5.jpg'),
  texture: require('../assets/compressed-scenes/6.jpg'),
};

/** Shared StyleSheet fragments used across screens */
export const sharedStyles = {
  input: {
    marginTop: spacing.md,
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    color: colors.ink,
    fontSize: 15,
    fontFamily: fonts.sans,
  },
  textArea: {
    minHeight: 140,
    paddingTop: spacing.lg,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    ...typography.label,
    color: colors.ink,
    marginTop: spacing.lg,
  },
};

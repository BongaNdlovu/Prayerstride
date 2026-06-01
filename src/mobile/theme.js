export const colors = {
  white: '#FFFFFF',
  canvas: '#F4F7FB',
  navy: '#0B2A4A',
  navyDeep: '#07203B',
  navyMid: '#133558',

  gold: '#E0A106',
  goldDark: '#B8862E',
  goldLight: '#F5C542',
  emerald: '#10B981',
  community: '#2F6BFF',
  coral: '#F4795B',
  violet: '#7C5CFC',

  surface: '#FFFFFF',
  surfaceMuted: '#EEF3F9',
  border: '#E2E8F2',
  textPrimary: '#0B2A4A',
  textSecondary: '#50607A',
  textMuted: '#8595AD',

  // Legacy aliases (light-theme remaps)
  ivory: '#0B2A4A',
  ink: '#0B2A4A',
  screen: '#F4F7FB',
  screenAlt: '#EEF3F9',
  sand: '#F4F7FB',
  stone: '#C5D0E0',
  muted: '#8595AD',
  warm: '#EEF3F9',
  dusk: '#133558',
  olive: '#10B981',
  clay: '#F4795B',
  candle: '#F5C542',
  success: '#10B981',
  urgent: '#EF4444',
};

export const onDark = {
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.78)',
  textMuted: 'rgba(255,255,255,0.55)',
  accent: '#E0A106',
  surface: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.16)',
};

export const alpha = {
  navy06: 'rgba(11,42,74,0.06)',
  navy08: 'rgba(11,42,74,0.08)',
  navy10: 'rgba(11,42,74,0.10)',
  navy12: 'rgba(11,42,74,0.12)',
  navy16: 'rgba(11,42,74,0.16)',
  navy20: 'rgba(11,42,74,0.20)',
  navy55: 'rgba(11,42,74,0.55)',
  navy62: 'rgba(11,42,74,0.62)',
  navy72: 'rgba(11,42,74,0.72)',
  gold18: 'rgba(224,161,6,0.18)',
  gold22: 'rgba(224,161,6,0.22)',
  gold30: 'rgba(224,161,6,0.30)',
  overlay: 'rgba(7,32,59,0.72)',
  overlayLight: 'rgba(7,32,59,0.48)',

  // Legacy aliases → navy-based light-theme values
  ivory10: 'rgba(11,42,74,0.06)',
  ivory11: 'rgba(11,42,74,0.08)',
  ivory12: 'rgba(11,42,74,0.10)',
  ivory16: 'rgba(11,42,74,0.12)',
  ivory20: 'rgba(11,42,74,0.16)',
  ivory55: 'rgba(11,42,74,0.55)',
  ivory58: 'rgba(11,42,74,0.58)',
  ivory62: 'rgba(11,42,74,0.62)',
  ivory68: 'rgba(11,42,74,0.68)',
  ivory72: 'rgba(11,42,74,0.72)',
  ivory78: 'rgba(11,42,74,0.78)',
};

export const gradients = {
  screen: [colors.canvas, colors.white],
  spotlight: [colors.navyMid, colors.navyDeep],
  gold: [colors.goldLight, colors.gold, colors.goldDark],
  goldButton: [colors.goldLight, colors.gold],
  navyButton: [colors.navyMid, colors.navy],
  card: [colors.white, colors.surfaceMuted],
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 24,
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
  tabBar: 120,
};

export const fonts = {
  display: 'Sora_700Bold',
  displaySemi: 'Sora_600SemiBold',
  displayRegular: 'Sora_400Regular',
  serif: 'Sora_700Bold',
  serifRegular: 'Sora_400Regular',
  serifSemiBold: 'Sora_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  sansExtraBold: 'Inter_800ExtraBold',
};

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42, color: colors.textPrimary },
  h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.textPrimary },
  h2: { fontFamily: fonts.displaySemi, fontSize: 26, lineHeight: 32, color: colors.textPrimary },
  h3: { fontFamily: fonts.displaySemi, fontSize: 22, lineHeight: 28, color: colors.textPrimary },
  h4: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 26, color: colors.textPrimary },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
  bodySmall: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.textMuted },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 13, lineHeight: 18, color: colors.textPrimary },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  eyebrow: {
    fontFamily: fonts.sansExtraBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.gold,
  },
  stat: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.textPrimary },
  button: { fontFamily: fonts.sansExtraBold, fontSize: 15, lineHeight: 20, color: colors.white },
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
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  fab: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  subtle: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const glass = {
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderWidth: 1,
};

export const cinematicScreen = {
  flex: 1,
  backgroundColor: colors.canvas,
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
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
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
    color: colors.navy,
    marginTop: spacing.lg,
  },
};

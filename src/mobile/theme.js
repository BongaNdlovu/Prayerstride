export const colors = {
  navy: '#071B33',
  navyDeep: '#040810',
  navyMid: '#0A2540',
  gold: '#D7A552',
  goldDark: '#B8862E',
  goldLight: '#E8C078',
  ivory: '#F7F0E4',
  stone: '#D8CBB8',
  ink: '#101014',
  sand: '#FBF7EF',
  white: '#FFFFFF',
  muted: '#8A9BB0',
  warm: '#E7D5BE',
  dusk: '#263A54',
  olive: '#778066',
  clay: '#B46E59',
  candle: '#F4C46A',
  success: '#4ADE80',
  urgent: '#EF4444',
  community: '#3B82F6',
  screen: '#080B13',
  screenAlt: '#0C1220',
};

export const alpha = {
  ivory10: 'rgba(247,240,228,0.10)',
  ivory11: 'rgba(247,240,228,0.11)',
  ivory12: 'rgba(247,240,228,0.12)',
  ivory16: 'rgba(247,240,228,0.16)',
  ivory20: 'rgba(247,240,228,0.20)',
  ivory55: 'rgba(247,240,228,0.55)',
  ivory58: 'rgba(247,240,228,0.58)',
  ivory62: 'rgba(247,240,228,0.62)',
  ivory68: 'rgba(247,240,228,0.68)',
  ivory72: 'rgba(247,240,228,0.72)',
  ivory78: 'rgba(247,240,228,0.78)',
  gold18: 'rgba(215,165,82,0.18)',
  gold22: 'rgba(215,165,82,0.22)',
  gold30: 'rgba(215,165,82,0.30)',
  overlay: 'rgba(8,11,19,0.66)',
  overlayLight: 'rgba(8,11,19,0.34)',
};

export const gradients = {
  screen: ['#0A1628', '#040810'],
  gold: ['#E8C078', '#D7A552', '#B8862E'],
  goldButton: ['#E8C078', '#D7A552'],
  card: ['rgba(247,240,228,0.14)', 'rgba(247,240,228,0.06)'],
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
  serif: 'PlayfairDisplay_700Bold',
  serifRegular: 'PlayfairDisplay_400Regular',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  sansExtraBold: 'Inter_800ExtraBold',
};

export const typography = {
  display: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 42, color: colors.ivory },
  h1: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 38, color: colors.ivory },
  h2: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, color: colors.ivory },
  h3: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 28, color: colors.ivory },
  h4: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, color: colors.ivory },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: alpha.ivory72 },
  bodySmall: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: alpha.ivory62 },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 13, lineHeight: 18, color: colors.ivory },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: alpha.ivory55 },
  eyebrow: {
    fontFamily: fonts.sansExtraBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.gold,
  },
  stat: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34, color: colors.ivory },
  button: { fontFamily: fonts.sansExtraBold, fontSize: 15, lineHeight: 20, color: colors.ink },
};

export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 6,
  },
  fab: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const glass = {
  backgroundColor: alpha.ivory11,
  borderColor: alpha.ivory16,
  borderWidth: 1,
};

export const cinematicScreen = {
  flex: 1,
  backgroundColor: colors.screen,
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
    borderColor: alpha.ivory16,
    backgroundColor: alpha.ivory10,
    paddingHorizontal: spacing.lg,
    color: colors.ivory,
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
    color: colors.gold,
    marginTop: spacing.lg,
  },
};

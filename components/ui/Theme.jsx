export const COLORS = {
  // Couleurs principales
  primary: '#2E8B57', // Vert forêt
  secondary: '#20B2AA', // Turquoise clair
  accent: '#98FB98', // Vert pâle

  // Arrière-plans
  background: '#1A1A1A',
  cardBackground: 'rgba(46, 139, 87, 0.3)',
  searchBg: 'rgba(255, 255, 255, 0.15)',
  buttonBg: 'rgba(152, 251, 152, 0.3)',

  // Texte
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',

  // Bordures et séparateurs
  divider: 'rgba(152, 251, 152, 0.2)',
  border: 'rgba(255, 255, 255, 0.1)',

  // États
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',

  // Badges
  wolofBadge: '#FFD700',

  // Gradients
  gradientStart: '#2E8B57',
  gradientEnd: '#20B2AA',
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 5,
  },
};

export const GRADIENTS = {
  primary: [COLORS.gradientStart, COLORS.gradientEnd],
  card: [COLORS.cardBackground, 'rgba(46, 139, 87, 0.1)'],
};

export const LAYOUT = {
  screenPadding: SPACING.md,
  cardPadding: SPACING.base,
  headerHeight: 56,
  bottomTabHeight: 60,
};
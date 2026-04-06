// Sonic Noir — Design System Tokens (Dark + Light)

export type ColorPalette = typeof DarkColors;

export const DarkColors = {
  background: '#0e0e0e',
  surface: '#0e0e0e',
  surfaceDim: '#0e0e0e',
  surfaceContainerLowest: '#000000',
  surfaceContainerLow: '#131313',
  surfaceContainer: '#1a1a1a',
  surfaceContainerHigh: '#20201f',
  surfaceContainerHighest: '#262626',
  surfaceBright: '#2c2c2c',
  surfaceVariant: '#262626',

  primary: '#de8eff',
  primaryContainer: '#d779ff',
  primaryDim: '#b90afc',
  onPrimary: '#4f006e',
  onPrimaryFixed: '#000000',

  secondary: '#00f4fe',
  secondaryContainer: '#00696e',
  secondaryDim: '#00e5ee',
  onSecondary: '#00575b',

  tertiary: '#ff8d87',
  tertiaryContainer: '#f97a74',
  onTertiary: '#62080e',

  error: '#ff6e84',
  errorContainer: '#a70138',
  onError: '#490013',

  onBackground: '#ffffff',
  onSurface: '#ffffff',
  onSurfaceVariant: '#adaaaa',
  outline: '#767575',
  outlineVariant: '#484847',

  inverseSurface: '#fcf9f8',
  inversePrimary: '#9900d1',

  // Mini player / tab bar
  tabBarBg: 'rgba(38, 38, 38, 0.85)',
  miniPlayerBg: 'rgba(26, 26, 26, 0.95)',
  statusBarStyle: 'light' as const,
};

export const LightColors: ColorPalette = {
  background: '#faf8fc',
  surface: '#faf8fc',
  surfaceDim: '#f0edf4',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f2f7',
  surfaceContainer: '#efedf3',
  surfaceContainerHigh: '#e9e7ee',
  surfaceContainerHighest: '#e3e1e8',
  surfaceBright: '#dddbe3',
  surfaceVariant: '#e7e0ec',

  primary: '#9900d1',
  primaryContainer: '#f3daff',
  primaryDim: '#7b2d9e',
  onPrimary: '#ffffff',
  onPrimaryFixed: '#ffffff',

  secondary: '#006970',
  secondaryContainer: '#9ef0f6',
  secondaryDim: '#004f54',
  onSecondary: '#ffffff',

  tertiary: '#8c1622',
  tertiaryContainer: '#ffdad9',
  onTertiary: '#ffffff',

  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',

  onBackground: '#1c1b1f',
  onSurface: '#1c1b1f',
  onSurfaceVariant: '#49454f',
  outline: '#7a757f',
  outlineVariant: '#cac4d0',

  inverseSurface: '#313033',
  inversePrimary: '#de8eff',

  tabBarBg: 'rgba(239, 237, 243, 0.92)',
  miniPlayerBg: 'rgba(245, 242, 247, 0.97)',
  statusBarStyle: 'dark' as const,
};

// Keep legacy export for files not yet migrated (fallback to dark)
export const Colors = DarkColors;

export const Fonts = {
  headlineFamily: 'PlusJakartaSans',
  bodyFamily: 'Manrope',
  headlineFallback: 'System',
  bodyFallback: 'System',
};

export const FontSizes = {
  displayLg: 57,
  displayMd: 45,
  displaySm: 36,
  headlineLg: 32,
  headlineMd: 28,
  headlineSm: 24,
  titleLg: 22,
  titleMd: 16,
  titleSm: 14,
  bodyLg: 16,
  bodyMd: 14,
  bodySm: 12,
  labelLg: 14,
  labelMd: 12,
  labelSm: 11,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const Radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

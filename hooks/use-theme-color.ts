import { useTheme } from '@/contexts/ThemeContext';

/**
 * Returns a themed color value. If explicit light/dark overrides are provided,
 * those take priority; otherwise falls back to the app's color palette.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: 'background' | 'text' | 'tint' | 'icon' | 'tabIconDefault' | 'tabIconSelected'
): string {
  const { colors, isDark } = useTheme();
  const override = isDark ? props.dark : props.light;

  if (override) return override;

  // Map standard Expo color names to the GIG palette
  switch (colorName) {
    case 'background':
      return colors.background;
    case 'text':
      return colors.onSurface;
    case 'tint':
      return colors.primary;
    case 'icon':
      return colors.onSurfaceVariant;
    case 'tabIconDefault':
      return colors.onSurfaceVariant;
    case 'tabIconSelected':
      return colors.primary;
    default:
      return colors.onSurface;
  }
}

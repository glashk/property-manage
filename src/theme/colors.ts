import { useColorScheme } from 'react-native';

export const light = {
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#666666',
  border: '#e0e0e0',
  primary: '#2563eb',
  primaryText: '#ffffff',
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  tapHighlight: '#e5e7eb',
};

export const dark = {
  background: '#0f0f0f',
  surface: '#1a1a1a',
  text: '#f5f5f5',
  textSecondary: '#a3a3a3',
  border: '#2a2a2a',
  primary: '#3b82f6',
  primaryText: '#ffffff',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  tapHighlight: '#262626',
};

export type ThemeColors = typeof light;

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

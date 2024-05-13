import type { Theme } from '@react-navigation/native';
import { DarkTheme as _DarkTheme } from '@react-navigation/native';

import colors from '@/ui/colors';

const DarkTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: colors.primary[200],
    background: colors.charcoal[950],
    text: colors.charcoal[100],
    border: colors.charcoal[500],
    card: colors.charcoal[850],
  },
};

export function useThemeConfig() {
  return DarkTheme;
}

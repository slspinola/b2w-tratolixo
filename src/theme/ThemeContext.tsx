import { createContext } from 'react';

export type ColorScheme = 'light' | 'dark';

export interface ThemeContextValue {
  colorScheme: ColorScheme;
  b2sOverride: boolean;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleB2S: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

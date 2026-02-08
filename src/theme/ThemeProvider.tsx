import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ThemeContext, type ColorScheme } from './ThemeContext.tsx';

const STORAGE_KEY_SCHEME = 'b2s-color-scheme';
const STORAGE_KEY_B2S = 'b2s-override';

function getInitialScheme(): ColorScheme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY_SCHEME);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
}

function getInitialB2S(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(STORAGE_KEY_B2S);
  if (stored === null) return true;
  return stored === 'true';
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getInitialScheme);
  const [b2sOverride, setB2sOverride] = useState<boolean>(getInitialB2S);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorScheme);
    localStorage.setItem(STORAGE_KEY_SCHEME, colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    if (b2sOverride) {
      document.documentElement.setAttribute('data-b2s', 'true');
    } else {
      document.documentElement.removeAttribute('data-b2s');
    }
    localStorage.setItem(STORAGE_KEY_B2S, String(b2sOverride));
  }, [b2sOverride]);

  const toggleColorScheme = useCallback(() => {
    setColorSchemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
  }, []);

  const toggleB2S = useCallback(() => {
    setB2sOverride((prev) => !prev);
  }, []);

  return (
    <ThemeContext value={{
      colorScheme,
      b2sOverride,
      toggleColorScheme,
      setColorScheme,
      toggleB2S,
    }}>
      {children}
    </ThemeContext>
  );
}

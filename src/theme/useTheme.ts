import { useContext } from 'react';
import { ThemeContext } from './ThemeContext.tsx';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      'useTheme must be used within a <ThemeProvider>. ' +
      'Wrap your application root with <ThemeProvider> to provide theme context.'
    );
  }
  return context;
}

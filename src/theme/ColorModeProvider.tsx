import { useColorScheme } from '@mui/material/styles';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import { applyThemeTokens, COLOR_MODE_STORAGE_KEY } from './applyThemeTokens';
import type { ColorMode } from './flowTheme';

type ColorModeContextValue = {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const { mode: muiMode, setMode: setMuiMode } = useColorScheme();
  const mode = (muiMode ?? 'dark') as ColorMode;

  useEffect(() => {
    applyThemeTokens(mode);
  }, [mode]);

  const setMode = (next: ColorMode) => {
    setMuiMode(next);
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
  };

  const value = useMemo(
    () => ({ mode, setMode }),
    [mode, setMuiMode],
  );

  return (
    <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
  );
}

export function useAppColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error('useAppColorMode must be used within ColorModeProvider');
  }
  return ctx;
}

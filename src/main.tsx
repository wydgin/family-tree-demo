import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyThemeTokens, COLOR_MODE_STORAGE_KEY } from './theme/applyThemeTokens';
import './styles.css';

const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
const initialMode =
  stored === 'light' || stored === 'dark' ? stored : 'dark';
applyThemeTokens(initialMode);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InitColorSchemeScript
      defaultMode="dark"
      modeStorageKey={COLOR_MODE_STORAGE_KEY}
      attribute="data-mui-color-scheme"
    />
    <App />
  </StrictMode>,
);

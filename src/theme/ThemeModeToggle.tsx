import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';

import { useAppColorMode } from './ColorModeProvider';

/** Compact icon toggle — sits beside the pill nav like SaasAble header actions */
export function ThemeModeToggle() {
  const { mode, setMode } = useAppColorMode();
  const theme = useTheme();
  const isDark = mode === 'dark';

  return (
    <Stack
      direction="row"
      role="group"
      aria-label="Color mode"
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'grey.200',
        p: 0.25,
        gap: 0,
      }}
    >
      <Tooltip title="Light mode">
        <IconButton
          size="small"
          onClick={() => setMode('light')}
          aria-label="Light mode"
          aria-pressed={mode === 'light'}
          sx={{
            borderRadius: 1.5,
            color: !isDark ? 'primary.main' : 'grey.800',
            bgcolor: !isDark ? alpha(theme.palette.primary.main, 0.18) : 'transparent',
          }}
        >
          <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Dark mode">
        <IconButton
          size="small"
          onClick={() => setMode('dark')}
          aria-label="Dark mode"
          aria-pressed={mode === 'dark'}
          sx={{
            borderRadius: 1.5,
            color: isDark ? 'primary.main' : 'text.secondary',
            bgcolor: isDark ? alpha(theme.palette.primary.main, 0.18) : 'transparent',
          }}
        >
          <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

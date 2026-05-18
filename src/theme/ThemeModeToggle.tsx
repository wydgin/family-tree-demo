import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useAppColorMode } from './ColorModeProvider';

export function ThemeModeToggle() {
  const { mode, setMode } = useAppColorMode();

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={mode}
      onChange={(_, value) => {
        if (value === 'light' || value === 'dark') setMode(value);
      }}
      aria-label="Color mode"
    >
      <ToggleButton value="light" aria-label="Light mode">
        <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
      </ToggleButton>
      <ToggleButton value="dark" aria-label="Dark mode">
        <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

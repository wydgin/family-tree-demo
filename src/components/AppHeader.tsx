import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import type { LayoutMode } from '../layouts/positions';
import { useAppColorMode } from '../theme/ColorModeProvider';
import { ThemeModeToggle } from '../theme/ThemeModeToggle';
import { PillNavGroup } from './PillNavGroup';

const LAYOUT_ITEMS = [
  { value: 'strict' as const, label: 'Strict' },
  { value: 'web' as const, label: 'Web' },
  { value: 'spatial' as const, label: 'Spatial' },
];

export type AppHeaderProps = {
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  nodesLocked: boolean;
  onToggleLock: () => void;
};

export function AppHeader({
  layoutMode,
  onLayoutChange,
  nodesLocked,
  onToggleLock,
}: AppHeaderProps) {
  const theme = useTheme();
  const { mode } = useAppColorMode();
  const isDark = mode === 'dark';

  const dotColor = alpha(
    isDark ? theme.palette.common.white : theme.palette.common.black,
    isDark ? 0.14 : 0.1,
  );

  return (
    <AppBar
      position="static"
      elevation={0}
      color="default"
      sx={{
        zIndex: 1200,
        flexShrink: 0,
        bgcolor: 'background.default',
        color: 'text.primary',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >
      <Toolbar
        sx={{
          gap: { xs: 1.5, md: 2 },
          flexWrap: 'wrap',
          py: { xs: 1.25, md: 1.75 },
          px: { xs: 2, md: 3 },
          minHeight: { xs: 64, md: 72 },
          color: 'inherit',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
              color: 'primary.main',
            }}
          >
            <AccountTreeOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" component="h1" sx={{ lineHeight: 1.25, color: 'inherit' }}>
            Manlutac-Galfo family tree
          </Typography>
        </Stack>

        <PillNavGroup
          aria-label="Layout mode"
          value={layoutMode}
          items={LAYOUT_ITEMS}
          onChange={onLayoutChange}
        />

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: { xs: 'auto', md: 0 } }}>
          {layoutMode === 'web' && (
            <Tooltip title={nodesLocked ? 'Unlock nodes (allow drag)' : 'Lock nodes'}>
              <IconButton
                size="small"
                color={nodesLocked ? 'primary' : 'inherit'}
                onClick={onToggleLock}
                aria-label={nodesLocked ? 'Unlock nodes' : 'Lock nodes'}
                aria-pressed={nodesLocked}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'grey.200',
                  color: 'text.primary',
                }}
              >
                {nodesLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          <ThemeModeToggle />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

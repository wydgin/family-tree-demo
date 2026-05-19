import type { ReactNode } from 'react';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import type { LayoutMode } from '../layouts/positions';
import { APP_TABS, type AppTab } from '../navigation/appTabs';
import { useAppColorMode } from '../theme/ColorModeProvider';
import { ThemeModeToggle } from '../theme/ThemeModeToggle';
import { PillNavGroup } from './PillNavGroup';

const LAYOUT_ITEMS = [
  { value: 'strict' as const, label: 'Strict' },
  { value: 'web' as const, label: 'Web' },
  { value: 'spatial' as const, label: 'Spatial' },
];

const TAB_ICONS: Record<AppTab, ReactNode> = {
  tree: <AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />,
  map: <MapOutlinedIcon sx={{ fontSize: 18 }} />,
  insights: <InsightsOutlinedIcon sx={{ fontSize: 18 }} />,
};

export type AppHeaderProps = {
  appTab: AppTab;
  onAppTabChange: (tab: AppTab) => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  nodesLocked: boolean;
  onToggleLock: () => void;
};

export function AppHeader({
  appTab,
  onAppTabChange,
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
          py: { xs: 1.25, md: 1.5 },
          px: { xs: 2, md: 3 },
          minHeight: { xs: 56, md: 64 },
          color: 'inherit',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ flex: { xs: '1 1 100%', md: '0 0 auto' }, minWidth: 0 }}
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
          <Typography
            variant="h6"
            component="h1"
            sx={{ lineHeight: 1.25, color: 'inherit', fontSize: { xs: '1rem', sm: '1.15rem' } }}
          >
            Manlutac-Galfo family tree
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: { xs: 0, md: 'auto' } }}>
          <ThemeModeToggle />
        </Stack>
      </Toolbar>

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pb: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={0.5} role="tablist" aria-label="Main sections">
          {APP_TABS.map((tab) => {
            const selected = appTab === tab.value;
            return (
              <Box
                key={tab.value}
                component="button"
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onAppTabChange(tab.value)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 2,
                  py: 1,
                  border: 'none',
                  borderRadius: 2,
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: selected ? 600 : 500,
                  color: selected ? 'primary.main' : 'text.secondary',
                  bgcolor: selected
                    ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1)
                    : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06),
                  },
                }}
              >
                {TAB_ICONS[tab.value]}
                {tab.label}
              </Box>
            );
          })}
        </Stack>

        {appTab === 'tree' ? (
          <>
            <PillNavGroup
              aria-label="Layout mode"
              value={layoutMode}
              items={LAYOUT_ITEMS}
              onChange={onLayoutChange}
            />
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
          </>
        ) : null}
      </Box>
    </AppBar>
  );
}

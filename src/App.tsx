import { lazy, Suspense, useCallback, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import { ThemeProvider } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';

import { initialEdges, initialNodes } from './data/familyTree';
import { strictEdges, strictNodes } from './data/strictFamilyTree';
import { FamilyTreeFlow } from './flow/FamilyTreeFlow';
import type { LayoutMode } from './layouts/positions';
import { COLOR_MODE_STORAGE_KEY } from './theme/applyThemeTokens';
import { ColorModeProvider } from './theme/ColorModeProvider';
import { saasableTheme } from './theme/saasableTheme';
import { ThemeModeToggle } from './theme/ThemeModeToggle';

const FamilyTreeSpatial = lazy(() =>
  import('./spatial/FamilyTreeSpatial').then((m) => ({
    default: m.FamilyTreeSpatial,
  })),
);

function AppShell() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('web');

  const onLayoutChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, value: LayoutMode | null) => {
      if (value) setLayoutMode(value);
    },
    [],
  );

  const flowKey = layoutMode === 'web' ? 'web' : 'strict';

  return (
    <>
      <CssBaseline enableColorScheme />
      <Box className="app">
        <AppBar position="static" elevation={0} sx={{ zIndex: 1200, flexShrink: 0 }}>
          <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 200 }}>
              <AccountTreeOutlinedIcon color="primary" />
              <Box>
                <Typography variant="h6" component="h1" color="text.primary">
                  Family Tree
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {layoutMode === 'strict'
                    ? 'Generational rows · step edges · click for immediate family'
                    : layoutMode === 'web'
                      ? 'Flower layout · radial ring per family hub'
                      : 'Drag to orbit · scroll to zoom'}
                </Typography>
              </Box>
            </Stack>
            <ThemeModeToggle />
            <ToggleButtonGroup
              exclusive
              size="small"
              value={layoutMode}
              onChange={onLayoutChange}
              aria-label="Layout mode"
            >
              <ToggleButton value="strict">Strict</ToggleButton>
              <ToggleButton value="web">Web</ToggleButton>
              <ToggleButton value="spatial">Spatial</ToggleButton>
            </ToggleButtonGroup>
            {layoutMode === 'spatial' && (
              <Chip size="small" label="Drag to orbit · scroll to zoom" variant="outlined" />
            )}
          </Toolbar>
        </AppBar>
        <Box className="flow-panel">
          {layoutMode === 'spatial' ? (
            <Box sx={{ width: '100%', height: '100%' }}>
              <Suspense
                fallback={
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.default',
                    }}
                  >
                    <CircularProgress size={28} />
                  </Box>
                }
              >
                <FamilyTreeSpatial />
              </Suspense>
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: '100%' }}>
              <ReactFlowProvider key={flowKey}>
                <FamilyTreeFlow
                  initialNodes={layoutMode === 'strict' ? strictNodes : initialNodes}
                  initialEdges={layoutMode === 'strict' ? strictEdges : initialEdges}
                  nodesDraggable={layoutMode === 'web'}
                  fitPadding={layoutMode === 'strict' ? 0.08 : 0.22}
                  focusMode="immediate"
                  edgeType={layoutMode === 'strict' ? 'step' : 'default'}
                  flowerLayout={layoutMode === 'web'}
                />
              </ReactFlowProvider>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider
      theme={saasableTheme}
      defaultMode="dark"
      modeStorageKey={COLOR_MODE_STORAGE_KEY}
    >
      <ColorModeProvider>
        <AppShell />
      </ColorModeProvider>
    </ThemeProvider>
  );
}

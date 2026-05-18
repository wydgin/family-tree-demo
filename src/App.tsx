import { lazy, Suspense, useCallback, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';

import { AppHeader } from './components/AppHeader';
import { initialEdges, initialNodes } from './data/familyTree';
import { strictEdges, strictNodes } from './data/strictFamilyTree';
import { FamilyTreeFlow } from './flow/FamilyTreeFlow';
import { loadLockState, saveLockState } from './flow/nodePositionStorage';
import type { LayoutMode } from './layouts/positions';
import { COLOR_MODE_STORAGE_KEY } from './theme/applyThemeTokens';
import { ColorModeProvider } from './theme/ColorModeProvider';
import { saasableTheme } from './theme/saasableTheme';

const FamilyTreeSpatial = lazy(() =>
  import('./spatial/FamilyTreeSpatial').then((m) => ({
    default: m.FamilyTreeSpatial,
  })),
);

function AppShell() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('web');
  const [nodesLocked, setNodesLocked] = useState(() => loadLockState());

  const onLayoutChange = useCallback((value: LayoutMode) => {
    setLayoutMode(value);
  }, []);

  const toggleNodesLocked = useCallback(() => {
    setNodesLocked((prev) => {
      const next = !prev;
      saveLockState(next);
      return next;
    });
  }, []);

  const flowKey = layoutMode === 'web' ? 'web' : 'strict';

  return (
    <>
      <CssBaseline enableColorScheme />
      <Box className="app">
        <AppHeader
          layoutMode={layoutMode}
          onLayoutChange={onLayoutChange}
          nodesLocked={nodesLocked}
          onToggleLock={toggleNodesLocked}
        />
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
                  nodesDraggable={layoutMode === 'web' && !nodesLocked}
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

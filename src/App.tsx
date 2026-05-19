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
import { ProfileSidebar } from './components/ProfileSidebar';
import { initialEdges, initialNodes } from './data/familyTree';
import { strictEdges, strictNodes } from './data/strictFamilyTree';
import { FamilyTreeFlow } from './flow/FamilyTreeFlow';
import { loadLockState, saveLockState } from './flow/nodePositionStorage';
import type { LayoutMode } from './layouts/positions';
import type { AppTab } from './navigation/appTabs';
import { COLOR_MODE_STORAGE_KEY } from './theme/applyThemeTokens';
import { ColorModeProvider } from './theme/ColorModeProvider';
import { saasableTheme } from './theme/saasableTheme';
import { InsightsView } from './views/InsightsView';

const FamilyTreeSpatial = lazy(() =>
  import('./spatial/FamilyTreeSpatial').then((m) => ({
    default: m.FamilyTreeSpatial,
  })),
);

const FamilyMigrationMap = lazy(() =>
  import('./components/FamilyMigrationMap').then((m) => ({
    default: m.FamilyMigrationMap,
  })),
);

function AppShell() {
  const [appTab, setAppTab] = useState<AppTab>('tree');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('web');
  const [nodesLocked, setNodesLocked] = useState(() => loadLockState());
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const onAppTabChange = useCallback((tab: AppTab) => {
    setAppTab(tab);
    if (tab !== 'tree') setSelectedPersonId(null);
  }, []);

  const onLayoutChange = useCallback((value: LayoutMode) => {
    setLayoutMode(value);
    setSelectedPersonId(null);
  }, []);

  const toggleNodesLocked = useCallback(() => {
    setNodesLocked((prev) => {
      const next = !prev;
      saveLockState(next);
      return next;
    });
  }, []);

  const flowKey = layoutMode === 'web' ? 'web' : 'strict';
  const showProfileSidebar = selectedPersonId && (appTab === 'tree' || appTab === 'map');

  return (
    <>
      <CssBaseline enableColorScheme />
      <Box className="app">
        <AppHeader
          appTab={appTab}
          onAppTabChange={onAppTabChange}
          layoutMode={layoutMode}
          onLayoutChange={onLayoutChange}
          nodesLocked={nodesLocked}
          onToggleLock={toggleNodesLocked}
        />
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Box className="flow-panel" sx={{ flex: 1, minWidth: 0 }}>
            {appTab === 'tree' ? (
              layoutMode === 'spatial' ? (
                <Suspense
                  fallback={
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CircularProgress size={28} />
                    </Box>
                  }
                >
                  <FamilyTreeSpatial
                    selectedPersonId={selectedPersonId}
                    onSelectPerson={setSelectedPersonId}
                  />
                </Suspense>
              ) : (
                <ReactFlowProvider key={flowKey}>
                  <FamilyTreeFlow
                    initialNodes={layoutMode === 'strict' ? strictNodes : initialNodes}
                    initialEdges={layoutMode === 'strict' ? strictEdges : initialEdges}
                    nodesDraggable={layoutMode === 'web' && !nodesLocked}
                    fitPadding={layoutMode === 'strict' ? 0.08 : 0.22}
                    focusMode="immediate"
                    edgeType={layoutMode === 'strict' ? 'step' : 'default'}
                    flowerLayout={layoutMode === 'web'}
                    selectedPersonId={selectedPersonId}
                    onSelectPerson={setSelectedPersonId}
                  />
                </ReactFlowProvider>
              )
            ) : appTab === 'map' ? (
              <Suspense
                fallback={
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={28} />
                  </Box>
                }
              >
                <FamilyMigrationMap
                  onSelectPerson={(id) => {
                    setSelectedPersonId(id);
                  }}
                />
              </Suspense>
            ) : (
              <InsightsView />
            )}
          </Box>
          {showProfileSidebar ? (
            <ProfileSidebar
              personId={selectedPersonId}
              onClose={() => setSelectedPersonId(null)}
            />
          ) : null}
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

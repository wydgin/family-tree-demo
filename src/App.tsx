import { useCallback, useEffect, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
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
import { layoutPositions, type LayoutMode } from './layouts/positions';
import { ConnectorNode } from './nodes/ConnectorNode';
import { PersonNode } from './nodes/PersonNode';
import { saasableTheme } from './theme/saasableTheme';

const nodeTypes = {
  person: PersonNode,
  connector: ConnectorNode,
};

function FamilyTreeFlow({ layoutMode }: { layoutMode: LayoutMode }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const positions = layoutPositions[layoutMode];
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        position: positions[node.id] ?? node.position,
      })),
    );
    requestAnimationFrame(() => {
      fitView({ padding: layoutMode === 'spatial' ? 0.25 : 0.35, duration: 400 });
    });
  }, [layoutMode, setNodes, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      colorMode="dark"
      fitView
      fitViewOptions={{ padding: layoutMode === 'spatial' ? 0.25 : 0.35 }}
      minZoom={0.35}
      maxZoom={1.8}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2e3038" />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(node) =>
          node.type === 'connector' ? '#f472b6' : '#43455f'
        }
        maskColor="rgb(0 0 0 / 70%)"
      />
    </ReactFlow>
  );
}

export default function App() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('web');

  const onLayoutChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, value: LayoutMode | null) => {
      if (value) setLayoutMode(value);
    },
    [],
  );

  return (
    <ThemeProvider theme={saasableTheme} defaultMode="dark">
      <CssBaseline />
      <Box className="app" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <AppBar position="static" elevation={0} color="transparent">
          <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 200 }}>
              <AccountTreeOutlinedIcon color="primary" />
              <Box>
                <Typography variant="h6" component="h1">
                  Family Tree
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  SaasAble UI · connector hubs · animated branches
                </Typography>
              </Box>
            </Stack>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={layoutMode}
              onChange={onLayoutChange}
              aria-label="Layout mode"
            >
              <ToggleButton value="web">Web</ToggleButton>
              <ToggleButton value="spatial">Spatial</ToggleButton>
            </ToggleButtonGroup>
          </Toolbar>
        </AppBar>
        <Box className="flow-panel" sx={{ flex: 1, minHeight: 0 }}>
          <ReactFlowProvider>
            <FamilyTreeFlow layoutMode={layoutMode} />
          </ReactFlowProvider>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

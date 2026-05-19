import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { dimmedEdgeStyle, focusEdgeStyle } from '../data/edgeStyles';
import { FloatingFamilyEdge } from '../edges/FloatingFamilyEdge';
import { useFlowerLayout } from '../layouts/useFlowerLayout';
import {
  loadSavedPositions,
  mergeSavedPositions,
  saveNodePositions,
  WEB_POSITIONS_KEY,
} from './nodePositionStorage';
import { RefreshNodeInternals } from './RefreshNodeInternals';
import type { ConnectorNodeData } from '../nodes/ConnectorNode';
import { ConnectorNode } from '../nodes/ConnectorNode';
import type { PersonNodeData } from '../nodes/PersonNode';
import { PersonNode } from '../nodes/PersonNode';
import { useAppColorMode } from '../theme/ColorModeProvider';
import { flowTheme } from '../theme/flowTheme';
import { getAncestryPath, getImmediateFamily } from '../utils/focusGraph';

export type FocusMode = 'immediate' | 'lineage';

const nodeTypes = {
  person: PersonNode,
  connector: ConnectorNode,
};

const edgeTypes = {
  floating: FloatingFamilyEdge,
};

type TreeNode = Node<PersonNodeData | ConnectorNodeData>;

export type FlowEdgeType = 'default' | 'step';

export type FamilyTreeFlowProps = {
  initialNodes: TreeNode[];
  initialEdges: Edge[];
  nodesDraggable?: boolean;
  fitPadding?: number;
  focusMode?: FocusMode;
  edgeType?: FlowEdgeType;
  /** ELK radial ring on each connector hub, branching outward per family. */
  flowerLayout?: boolean;
  /** localStorage key for remembering dragged node positions */
  positionsStorageKey?: string;
  selectedPersonId?: string | null;
  onSelectPerson?: (personId: string | null) => void;
  /** Show save-layout control (owner edit session only). */
  allowLayoutSave?: boolean;
};

function withThemedBranchEdges(edges: Edge[], branchColor: string): Edge[] {
  return edges.map((e) => {
    if ((e.data as { kind?: string })?.kind !== 'branch') return e;
    return { ...e, style: { ...e.style, stroke: branchColor } };
  });
}

function applyFocusState(
  nodes: TreeNode[],
  edges: Edge[],
  selectedId: string | null,
  branchColor: string,
  focusMode: FocusMode,
): { nodes: TreeNode[]; edges: Edge[] } {
  if (!selectedId) {
    return {
      nodes: nodes.map((n) => ({
        ...n,
        data: { ...n.data, selected: false, focused: false, dimmed: false },
      })),
      edges: edges.map((e) => ({
        ...e,
        animated: true,
        style: { ...e.style, opacity: 1 },
      })),
    };
  }

  const { nodeIds, edgeIds } =
    focusMode === 'lineage'
      ? getAncestryPath(selectedId, nodes, edges)
      : getImmediateFamily(selectedId, nodes, edges);

  const nextNodes = nodes.map((n) => {
    const inFamily = nodeIds.has(n.id);
    return {
      ...n,
      data: {
        ...n.data,
        selected: n.id === selectedId,
        focused: inFamily && n.id !== selectedId,
        dimmed: !inFamily,
      },
    };
  });

  const nextEdges = edges.map((e) => {
    const active = edgeIds.has(e.id);
    const base = { ...e.style };
    if (active) {
      return {
        ...e,
        animated: true,
        style: { ...base, ...focusEdgeStyle },
      };
    }
    const kind = (e.data as { kind?: string })?.kind;
    return {
      ...e,
      animated: false,
      style: {
        ...base,
        ...dimmedEdgeStyle,
        stroke: kind === 'branch' ? branchColor : base.stroke,
      },
    };
  });

  return { nodes: nextNodes, edges: nextEdges };
}

function FlowerLayoutRunner({
  initialNodes,
  initialEdges,
  fitPadding,
  positionsStorageKey,
  setNodes,
  setEdges,
}: {
  initialNodes: TreeNode[];
  initialEdges: Edge[];
  fitPadding: number;
  positionsStorageKey?: string;
  setNodes: ReturnType<typeof useNodesState<TreeNode>>[1];
  setEdges: ReturnType<typeof useEdgesState>[1];
}) {
  const { fitView } = useReactFlow();
  const { ready, error, revision } = useFlowerLayout(
    initialNodes,
    initialEdges,
    true,
    setNodes,
    setEdges,
    fitView,
    fitPadding,
    positionsStorageKey,
  );

  if (error) {
    return (
      <Panel position="top-center">
        <Alert severity="error">{error}</Alert>
      </Panel>
    );
  }

  if (!ready) {
    return (
      <Panel position="top-center">
        <CircularProgress size={28} />
      </Panel>
    );
  }

  return <RefreshNodeInternals revision={revision} />;
}

function PersistNodePositions({ storageKey }: { storageKey: string }) {
  const { getNodes } = useReactFlow();

  const persist = useCallback(() => {
    saveNodePositions(getNodes(), storageKey);
  }, [getNodes, storageKey]);

  useEffect(() => {
    const onUp = () => persist();
    window.addEventListener('pointerup', onUp);
    return () => window.removeEventListener('pointerup', onUp);
  }, [persist]);

  return null;
}

function SaveLayoutPanel({ storageKey }: { storageKey: string }) {
  const { getNodes } = useReactFlow();
  const [saved, setSaved] = useState(false);

  const onSave = useCallback(() => {
    saveNodePositions(getNodes(), storageKey);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }, [getNodes, storageKey]);

  return (
    <Panel position="top-left">
      <Button
        variant="contained"
        size="small"
        color={saved ? 'success' : 'primary'}
        startIcon={<SaveOutlinedIcon />}
        onClick={onSave}
        sx={{
          boxShadow: 2,
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        {saved ? 'Layout saved' : 'Save layout'}
      </Button>
    </Panel>
  );
}

export function FamilyTreeFlow({
  initialNodes,
  initialEdges,
  nodesDraggable = true,
  fitPadding = 0.35,
  focusMode = 'immediate',
  edgeType = 'default',
  flowerLayout = false,
  positionsStorageKey = WEB_POSITIONS_KEY,
  selectedPersonId,
  onSelectPerson,
  allowLayoutSave = false,
}: FamilyTreeFlowProps) {
  const { mode } = useAppColorMode();
  const savedPositions = useMemo(
    () => (positionsStorageKey ? loadSavedPositions(positionsStorageKey) : null),
    [positionsStorageKey],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(
    mergeSavedPositions(initialNodes, savedPositions),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const selectedId = selectedPersonId !== undefined ? selectedPersonId : internalSelectedId;
  const setSelectedId = onSelectPerson ?? setInternalSelectedId;
  const saveTimer = useRef<number | null>(null);
  const tokens = flowTheme[mode];

  const handleNodesChange = useCallback(
    (changes: NodeChange<TreeNode>[]) => {
      onNodesChange(changes);
      if (!positionsStorageKey || !nodesDraggable) return;
      const moved = changes.some((c) => c.type === 'position' && c.dragging);
      if (!moved) return;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        setNodes((current) => {
          saveNodePositions(current, positionsStorageKey);
          return current;
        });
      }, 400);
    },
    [onNodesChange, positionsStorageKey, nodesDraggable, setNodes],
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: Node, currentNodes: Node[]) => {
      if (positionsStorageKey) {
        saveNodePositions(currentNodes, positionsStorageKey);
      }
    },
    [positionsStorageKey],
  );

  const themedEdges = useMemo(
    () => withThemedBranchEdges(edges, tokens.branchStroke),
    [edges, tokens.branchStroke],
  );

  const { nodes: displayNodes, edges: displayEdges } = useMemo(
    () =>
      applyFocusState(nodes, themedEdges, selectedId, tokens.branchStroke, focusMode),
    [nodes, themedEdges, selectedId, tokens.branchStroke, focusMode],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'connector') return;
      setSelectedId(selectedId === node.id ? null : node.id);
    },
    [selectedId, setSelectedId],
  );

  const onPaneClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <ReactFlow
      nodes={displayNodes}
      edges={displayEdges}
      onNodesChange={handleNodesChange}
      onNodeDragStop={onNodeDragStop}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeType === 'step' ? undefined : edgeTypes}
      colorMode={mode}
      style={{ width: '100%', height: '100%' }}
      minZoom={0.04}
      maxZoom={2.5}
      nodesDraggable={nodesDraggable}
      nodesConnectable={false}
      elementsSelectable={false}
      defaultEdgeOptions={
        edgeType === 'step' ? { type: 'step' } : { type: 'floating' }
      }
      proOptions={{ hideAttribution: true }}
    >
      {flowerLayout && (
        <FlowerLayoutRunner
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          fitPadding={fitPadding}
          positionsStorageKey={positionsStorageKey}
          setNodes={setNodes}
          setEdges={setEdges}
        />
      )}
      {positionsStorageKey && nodesDraggable && allowLayoutSave ? (
        <SaveLayoutPanel storageKey={positionsStorageKey} />
      ) : null}
      {positionsStorageKey && nodesDraggable ? (
        <PersistNodePositions storageKey={positionsStorageKey} />
      ) : null}
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color={tokens.dotColor}
        bgColor={tokens.flowBg}
      />
      <Controls position="bottom-left" showZoom showFitView showInteractive={false} />
      <MiniMap
        nodeColor={(node) =>
          node.type === 'connector' ? tokens.branchStroke : tokens.minimapNode
        }
        maskColor={tokens.minimapMask}
      />
    </ReactFlow>
  );
}

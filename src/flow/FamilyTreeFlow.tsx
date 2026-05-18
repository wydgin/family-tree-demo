import { useCallback, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from '@xyflow/react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { dimmedEdgeStyle, focusEdgeStyle } from '../data/edgeStyles';
import { FloatingFamilyEdge } from '../edges/FloatingFamilyEdge';
import { useFlowerLayout } from '../layouts/useFlowerLayout';
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
        animated: e.animated ?? true,
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
}: {
  initialNodes: TreeNode[];
  initialEdges: Edge[];
  fitPadding: number;
}) {
  const { ready, error, revision } = useFlowerLayout(
    initialNodes,
    initialEdges,
    true,
    fitPadding,
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

export function FamilyTreeFlow({
  initialNodes,
  initialEdges,
  nodesDraggable = true,
  fitPadding = 0.35,
  focusMode = 'immediate',
  edgeType = 'default',
  flowerLayout = false,
}: FamilyTreeFlowProps) {
  const { mode } = useAppColorMode();
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tokens = flowTheme[mode];

  const themedEdges = useMemo(
    () => withThemedBranchEdges(edges, tokens.branchStroke),
    [edges, tokens.branchStroke],
  );

  const { nodes: displayNodes, edges: displayEdges } = useMemo(
    () =>
      applyFocusState(nodes, themedEdges, selectedId, tokens.branchStroke, focusMode),
    [nodes, themedEdges, selectedId, tokens.branchStroke, focusMode],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'connector') return;
    setSelectedId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <ReactFlow
      nodes={displayNodes}
      edges={displayEdges}
      onNodesChange={onNodesChange}
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
        />
      )}
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

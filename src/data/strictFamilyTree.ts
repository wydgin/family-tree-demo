import type { Edge, Node } from '@xyflow/react';
import type { ConnectorNodeData } from '../nodes/ConnectorNode';
import type { PersonNodeData } from '../nodes/PersonNode';
import { layoutStrictTree } from '../layouts/strictLayout';
import { rawEdges, rawNodes } from './buildFamilyGraph';

const layoutNodes: Node<PersonNodeData | ConnectorNodeData>[] = rawNodes.map((n) => ({
  ...n,
  position: { x: 0, y: 0 },
}));

export const strictEdges: Edge[] = rawEdges.map((e) => ({
  ...e,
  type: 'step',
}));

export const strictNodes = layoutStrictTree(layoutNodes, strictEdges);

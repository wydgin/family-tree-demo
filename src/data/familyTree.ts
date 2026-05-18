import { Position, type Edge, type Node } from '@xyflow/react';
import type { ConnectorNodeData } from '../nodes/ConnectorNode';
import type { PersonNodeData } from '../nodes/PersonNode';
import { webPositions } from '../layouts/positions';

/** Branch / parent lines (animated) */
const pinkEdge = {
  stroke: '#f472b6',
  strokeWidth: 3.5,
};

/** Sibling / secondary lines */
const greyEdge = {
  stroke: '#6b7280',
  strokeWidth: 2.5,
};

const faintEdge = {
  stroke: '#374151',
  strokeWidth: 2,
  opacity: 0.5,
};

const flowDown = {
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top,
};

const flowRight = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

export const initialNodes: Node<PersonNodeData | ConnectorNodeData>[] = [
  {
    id: 'auntie-4',
    type: 'person',
    position: webPositions['auntie-4'],
    data: { label: 'Auntie 4' },
    ...flowRight,
  },
  {
    id: 'mother',
    type: 'person',
    position: webPositions.mother,
    data: { label: 'Mother', highlighted: true },
    ...flowDown,
  },
  {
    id: 'father',
    type: 'person',
    position: webPositions.father,
    data: { label: 'Father' },
    ...flowDown,
  },
  {
    id: 'hub-parents',
    type: 'connector',
    position: webPositions['hub-parents'],
    data: { variant: 'primary' },
    ...flowDown,
  },
  {
    id: 'me',
    type: 'person',
    position: webPositions.me,
    data: { label: 'Me' },
    ...flowDown,
  },
  {
    id: 'brother-1',
    type: 'person',
    position: webPositions['brother-1'],
    data: { label: 'Brother 1' },
    ...flowDown,
  },
  {
    id: 'brother-2',
    type: 'person',
    position: webPositions['brother-2'],
    data: { label: 'Brother 2' },
    ...flowDown,
  },
  {
    id: 'hub-brother-2',
    type: 'connector',
    position: webPositions['hub-brother-2'],
    data: { variant: 'branch' },
    ...flowDown,
  },
  {
    id: 'sister-in-law',
    type: 'person',
    position: webPositions['sister-in-law'],
    data: { label: 'Sister in Law' },
    ...flowRight,
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'mother-hub',
    source: 'mother',
    target: 'hub-parents',
    animated: true,
    style: pinkEdge,
  },
  {
    id: 'father-hub',
    source: 'father',
    target: 'hub-parents',
    animated: true,
    style: pinkEdge,
  },
  {
    id: 'hub-me',
    source: 'hub-parents',
    target: 'me',
    style: greyEdge,
  },
  {
    id: 'hub-brother-1',
    source: 'hub-parents',
    target: 'brother-1',
    style: greyEdge,
  },
  {
    id: 'hub-brother-2',
    source: 'hub-parents',
    target: 'brother-2',
    style: greyEdge,
  },
  {
    id: 'brother-2-branch-hub',
    source: 'brother-2',
    target: 'hub-brother-2',
    animated: true,
    style: pinkEdge,
  },
  {
    id: 'branch-hub-sil',
    source: 'hub-brother-2',
    target: 'sister-in-law',
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: true,
    style: pinkEdge,
  },
  {
    id: 'mother-auntie-hint',
    source: 'auntie-4',
    target: 'mother',
    style: faintEdge,
  },
];

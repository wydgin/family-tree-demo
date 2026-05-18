import ELK from 'elkjs/lib/elk.bundled.js';
import type { Edge, Node } from '@xyflow/react';

const elk = new ELK();

export const PERSON_W = 148;
export const PERSON_H = 46;
export const CONNECTOR_SIZE = 28;

export type ElkLayoutPreset = 'radial' | 'force' | 'layered-down' | 'layered-right';

const BASE_SPACING = {
  'elk.spacing.nodeNode': '72',
  'elk.padding': '[top=40,left=40,bottom=40,right=40]',
};

export function elkLayoutOptions(preset: ElkLayoutPreset): Record<string, string> {
  switch (preset) {
    case 'radial':
      return {
        ...BASE_SPACING,
        'elk.algorithm': 'org.eclipse.elk.radial',
        'elk.radial.compactor': 'WEDGE_COMPACTION',
        'elk.radial.radius': '220',
      };
    case 'force':
      return {
        ...BASE_SPACING,
        'elk.algorithm': 'org.eclipse.elk.force',
        'elk.force.iterations': '600',
      };
    case 'layered-down':
      return {
        ...BASE_SPACING,
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      };
    case 'layered-right':
      return {
        ...BASE_SPACING,
        'elk.algorithm': 'layered',
        'elk.direction': 'RIGHT',
        'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      };
  }
}

export function nodeDimensions(node: Node): { width: number; height: number } {
  if (node.type === 'connector') {
    return { width: CONNECTOR_SIZE, height: CONNECTOR_SIZE };
  }
  const w = node.measured?.width;
  const h = node.measured?.height;
  return {
    width: typeof w === 'number' && w > 0 ? w : PERSON_W,
    height: typeof h === 'number' && h > 0 ? h : PERSON_H,
  };
}

type ElkNode = {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

/** Run ELK on the current graph and return nodes with updated positions. */
export async function layoutWithElk<T extends Node>(
  nodes: T[],
  edges: Edge[],
  preset: ElkLayoutPreset = 'radial',
): Promise<T[]> {
  const layoutOptions = elkLayoutOptions(preset);

  const graph = {
    id: 'root',
    layoutOptions,
    children: nodes.map((node) => {
      const { width, height } = nodeDimensions(node);
      return { id: node.id, width, height };
    }),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layouted = await elk.layout(graph);
  const positions = new Map<string, { x: number; y: number }>();

  for (const child of (layouted.children ?? []) as ElkNode[]) {
    if (child.id != null && child.x != null && child.y != null) {
      positions.set(child.id, { x: child.x, y: child.y });
    }
  }

  return nodes.map((node) => {
    const pos = positions.get(node.id);
    return pos ? { ...node, position: { ...pos } } : node;
  });
}

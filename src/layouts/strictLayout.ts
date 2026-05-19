import Dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';

const PERSON_W = 148;
const PERSON_H = 58;
const CONNECTOR = 28;

/** Top-to-bottom generational layout (Dagre) for hub-and-spoke family trees. */
export function layoutStrictTree<T extends Node>(
  nodes: T[],
  edges: Edge[],
): T[] {
  const g = new Dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    align: 'UL',
    nodesep: 40,
    ranksep: 72,
    marginx: 48,
    marginy: 48,
  });

  for (const node of nodes) {
    const isConnector = node.type === 'connector';
    g.setNode(node.id, {
      width: isConnector ? CONNECTOR : PERSON_W,
      height: isConnector ? CONNECTOR : PERSON_H,
    });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);

  return nodes.map((node) => {
    const laid = g.node(node.id);
    const w = node.type === 'connector' ? CONNECTOR : PERSON_W;
    const h = node.type === 'connector' ? CONNECTOR : PERSON_H;
    return {
      ...node,
      position: {
        x: laid.x - w / 2,
        y: laid.y - h / 2,
      },
    };
  });
}

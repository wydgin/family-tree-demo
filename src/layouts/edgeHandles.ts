import type { Edge, Node } from '@xyflow/react';

type Pos = { x: number; y: number };

const PERSON_W = 148;
const PERSON_H = 46;
const CONNECTOR = 28;

export type SideId = 'top' | 'bottom' | 'left' | 'right';

export function nodeCenter(node: Node, pos: Pos): Pos {
  if (node.type === 'connector') {
    return { x: pos.x + CONNECTOR / 2, y: pos.y + CONNECTOR / 2 };
  }
  return { x: pos.x + PERSON_W / 2, y: pos.y + PERSON_H / 2 };
}

/** Which side of `from` faces `to`. */
export function sideToward(from: Pos, to: Pos): SideId {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'bottom' : 'top';
}

/** Floating edges — border attachment computed per frame, no fixed side handles. */
export function wireFloatingEdges(edges: Edge[]): Edge[] {
  return edges.map((edge) => ({
    ...edge,
    type: 'floating',
    sourceHandle: undefined,
    targetHandle: undefined,
  }));
}

/** Bezier edges with handles on the side that faces the other node (strict / step). */
export function wireRadialHandles<T extends Node>(nodes: T[], edges: Edge[]): Edge[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  return edges.map((edge) => {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target) {
      return edge;
    }

    const from = nodeCenter(source, source.position);
    const to = nodeCenter(target, target.position);
    const outSide = sideToward(from, to);
    const inSide = sideToward(to, from);

    return {
      ...edge,
      type: edge.type ?? 'default',
      sourceHandle: `${outSide}-out`,
      targetHandle: `${inSide}-in`,
    };
  });
}

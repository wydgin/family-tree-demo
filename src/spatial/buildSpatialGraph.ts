import type { LinkObject, NodeObject } from 'react-force-graph-3d';

import { graphEdges, graphNodes, type PersonGender } from '../data/graph';

export type SpatialNode = NodeObject & {
  id: string;
  label: string;
  kind: 'person' | 'connector';
  gender?: PersonGender;
  highlighted?: boolean;
  val: number;
};

export type SpatialLink = LinkObject<SpatialNode> & {
  faint?: boolean;
  branch?: boolean;
};

export function buildSpatialGraphData() {
  const degree = new Map<string, number>();
  for (const edge of graphEdges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }

  const nodes: SpatialNode[] = graphNodes.map((node) => {
    const links = degree.get(node.id) ?? 1;
    const base = node.kind === 'connector' ? 2 : 6;
    return {
      id: node.id,
      label: node.label,
      kind: node.kind,
      gender: node.gender,
      highlighted: node.highlighted,
      val: base + links * 3,
    };
  });

  const links: SpatialLink[] = graphEdges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    faint: edge.faint,
    branch: edge.branch,
  }));

  return { nodes, links };
}

import type { Edge, Node } from '@xyflow/react';

/** Nodes + edges in the selected person's immediate family (via connector hubs). */
export function getImmediateFamily(
  selectedId: string,
  nodes: Node[],
  edges: Edge[],
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const nodeIds = new Set<string>([selectedId]);
  const edgeIds = new Set<string>();

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const isConnector = (id: string) => byId.get(id)?.type === 'connector';

  const incident = edges.filter(
    (e) => e.source === selectedId || e.target === selectedId,
  );

  for (const edge of incident) {
    edgeIds.add(edge.id);
    const neighbor = edge.source === selectedId ? edge.target : edge.source;
    nodeIds.add(neighbor);

    if (!isConnector(neighbor)) continue;

    for (const hop of edges) {
      if (hop.id === edge.id) continue;
      if (hop.source !== neighbor && hop.target !== neighbor) continue;

      const next = hop.source === neighbor ? hop.target : hop.source;
      if (isConnector(next)) continue;

      nodeIds.add(next);
      edgeIds.add(hop.id);
    }
  }

  return { nodeIds, edgeIds };
}

/** Direct ancestors through connector hubs (matches strict-tree highlight in mockup). */
export function getAncestryPath(
  selectedId: string,
  nodes: Node[],
  edges: Edge[],
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const nodeIds = new Set<string>([selectedId]);
  const edgeIds = new Set<string>();
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const isConnector = (id: string) => byId.get(id)?.type === 'connector';

  const queue = [selectedId];
  const seen = new Set<string>();

  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);

    for (const edge of edges) {
      if (edge.target !== id) continue;
      const hubId = edge.source;
      if (!isConnector(hubId)) continue;

      edgeIds.add(edge.id);
      nodeIds.add(hubId);

      for (const parentEdge of edges) {
        if (parentEdge.target !== hubId) continue;
        if ((parentEdge.data as { kind?: string })?.kind !== 'branch') continue;

        const parentId = parentEdge.source;
        if (isConnector(parentId)) continue;

        edgeIds.add(parentEdge.id);
        nodeIds.add(parentId);
        queue.push(parentId);
      }
    }
  }

  return { nodeIds, edgeIds };
}

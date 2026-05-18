import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node } from '@xyflow/react';

import { CONNECTOR_SIZE, PERSON_H, PERSON_W } from './elkLayout';

function memberSize(node: Node) {
  if (node.type === 'connector') {
    return { width: CONNECTOR_SIZE, height: CONNECTOR_SIZE };
  }
  return { width: PERSON_W, height: PERSON_H };
}

const elk = new ELK();

const HUB_RADIAL_OPTIONS = {
  'elk.algorithm': 'org.eclipse.elk.radial',
  'elk.spacing.nodeNode': '62',
  'elk.radial.compactor': 'NONE',
};

const HUB_RADIAL_SPREAD_OPTIONS = {
  ...HUB_RADIAL_OPTIONS,
  'elk.spacing.nodeNode': '92',
};

type ElkLaid = { id?: string; x?: number; y?: number; width?: number; height?: number };

/** ELK radial on one connector hub + its immediate family (the “petals”). */
export async function layoutHubRadialCluster(
  hubId: string,
  centerX: number,
  centerY: number,
  memberIds: string[],
  nodeById: Map<string, Node>,
  spread = false,
): Promise<Map<string, { x: number; y: number }>> {
  const out = new Map<string, { x: number; y: number }>();
  if (memberIds.length === 0) return out;

  const n = memberIds.length;
  if (n === 1) {
    const r = Math.max(150, PERSON_W + 40);
    out.set(memberIds[0], {
      x: centerX + r * Math.cos(-Math.PI / 2),
      y: centerY + r * Math.sin(-Math.PI / 2),
    });
    return out;
  }

  const children: ElkLaid[] = [
    { id: hubId, width: CONNECTOR_SIZE, height: CONNECTOR_SIZE },
    ...memberIds.map((id) => {
      const node = nodeById.get(id)!;
      const { width, height } = memberSize(node);
      return { id, width, height };
    }),
  ];

  const elkEdges = memberIds.map((id) => ({
    id: `${hubId}--${id}`,
    sources: [hubId],
    targets: [id],
  }));

  const laid = await elk.layout({
    id: `flower-${hubId}`,
    layoutOptions: spread ? HUB_RADIAL_SPREAD_OPTIONS : HUB_RADIAL_OPTIONS,
    children: children as { id: string; width: number; height: number }[],
    edges: elkEdges,
  });

  const hubLaid = (laid.children ?? []).find((c) => c.id === hubId);
  const hubCx = (hubLaid?.x ?? 0) + CONNECTOR_SIZE / 2;
  const hubCy = (hubLaid?.y ?? 0) + CONNECTOR_SIZE / 2;
  const dx = centerX - hubCx;
  const dy = centerY - hubCy;

  for (const child of (laid.children ?? []) as ElkLaid[]) {
    if (!child.id || child.id === hubId || child.x == null || child.y == null) continue;
    const node = nodeById.get(child.id)!;
    const { width, height } = memberSize(node);
    out.set(child.id, {
      x: child.x + dx + width / 2,
      y: child.y + dy + height / 2,
    });
  }

  if (out.size < memberIds.length) {
    const base = spread ? 248 : 200;
    const r = Math.max(base, (PERSON_W + (spread ? 56 : 36)) / (2 * Math.sin(Math.PI / n)));
    memberIds.forEach((id, i) => {
      const angle = -Math.PI / 2 + ((2 * Math.PI) / n) * i;
      out.set(id, {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      });
    });
  }

  return out;
}

import type { Edge, Node } from '@xyflow/react';

type Pos = { x: number; y: number };
type Center = { cx: number; cy: number };

const PERSON_W = 148;
const PERSON_H = 46;
const CONNECTOR = 28;
const NODE_PAD = 40;

/** Maternal ring — uncles/aunties on left & top, Mother opens to the right (toward your family) */
const MATERNAL_ANGLE: Record<string, number> = {
  'grandmother-1': -Math.PI / 2 - 0.22,
  'grandfather-1': -Math.PI / 2 + 0.22,
  'uncle-1': Math.PI * 1.05,
  'uncle-2': -Math.PI * 0.75,
  'uncle-3': Math.PI * 0.65,
  'auntie-1': Math.PI * 0.5,
  'auntie-2': Math.PI * 0.36,
  'auntie-3': Math.PI * 0.22,
  'auntie-4': 0.06,
  'auntie-5': 0.2,
  mother: 0.34,
};

const PARENTS_ANGLE: Record<string, number> = {
  father: -0.12,
  me: Math.PI * 0.48,
  'brother-1': Math.PI * 0.64,
  'brother-2': Math.PI * 0.8,
  'hub-brother-2': Math.PI * 0.96,
};

const PATERNAL_A_ANGLE: Record<string, number> = {
  'grandmother-2': -Math.PI / 2 - 0.22,
  'grandfather-2': -Math.PI / 2 + 0.22,
  'tiyong-1': Math.PI * 1.05,
  'tiyong-2': Math.PI * 0.68,
  'tiyong-3': Math.PI * 0.54,
  'tiyang-1': Math.PI * 0.4,
  'tiyang-2': Math.PI * 0.26,
  'tiyang-3': Math.PI * 0.12,
};

type GraphMaps = {
  nodeById: Map<string, Node>;
  branchIn: Map<string, string[]>;
  greyOut: Map<string, string[]>;
  personToHub: Map<string, string[]>;
};

class PositionMap {
  readonly positions = new Map<string, Pos>();
  readonly hubCenters = new Map<string, Center>();

  has(id: string) {
    return this.positions.has(id);
  }

  centerOf(id: string, node: Node): Center {
    const pos = this.positions.get(id)!;
    const w = node.type === 'connector' ? CONNECTOR : PERSON_W;
    const h = node.type === 'connector' ? CONNECTOR : PERSON_H;
    return { cx: pos.x + w / 2, cy: pos.y + h / 2 };
  }

  setCenter(id: string, cx: number, cy: number, node: Node) {
    const w = node.type === 'connector' ? CONNECTOR : PERSON_W;
    const h = node.type === 'connector' ? CONNECTOR : PERSON_H;
    this.positions.set(id, { x: cx - w / 2, y: cy - h / 2 });
    if (node.type === 'connector') {
      this.hubCenters.set(id, { cx, cy });
    }
  }
}

function isConnector(id: string, nodeById: Map<string, Node>) {
  return nodeById.get(id)?.type === 'connector';
}

function ringRadius(count: number) {
  if (count <= 1) return 130;
  const minChord = PERSON_W + NODE_PAD;
  const fromGeometry = minChord / (2 * Math.sin(Math.PI / count));
  return Math.max(210, fromGeometry);
}

function spokeGap(parentCount: number, childCount: number) {
  return ringRadius(parentCount) + ringRadius(childCount) + 90;
}

function coupleBranchDist() {
  return 175;
}

function buildGraphMaps(nodes: Node[], edges: Edge[]): GraphMaps {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const branchIn = new Map<string, string[]>();
  const greyOut = new Map<string, string[]>();
  const personToHub = new Map<string, string[]>();

  for (const e of edges) {
    const kind = (e.data as { kind?: string })?.kind;
    if (kind === 'branch') {
      branchIn.set(e.target, [...(branchIn.get(e.target) ?? []), e.source]);
      if (!isConnector(e.source, nodeById) && isConnector(e.target, nodeById)) {
        personToHub.set(e.source, [...(personToHub.get(e.source) ?? []), e.target]);
      }
    } else if (kind === 'grey') {
      greyOut.set(e.source, [...(greyOut.get(e.source) ?? []), e.target]);
    }
  }

  return { nodeById, branchIn, greyOut, personToHub };
}

function hubMembers(hubId: string, graph: GraphMaps) {
  return [
    ...new Set([
      ...(graph.branchIn.get(hubId) ?? []),
      ...(graph.greyOut.get(hubId) ?? []),
    ]),
  ];
}

function siblingForCoupleHub(hubId: string, graph: GraphMaps) {
  return graph.branchIn.get(hubId)?.find((id) => graph.personToHub.get(id)?.includes(hubId));
}

function polar(cx: number, cy: number, r: number, angle: number): Pos {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function angleForMember(
  memberId: string,
  index: number,
  total: number,
  preferred?: Record<string, number>,
) {
  if (preferred?.[memberId] !== undefined) return preferred[memberId]!;
  return -Math.PI / 2 + ((2 * Math.PI) / total) * index;
}

/**
 * Flower layout: ring around each hub; child hubs & spouse hubs branch outward on spokes.
 * Siblings stay on the parent ring; spouses only on their couple hub ring.
 */
export function layoutWebTree<T extends Node>(nodes: T[], edges: Edge[]): T[] {
  const graph = buildGraphMaps(nodes, edges);
  const map = new PositionMap();
  const anchored = new Set<string>();
  const deferredCouples: { hubId: string; siblingId: string; parentHubId: string }[] = [];

  function queueCouples(parentHubId: string, siblingId: string) {
    for (const hubId of graph.personToHub.get(siblingId) ?? []) {
      if (hubId === 'hub-parents') continue;
      deferredCouples.push({ hubId, siblingId, parentHubId });
    }
  }

  function layoutCoupleHub(
    hubId: string,
    hubCx: number,
    hubCy: number,
    spokeAngle: number,
  ) {
    map.setCenter(hubId, hubCx, hubCy, graph.nodeById.get(hubId)!);

    const siblingId = siblingForCoupleHub(hubId, graph);
    const spouses = (graph.branchIn.get(hubId) ?? []).filter((id) => id !== siblingId);
    const r = ringRadius(Math.max(spouses.length, 1));

    spouses.forEach((spouseId, i) => {
      const spread = spouses.length > 1 ? (i - 0.5) * 0.35 : 0;
      const p = polar(hubCx, hubCy, r, spokeAngle + spread);
      map.setCenter(spouseId, p.x, p.y, graph.nodeById.get(spouseId)!);
    });
  }

  function layoutFlower(
    hubId: string,
    cx: number,
    cy: number,
    preferredAngles?: Record<string, number>,
    options?: { queueCouples?: boolean },
  ): number {
    map.setCenter(hubId, cx, cy, graph.nodeById.get(hubId)!);

    const allMembers = hubMembers(hubId, graph);
    const toPlace = allMembers.filter((id) => !anchored.has(id));
    const n = toPlace.length;
    if (n === 0) return ringRadius(1);

    const r = ringRadius(n);

    toPlace.forEach((memberId, i) => {
      const angle = angleForMember(memberId, i, n, preferredAngles);
      const p = polar(cx, cy, r, angle);
      const node = graph.nodeById.get(memberId)!;

      if (isConnector(memberId, graph.nodeById)) {
        layoutFlower(memberId, p.x, p.y);
        return;
      }

      map.setCenter(memberId, p.x, p.y, node);
      if (options?.queueCouples !== false) {
        queueCouples(hubId, memberId);
      }
    });

    return r;
  }

  function placeChildHubOnSpoke(
    childHubId: string,
    parentHubId: string,
    viaPersonId: string,
    preferredAngles?: Record<string, number>,
  ) {
    const parentHub = map.hubCenters.get(parentHubId);
    const person = graph.nodeById.get(viaPersonId);
    if (!parentHub || !person || !map.has(viaPersonId)) return;

    const { cx: pcx, cy: pcy } = map.centerOf(viaPersonId, person);
    const spoke = Math.atan2(pcy - parentHub.cy, pcx - parentHub.cx);
    const parentN = hubMembers(parentHubId, graph).length;
    const childN = hubMembers(childHubId, graph).filter((id) => !anchored.has(id)).length;
    const dist = spokeGap(parentN, childN);
    const center = polar(parentHub.cx, parentHub.cy, dist, spoke);
    layoutFlower(childHubId, center.x, center.y, preferredAngles);
  }

  const MATERNAL = { x: 480, y: 520 };

  layoutFlower('hub-gp-maternal', MATERNAL.x, MATERNAL.y, MATERNAL_ANGLE);
  anchored.add('mother');

  placeChildHubOnSpoke('hub-parents', 'hub-gp-maternal', 'mother', PARENTS_ANGLE);
  anchored.add('father');

  placeChildHubOnSpoke('hub-gp-paternal-a', 'hub-parents', 'father', PATERNAL_A_ANGLE);
  anchored.add('grandmother-2');

  const paternalA = map.hubCenters.get('hub-gp-paternal-a');
  const gm2 = graph.nodeById.get('grandmother-2');
  if (paternalA && gm2 && map.has('grandmother-2')) {
    const { cx: gx, cy: gy } = map.centerOf('grandmother-2', gm2);
    const spoke = Math.atan2(gy - paternalA.cy, gx - paternalA.cx);
    const dist = spokeGap(hubMembers('hub-gp-paternal-a', graph).length, 2) + 40;
    const center = polar(paternalA.cx, paternalA.cy, dist, spoke + 0.45);
    layoutFlower('hub-gp-paternal-b', center.x, center.y, undefined, { queueCouples: true });
  }

  for (const { hubId, siblingId, parentHubId } of deferredCouples) {
    if (map.hubCenters.has(hubId)) continue;
    const parentHub = map.hubCenters.get(parentHubId);
    const sib = graph.nodeById.get(siblingId);
    if (!parentHub || !sib || !map.has(siblingId)) continue;

    const { cx: scx, cy: scy } = map.centerOf(siblingId, sib);
    const spoke = Math.atan2(scy - parentHub.cy, scx - parentHub.cx);
    const hubPos = polar(scx, scy, coupleBranchDist(), spoke);
    layoutCoupleHub(hubId, hubPos.x, hubPos.y, spoke);
  }

  return nodes.map((node) => {
    const pos = map.positions.get(node.id);
    return pos ? { ...node, position: { ...pos } } : node;
  });
}

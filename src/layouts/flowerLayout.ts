import type { Edge, Node } from '@xyflow/react';

import { layoutHubRadialCluster } from './elkFlowerLayout';

type Pos = { x: number; y: number };
type Center = { cx: number; cy: number };

const PERSON_W = 148;
const PERSON_H = 46;
const CONNECTOR = 28;

const RING_PAD = 52;
const SPOKE_GAP = 145;
const COUPLE_BRANCH_OUT = 280;
const SPOUSE_ALONG_SPOKE = 130;
const COUPLE_BRANCH_CLOSE = 115;
const EX_NEAR_SIBLING = 105;

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

function isCoupleHub(hubId: string) {
  return (
    hubId.startsWith('hub-') &&
    !hubId.startsWith('hub-gp-') &&
    hubId !== 'hub-parents'
  );
}

function ringRadius(count: number) {
  if (count <= 1) return 165;
  const minChord = PERSON_W + RING_PAD;
  return Math.max(255, minChord / (2 * Math.sin(Math.PI / count)));
}

function spokeDistance(parentCount: number, childCount: number) {
  return ringRadius(parentCount) + ringRadius(childCount) + SPOKE_GAP;
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

/** Spouses branch FROM the couple hub (hub-spouse-out) or INTO it (legacy both-in). */
function spousesOfCoupleHub(hubId: string, graph: GraphMaps, edges: Edge[]): string[] {
  const siblingId = siblingForCoupleHub(hubId, graph);
  const fromOutgoing = edges
    .filter((e) => e.source === hubId && (e.data as { kind?: string })?.kind === 'branch')
    .map((e) => e.target);
  const fromIncoming = (graph.branchIn.get(hubId) ?? []).filter(
    (id) => id !== siblingId && !isConnector(id, graph.nodeById),
  );
  return [...new Set([...fromOutgoing, ...fromIncoming])];
}

function faintExId(siblingId: string, edges: Edge[]) {
  const ex = edges.find(
    (e) =>
      (e.data as { kind?: string })?.kind === 'faint' && e.target === siblingId,
  );
  return ex?.source;
}

function polar(cx: number, cy: number, r: number, angle: number): Pos {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

type CoupleMode = 'outward' | 'close';

export async function layoutFlowerTree<T extends Node>(
  nodes: T[],
  edges: Edge[],
): Promise<T[]> {
  const graph = buildGraphMaps(nodes, edges);
  const map = new PositionMap();
  const anchored = new Set<string>();

  function layoutCoupleHub(
    hubId: string,
    siblingId: string,
    parentHubId: string,
    mode: CoupleMode,
  ) {
    if (map.hubCenters.has(hubId)) return;

    const sib = graph.nodeById.get(siblingId);
    const parentHub = map.hubCenters.get(parentHubId);
    if (!sib || !parentHub || !map.has(siblingId)) return;

    const { cx: scx, cy: scy } = map.centerOf(siblingId, sib);
    const spoke = Math.atan2(scy - parentHub.cy, scx - parentHub.cx);
    const branchDist = mode === 'outward' ? COUPLE_BRANCH_OUT : COUPLE_BRANCH_CLOSE;
    const hubPos = polar(scx, scy, branchDist, spoke);

    map.setCenter(hubId, hubPos.x, hubPos.y, graph.nodeById.get(hubId)!);

    const spouses = spousesOfCoupleHub(hubId, graph, edges);
    const { cx: hcx, cy: hcy } = map.hubCenters.get(hubId)!;

    spouses.forEach((spouseId, i) => {
      const spread = spouses.length > 1 ? (i - 0.5) * 0.28 : 0;
      const p = polar(hcx, hcy, SPOUSE_ALONG_SPOKE, spoke + spread);
      map.setCenter(spouseId, p.x, p.y, graph.nodeById.get(spouseId)!);
    });

    const exId = faintExId(siblingId, edges);
    if (exId && graph.nodeById.has(exId)) {
      const exAngle = spoke + (mode === 'outward' ? 0.52 : 0.42);
      const exP = polar(scx, scy, EX_NEAR_SIBLING, exAngle);
      map.setCenter(exId, exP.x, exP.y, graph.nodeById.get(exId)!);
    }
  }

  function layoutCouplesForSibling(
    parentHubId: string,
    siblingId: string,
    mode: CoupleMode,
  ) {
    for (const hubId of graph.personToHub.get(siblingId) ?? []) {
      if (!isCoupleHub(hubId)) continue;
      layoutCoupleHub(hubId, siblingId, parentHubId, mode);
    }
  }

  async function layoutFlower(hubId: string, cx: number, cy: number, coupleMode: CoupleMode) {
    map.setCenter(hubId, cx, cy, graph.nodeById.get(hubId)!);

    const toPlace = hubMembers(hubId, graph).filter(
      (id) => !anchored.has(id) && !(isConnector(id, graph.nodeById) && isCoupleHub(id)),
    );

    const petalPositions = await layoutHubRadialCluster(
      hubId,
      cx,
      cy,
      toPlace,
      graph.nodeById,
    );

    for (const memberId of toPlace) {
      const pos = petalPositions.get(memberId);
      if (!pos) continue;
      map.setCenter(memberId, pos.x, pos.y, graph.nodeById.get(memberId)!);

      if (!isConnector(memberId, graph.nodeById)) {
        layoutCouplesForSibling(hubId, memberId, coupleMode);
      }
    }
  }

  function placeChildHubOnSpoke(
    childHubId: string,
    parentHubId: string,
    viaPersonId: string,
  ) {
    const parentHub = map.hubCenters.get(parentHubId);
    const person = graph.nodeById.get(viaPersonId);
    if (!parentHub || !person || !map.has(viaPersonId)) return null;

    const { cx: pcx, cy: pcy } = map.centerOf(viaPersonId, person);
    const spoke = Math.atan2(pcy - parentHub.cy, pcx - parentHub.cx);
    const parentN = hubMembers(parentHubId, graph).length;
    const childN = hubMembers(childHubId, graph).filter((id) => !anchored.has(id)).length;
    const dist = spokeDistance(parentN, childN);
    return polar(parentHub.cx, parentHub.cy, dist, spoke);
  }

  await layoutFlower('hub-gp-maternal', 380, 520, 'outward');
  anchored.add('mother');

  const parentsCenter = placeChildHubOnSpoke('hub-parents', 'hub-gp-maternal', 'mother');
  if (parentsCenter) await layoutFlower('hub-parents', parentsCenter.x, parentsCenter.y, 'close');
  anchored.add('father');

  const paternalCenter = placeChildHubOnSpoke('hub-gp-paternal-a', 'hub-parents', 'father');
  if (paternalCenter) await layoutFlower('hub-gp-paternal-a', paternalCenter.x, paternalCenter.y, 'outward');
  anchored.add('grandmother-2');

  const paternalA = map.hubCenters.get('hub-gp-paternal-a');
  if (paternalA && map.has('grandmother-2')) {
    const { cx: gx, cy: gy } = map.centerOf('grandmother-2', graph.nodeById.get('grandmother-2')!);
    const spoke = Math.atan2(gy - paternalA.cy, gx - paternalA.cx);
    const dist = spokeDistance(hubMembers('hub-gp-paternal-a', graph).length, 2) + 70;
    const center = polar(paternalA.cx, paternalA.cy, dist, spoke + 0.4);
    await layoutFlower('hub-gp-paternal-b', center.x, center.y, 'outward');
  }

  return nodes.map((node) => {
    const pos = map.positions.get(node.id);
    return pos ? { ...node, position: { ...pos } } : node;
  });
}

import type { Edge, Node } from '@xyflow/react';

import { layoutHubRadialCluster } from './elkFlowerLayout';

type Pos = { x: number; y: number };
type Center = { cx: number; cy: number };

const PERSON_W = 148;
const PERSON_H = 58;
const CONNECTOR = 28;

const RING_PAD = 52;
const SPOKE_GAP = 145;
const COUPLE_BRANCH_OUT = 280;
const COUPLE_BRANCH_OUT_PATERNAL = 380;
const PATERNAL_SPOKE_EXTRA = 140;

/** Same angular spread as webLayout — mirrors maternal ring on the right. */
const PATERNAL_A_ANGLE: Record<string, number> = {
  'grandmother-2': -Math.PI / 2 - 0.22,
  'grandfather-2': -Math.PI / 2 + 0.22,
  'tiyong-1': 0.06,
  'tiyong-2': Math.PI * 0.68,
  'tiyong-3': Math.PI * 0.54,
  'tiyang-1': Math.PI * 0.4,
  'tiyang-2': Math.PI * 0.26,
  'tiyang-3': Math.PI * 0.12,
};
const SPOUSE_ALONG_SPOKE = 130;
const COUSIN_ALONG_SPOKE = 175;
const COUSIN_PAD = 44;
const COUSIN_ROW_GAP = 78;
const COUSIN_MARRIAGE_BRANCH = 100;
const COUSIN_MARRIAGE_SPOUSE = 120;
const COUSIN_MARRIAGE_SPOKE_BIAS = 0.09;
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

  clear(id: string) {
    this.positions.delete(id);
    this.hubCenters.delete(id);
  }

  swapPositions(idA: string, idB: string) {
    const a = this.positions.get(idA);
    const b = this.positions.get(idB);
    if (!a || !b) return;
    this.positions.set(idA, { ...b });
    this.positions.set(idB, { ...a });
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

function isCousinMarriageHub(hubId: string) {
  return hubId.startsWith('hub-cousin-');
}

function cousinArcBaseDist(cousinCount: number) {
  return SPOUSE_ALONG_SPOKE + COUSIN_ALONG_SPOKE + Math.max(0, cousinCount - 4) * 28;
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

function placeExPartnerNearSibling(
  map: PositionMap,
  graph: GraphMaps,
  siblingId: string,
  edges: Edge[],
  mode: CoupleMode,
  spoke: number,
) {
  const exId = faintExId(siblingId, edges);
  if (!exId || !graph.nodeById.has(exId) || !map.has(siblingId)) return;

  const sib = graph.nodeById.get(siblingId)!;
  const { cx: scx, cy: scy } = map.centerOf(siblingId, sib);
  const exAngle = spoke + (mode === 'outward' ? 0.52 : 0.42);
  const exP = polar(scx, scy, EX_NEAR_SIBLING, exAngle);
  map.setCenter(exId, exP.x, exP.y, graph.nodeById.get(exId)!);
}

function cousinHasCoupleHub(cousinId: string, graph: GraphMaps) {
  return (graph.personToHub.get(cousinId) ?? []).some((id) => isCoupleHub(id));
}

function cousinsOfCoupleHub(hubId: string, graph: GraphMaps, edges: Edge[]) {
  const siblingId = siblingForCoupleHub(hubId, graph);
  const ids: string[] = [];
  for (const e of edges) {
    if (e.source !== hubId || (e.data as { kind?: string })?.kind !== 'grey') continue;
    const childId = e.target;
    if (isConnector(childId, graph.nodeById)) continue;
    if (childId === siblingId) continue;
    ids.push(childId);
  }
  return ids.sort();
}

function cousinsOfPerson(personId: string, graph: GraphMaps, edges: Edge[]) {
  const ids: string[] = [];
  for (const e of edges) {
    if (e.source !== personId || (e.data as { kind?: string })?.kind !== 'grey') continue;
    const childId = e.target;
    if (isConnector(childId, graph.nodeById)) continue;
    ids.push(childId);
  }
  return ids.sort();
}

/** Angular gap so node boxes do not overlap on an arc at `radius`. */
function cousinAngleStep(count: number, radius: number) {
  if (count <= 1) return 0;
  const minChord = PERSON_W + COUSIN_PAD;
  return 2 * Math.asin(Math.min(1, minChord / (2 * radius)));
}

function layoutCousinsOnArc(
  map: PositionMap,
  graph: GraphMaps,
  hubCx: number,
  hubCy: number,
  spoke: number,
  cousinIds: string[],
) {
  const n = cousinIds.length;
  if (n === 0) return;

  const baseDist = cousinArcBaseDist(n);

  const placeRow = (ids: string[], dist: number, rowIndex: number, rowCount: number) => {
    const step = cousinAngleStep(ids.length, dist);
    const rowBias = rowCount > 1 ? (rowIndex - (rowCount - 1) / 2) * step * 0.4 : 0;
    ids.forEach((cousinId, i) => {
      const spread = ids.length > 1 ? (i - (ids.length - 1) / 2) * step : 0;
      const p = polar(hubCx, hubCy, dist, spoke + spread + rowBias);
      map.setCenter(cousinId, p.x, p.y, graph.nodeById.get(cousinId)!);
    });
  };

  if (n <= 2) {
    placeRow(cousinIds, baseDist, 0, 1);
    return;
  }

  if (n <= 4) {
    const row1Count = Math.ceil(n / 2);
    placeRow(cousinIds.slice(0, row1Count), baseDist, 0, 2);
    placeRow(
      cousinIds.slice(row1Count),
      baseDist + PERSON_H + COUSIN_ROW_GAP,
      1,
      2,
    );
    return;
  }

  if (n <= 6) {
    const row1Count = Math.ceil(n / 2);
    placeRow(cousinIds.slice(0, row1Count), baseDist, 0, 2);
    placeRow(
      cousinIds.slice(row1Count),
      baseDist + PERSON_H + COUSIN_ROW_GAP * 1.35,
      1,
      2,
    );
    return;
  }

  const rowSize = Math.ceil(n / 3);
  const rows = [
    cousinIds.slice(0, rowSize),
    cousinIds.slice(rowSize, rowSize * 2),
    cousinIds.slice(rowSize * 2),
  ].filter((row) => row.length > 0);

  rows.forEach((row, rowIndex) => {
    placeRow(
      row,
      baseDist + rowIndex * (PERSON_H + COUSIN_ROW_GAP),
      rowIndex,
      rows.length,
    );
  });
}

function polar(cx: number, cy: number, r: number, angle: number): Pos {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function maxPetalRadius(
  hubId: string,
  map: PositionMap,
  graph: GraphMaps,
): number {
  const hub = map.hubCenters.get(hubId);
  if (!hub) return ringRadius(9);
  let max = 0;
  for (const id of hubMembers(hubId, graph)) {
    if (!map.has(id) || isConnector(id, graph.nodeById)) continue;
    if (isCoupleHub(id)) continue;
    const node = graph.nodeById.get(id)!;
    const { cx, cy } = map.centerOf(id, node);
    max = Math.max(max, Math.hypot(cx - hub.cx, cy - hub.cy));
  }
  return max > 0 ? max : ringRadius(9);
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

type CoupleMode = 'outward' | 'close';

type PositionRecord = Record<string, { x: number; y: number }>;

const TIYONG1_COUSIN_NUMS = [24, 25, 26, 27, 28] as const;

export function isTiyong1LineageId(id: string): boolean {
  if (id === 'tiyong-1' || id === 'hub-tiyong-1' || id === 'tiyong-1-wife') return true;
  for (const n of TIYONG1_COUSIN_NUMS) {
    if (id === `cousin-${n}` || id === `hub-cousin-${n}`) return true;
    if (id.startsWith(`cousin-${n}-`)) return true;
  }
  return false;
}

function seedMapFromNodes<T extends Node>(nodes: T[], map: PositionMap) {
  for (const node of nodes) {
    map.positions.set(node.id, { x: node.position.x, y: node.position.y });
    if (node.type === 'connector') {
      const w = CONNECTOR;
      const h = CONNECTOR;
      map.hubCenters.set(node.id, {
        cx: node.position.x + w / 2,
        cy: node.position.y + h / 2,
      });
    }
  }
}

function rightSpokeFromTiyong(
  tcx: number,
  tcy: number,
  paternalHub: Center | undefined,
): number {
  if (!paternalHub) return 0;
  const fromHub = Math.atan2(tcy - paternalHub.cy, tcx - paternalHub.cx);
  if (tcx > paternalHub.cx + 40) return -0.04;
  return Math.max(fromHub, -0.55);
}

/** Re-layout Tiyong 1 + wife + cousins + their spouses to the right; keep saved positions. */
export function applyTiyong1RightBranch<T extends Node>(
  nodes: T[],
  edges: Edge[],
  saved: PositionRecord | null,
): T[] {
  const graph = buildGraphMaps(nodes, edges);
  const map = new PositionMap();
  seedMapFromNodes(nodes, map);

  if (!map.has('tiyong-1')) return nodes;

  const paternalHub = map.hubCenters.get('hub-gp-paternal-a');
  const tiyongNode = graph.nodeById.get('tiyong-1')!;
  const { cx: tcx, cy: tcy } = map.centerOf('tiyong-1', tiyongNode);
  const spoke = rightSpokeFromTiyong(tcx, tcy, paternalHub);

  for (const id of nodes.map((n) => n.id)) {
    if (isTiyong1LineageId(id) && id !== 'tiyong-1' && !saved?.[id]) {
      map.clear(id);
    }
  }

  const parentHubId = 'hub-gp-paternal-a';

  function layoutCoupleHubLocal(
    hubId: string,
    siblingId: string,
    force = false,
    spokeBias = 0,
    spokeOverride?: number,
  ) {
    if (map.hubCenters.has(hubId) && !force) return;

    const sib = graph.nodeById.get(siblingId);
    const parentHub = map.hubCenters.get(parentHubId);
    if (!sib || !parentHub || !map.has(siblingId)) return;

    const { cx: scx, cy: scy } = map.centerOf(siblingId, sib);
    const hubSpoke =
      (spokeOverride ?? Math.atan2(scy - parentHub.cy, scx - parentHub.cx)) + spokeBias;
    const nestedMarriage = isCousinMarriageHub(hubId);

    if (nestedMarriage) {
      if (saved?.[hubId]) return;
      const hubPos = polar(scx, scy, COUSIN_MARRIAGE_BRANCH, hubSpoke);
      map.setCenter(hubId, hubPos.x, hubPos.y, graph.nodeById.get(hubId)!);
      const spouses = spousesOfCoupleHub(hubId, graph, edges);
      const { cx: hcx, cy: hcy } = map.hubCenters.get(hubId)!;
      const perp = hubSpoke + Math.PI / 2;
      spouses.forEach((spouseId, i) => {
        if (saved?.[spouseId]) return;
        const spread = spouses.length > 1 ? (i - 0.5) * 0.34 : 0;
        const p = polar(hcx, hcy, COUSIN_MARRIAGE_SPOUSE, perp + spread);
        map.setCenter(spouseId, p.x, p.y, graph.nodeById.get(spouseId)!);
      });
      return;
    }

    if (saved?.[hubId]) {
      const { cx: hcx, cy: hcy } = map.hubCenters.get(hubId)!;
      const spouses = spousesOfCoupleHub(hubId, graph, edges);
      spouses.forEach((spouseId, i) => {
        if (saved?.[spouseId]) return;
        const spread = spouses.length > 1 ? (i - 0.5) * 0.28 : 0;
        const p = polar(hcx, hcy, SPOUSE_ALONG_SPOKE, hubSpoke + spread);
        map.setCenter(spouseId, p.x, p.y, graph.nodeById.get(spouseId)!);
      });
      const hubCousins = cousinsOfCoupleHub(hubId, graph, edges).filter((id) => !saved?.[id]);
      layoutCousinsOnArc(map, graph, hcx, hcy, hubSpoke, hubCousins);
      hubCousins.forEach((cousinId, i) => {
        layoutCouplesForCousinLocal(cousinId, i, hubCousins.length);
      });
      return;
    }

    const hubPos = polar(scx, scy, COUPLE_BRANCH_OUT_PATERNAL, hubSpoke);
    map.setCenter(hubId, hubPos.x, hubPos.y, graph.nodeById.get(hubId)!);

    const spouses = spousesOfCoupleHub(hubId, graph, edges);
    const { cx: hcx, cy: hcy } = map.hubCenters.get(hubId)!;
    spouses.forEach((spouseId, i) => {
      if (saved?.[spouseId]) return;
      const spread = spouses.length > 1 ? (i - 0.5) * 0.28 : 0;
      const p = polar(hcx, hcy, SPOUSE_ALONG_SPOKE, hubSpoke + spread);
      map.setCenter(spouseId, p.x, p.y, graph.nodeById.get(spouseId)!);
    });

    const hubCousins = cousinsOfCoupleHub(hubId, graph, edges).filter((id) => !saved?.[id]);
    layoutCousinsOnArc(map, graph, hcx, hcy, hubSpoke, hubCousins);
    hubCousins.forEach((cousinId, i) => {
      layoutCouplesForCousinLocal(cousinId, i, hubCousins.length);
    });
  }

  function layoutCouplesForCousinLocal(
    cousinId: string,
    index: number,
    total: number,
  ) {
    const spokeBias =
      total > 1 ? (index - (total - 1) / 2) * COUSIN_MARRIAGE_SPOKE_BIAS : 0;
    for (const nestedHubId of graph.personToHub.get(cousinId) ?? []) {
      if (!isCoupleHub(nestedHubId)) continue;
      if (saved?.[nestedHubId]) continue;
      layoutCoupleHubLocal(nestedHubId, cousinId, true, spokeBias, spoke);
    }
  }

  layoutCoupleHubLocal('hub-tiyong-1', 'tiyong-1', true, 0, spoke);

  return nodes.map((node) => {
    const pos = map.positions.get(node.id);
    return pos ? { ...node, position: { ...pos } } : node;
  });
}

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
    force = false,
    branchOutDist = COUPLE_BRANCH_OUT,
    spokeBias = 0,
  ) {
    if (map.hubCenters.has(hubId) && !force) return;

    const sib = graph.nodeById.get(siblingId);
    const parentHub = map.hubCenters.get(parentHubId);
    if (!sib || !parentHub || !map.has(siblingId)) return;

    const { cx: scx, cy: scy } = map.centerOf(siblingId, sib);
    const spoke = Math.atan2(scy - parentHub.cy, scx - parentHub.cx) + spokeBias;
    const nestedMarriage = isCousinMarriageHub(hubId);

    if (nestedMarriage) {
      const hubPos = polar(scx, scy, COUSIN_MARRIAGE_BRANCH, spoke);
      map.setCenter(hubId, hubPos.x, hubPos.y, graph.nodeById.get(hubId)!);

      const spouses = spousesOfCoupleHub(hubId, graph, edges);
      const { cx: hcx, cy: hcy } = map.hubCenters.get(hubId)!;
      const perp = spoke + Math.PI / 2;

      spouses.forEach((spouseId, i) => {
        const spread = spouses.length > 1 ? (i - 0.5) * 0.34 : 0;
        const p = polar(hcx, hcy, COUSIN_MARRIAGE_SPOUSE, perp + spread);
        map.setCenter(spouseId, p.x, p.y, graph.nodeById.get(spouseId)!);
      });

      const exId = faintExId(siblingId, edges);
      if (exId && graph.nodeById.has(exId)) {
        const exAngle = perp + (mode === 'outward' ? 0.48 : 0.38);
        const exP = polar(scx, scy, EX_NEAR_SIBLING + 12, exAngle);
        map.setCenter(exId, exP.x, exP.y, graph.nodeById.get(exId)!);
      }
      return;
    }

    const branchDist = mode === 'outward' ? branchOutDist : COUPLE_BRANCH_CLOSE;
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

      const { cx: exCx, cy: exCy } = map.centerOf(exId, graph.nodeById.get(exId)!);
      const exSpoke = Math.atan2(exCy - scy, exCx - scx);
      const exCousins = cousinsOfPerson(exId, graph, edges);
      layoutCousinsOnArc(map, graph, exCx, exCy, exSpoke, exCousins);
      for (let i = 0; i < exCousins.length; i++) {
        layoutCouplesForCousin(hubId, exCousins[i], mode, i, exCousins.length);
      }
    }

    const hubCousins = cousinsOfCoupleHub(hubId, graph, edges);
    layoutCousinsOnArc(map, graph, hcx, hcy, spoke, hubCousins);
    for (let i = 0; i < hubCousins.length; i++) {
      const cousinId = hubCousins[i];
      layoutCouplesForCousin(hubId, cousinId, mode, i, hubCousins.length);
      if (!cousinHasCoupleHub(cousinId, graph)) {
        placeExPartnerNearSibling(map, graph, cousinId, edges, mode, spoke);
      }
    }
  }

  function layoutCouplesForCousin(
    parentHubId: string,
    cousinId: string,
    mode: CoupleMode,
    index = 0,
    total = 1,
  ) {
    const spokeBias =
      total > 1 ? (index - (total - 1) / 2) * COUSIN_MARRIAGE_SPOKE_BIAS : 0;
    for (const nestedHubId of graph.personToHub.get(cousinId) ?? []) {
      if (!isCoupleHub(nestedHubId)) continue;
      layoutCoupleHub(
        nestedHubId,
        cousinId,
        parentHubId,
        mode,
        false,
        COUPLE_BRANCH_OUT,
        spokeBias,
      );
    }
  }

  function layoutCouplesForSibling(
    parentHubId: string,
    siblingId: string,
    mode: CoupleMode,
  ) {
    const branchOut =
      parentHubId === 'hub-gp-paternal-a' || parentHubId === 'hub-gp-paternal-b'
        ? COUPLE_BRANCH_OUT_PATERNAL
        : COUPLE_BRANCH_OUT;
    for (const hubId of graph.personToHub.get(siblingId) ?? []) {
      if (!isCoupleHub(hubId)) continue;
      layoutCoupleHub(hubId, siblingId, parentHubId, mode, false, branchOut);
    }
  }

  function layoutFlowerPolar(
    hubId: string,
    cx: number,
    cy: number,
    coupleMode: CoupleMode,
    preferredAngles: Record<string, number>,
    ringR: number,
  ) {
    map.setCenter(hubId, cx, cy, graph.nodeById.get(hubId)!);

    const toPlace = hubMembers(hubId, graph).filter(
      (id) => !anchored.has(id) && !(isConnector(id, graph.nodeById) && isCoupleHub(id)),
    );
    const n = toPlace.length;

    toPlace.forEach((memberId, i) => {
      const angle = angleForMember(memberId, i, n, preferredAngles);
      const p = polar(cx, cy, ringR, angle);
      map.setCenter(memberId, p.x, p.y, graph.nodeById.get(memberId)!);

      if (!isConnector(memberId, graph.nodeById)) {
        layoutCouplesForSibling(hubId, memberId, coupleMode);
      }
    });
  }

  async function layoutFlower(
    hubId: string,
    cx: number,
    cy: number,
    coupleMode: CoupleMode,
    spreadRing = false,
  ) {
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
      spreadRing,
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
    extraDist = 0,
  ) {
    const parentHub = map.hubCenters.get(parentHubId);
    const person = graph.nodeById.get(viaPersonId);
    if (!parentHub || !person || !map.has(viaPersonId)) return null;

    const { cx: pcx, cy: pcy } = map.centerOf(viaPersonId, person);
    const spoke = Math.atan2(pcy - parentHub.cy, pcx - parentHub.cx);
    const parentN = hubMembers(parentHubId, graph).length;
    const childN = hubMembers(childHubId, graph).filter((id) => !anchored.has(id)).length;
    const dist = spokeDistance(parentN, childN) + extraDist;
    return polar(parentHub.cx, parentHub.cy, dist, spoke);
  }

  function relayoutPaternalCouples() {
    for (const id of hubMembers('hub-gp-paternal-a', graph)) {
      if (isConnector(id, graph.nodeById)) continue;
      if (id === 'tiyong-1') continue;
      layoutCouplesForSibling('hub-gp-paternal-a', id, 'outward');
    }
  }

  await layoutFlower('hub-gp-maternal', 380, 520, 'outward');
  anchored.add('mother');

  const parentsCenter = placeChildHubOnSpoke('hub-parents', 'hub-gp-maternal', 'mother');
  if (parentsCenter) await layoutFlower('hub-parents', parentsCenter.x, parentsCenter.y, 'close');

  const maternalRingR = maxPetalRadius('hub-gp-maternal', map, graph);

  const paternalCenter = placeChildHubOnSpoke(
    'hub-gp-paternal-a',
    'hub-parents',
    'father',
    PATERNAL_SPOKE_EXTRA,
  );
  if (paternalCenter) {
    const parentsHub = map.hubCenters.get('hub-parents');
    const fatherAngle = parentsHub
      ? Math.atan2(
          parentsHub.cy - paternalCenter.y,
          parentsHub.cx - paternalCenter.x,
        )
      : -0.12;

    layoutFlowerPolar(
      'hub-gp-paternal-a',
      paternalCenter.x,
      paternalCenter.y,
      'outward',
      { ...PATERNAL_A_ANGLE, father: fatherAngle },
      maternalRingR,
    );

    // Tiyong 2 has no spouse — swap ring spots with Tiyang 2 (+ her husband hub)
    map.swapPositions('tiyong-2', 'tiyang-2');
    for (const id of ['hub-tiyang-2', 'tiyang-2-husband']) {
      map.clear(id);
    }
    layoutCoupleHub(
      'hub-tiyang-2',
      'tiyang-2',
      'hub-gp-paternal-a',
      'outward',
      true,
      COUPLE_BRANCH_OUT_PATERNAL,
    );
    relayoutPaternalCouples();
  }

  anchored.add('father');
  anchored.add('grandmother-2');

  const paternalA = map.hubCenters.get('hub-gp-paternal-a');
  if (paternalA && map.has('grandmother-2')) {
    const { cx: gx, cy: gy } = map.centerOf('grandmother-2', graph.nodeById.get('grandmother-2')!);
    const spoke = Math.atan2(gy - paternalA.cy, gx - paternalA.cx);
    const dist = spokeDistance(hubMembers('hub-gp-paternal-a', graph).length, 2) + 70;
    const center = polar(paternalA.cx, paternalA.cy, dist, spoke + 0.4);
    await layoutFlower('hub-gp-paternal-b', center.x, center.y, 'outward', true);
  }

  return nodes.map((node) => {
    const pos = map.positions.get(node.id);
    return pos ? { ...node, position: { ...pos } } : node;
  });
}

import type { Edge, Node } from '@xyflow/react';
import type { ConnectorNodeData } from '../nodes/ConnectorNode';
import type { PersonNodeData } from '../nodes/PersonNode';
import { wireFloatingEdges } from '../layouts/edgeHandles';
import { branchEdgeStyle, faintEdgeStyle, greyEdgeStyle } from './edgeStyles';
import type { GrandparentUnit, MarriedChild, NuclearFamily, PersonDef } from './familyModel';
import {
  maternalGrandparents,
  myFamily,
  paternalGrandparentsA,
  paternalGrandparentsB,
} from './familyModel';
import { formatNodeLabel, getProfile, syncProfiles } from './familyProfiles';
import type { GraphEdge, GraphNode } from './graphTypes';
import type { PersonGender } from './graphTypes';

type FlowNode = Node<PersonNodeData | ConnectorNodeData>;
type FlowEdge = Edge;

const personById = new Map<string, PersonDef>();
const hubIds = new Set<string>();
const edges: FlowEdge[] = [];

function registerPerson(person: PersonDef) {
  personById.set(person.id, person);
}

function addBranchEdge(source: string, target: string, edgeId?: string) {
  edges.push({
    id: edgeId ?? `${source}-to-${target}`,
    source,
    target,
    animated: false,
    data: { kind: 'branch' },
    style: branchEdgeStyle,
  });
}

function addGreyEdge(source: string, target: string, edgeId?: string) {
  edges.push({
    id: edgeId ?? `${source}-to-${target}-child`,
    source,
    target,
    animated: false,
    data: { kind: 'grey' },
    style: greyEdgeStyle,
  });
}

function addFaintEdge(source: string, target: string) {
  edges.push({
    id: `${source}-${target}-faint`,
    source,
    target,
    animated: false,
    data: { kind: 'faint' },
    style: faintEdgeStyle,
  });
}

/** Spouse couple hub — only sibling + spouse (and optional ex), never tied to GP hub. */
function addMarriedChild(
  mc: MarriedChild,
  layout: 'both-in' | 'hub-spouse-out' = 'both-in',
) {
  registerPerson(mc.sibling);

  /** Ex only — faint link to sibling, no couple hub (avoids orphan branch edge). */
  if (!mc.spouse && mc.exSpouse) {
    registerPerson(mc.exSpouse);
    addFaintEdge(mc.exSpouse.id, mc.sibling.id);
    return;
  }

  if (!mc.hubId) return;

  hubIds.add(mc.hubId);

  if (mc.spouse) {
    registerPerson(mc.spouse);
    if (layout === 'hub-spouse-out') {
      addBranchEdge(mc.sibling.id, mc.hubId, `${mc.sibling.id}-${mc.hubId}`);
      addBranchEdge(mc.hubId, mc.spouse.id, `${mc.hubId}-${mc.spouse.id}`);
    } else {
      addBranchEdge(mc.sibling.id, mc.hubId, `${mc.sibling.id}-${mc.hubId}`);
      addBranchEdge(mc.spouse.id, mc.hubId, `${mc.spouse.id}-${mc.hubId}`);
    }
  } else {
    addBranchEdge(mc.sibling.id, mc.hubId, `${mc.sibling.id}-${mc.hubId}`);
  }

  if (mc.exSpouse) {
    registerPerson(mc.exSpouse);
    addFaintEdge(mc.exSpouse.id, mc.sibling.id);
  }

  for (const cousin of mc.children ?? []) {
    registerPerson(cousin);
    addGreyEdge(mc.hubId, cousin.id, `${mc.hubId}-${cousin.id}`);
  }

  for (const group of mc.childrenByCoParent ?? []) {
    const anchor =
      mc.spouse && group.withCoParentId === mc.spouse.id
        ? mc.hubId
        : group.withCoParentId;
    for (const cousin of group.children) {
      registerPerson(cousin);
      addGreyEdge(anchor, cousin.id, `${anchor}-${cousin.id}`);
    }
  }

  for (const nested of mc.marriedChildren ?? []) {
    addMarriedChild(nested, 'hub-spouse-out');
  }
}

function addGrandparentUnit(unit: GrandparentUnit) {
  hubIds.add(unit.hubId);
  for (const gp of unit.grandparents) {
    registerPerson(gp);
    addBranchEdge(gp.id, unit.hubId);
  }

  for (const sibling of unit.offspring) {
    registerPerson(sibling);
    addGreyEdge(unit.hubId, sibling.id);
  }

  for (const mc of unit.marriedChildren ?? []) {
    addMarriedChild(mc, 'hub-spouse-out');
  }
}

function addNuclearFamily(family: NuclearFamily) {
  hubIds.add(family.hubId);
  for (const parent of family.parents) {
    registerPerson(parent);
    addBranchEdge(parent.id, family.hubId);
  }

  for (const child of family.children) {
    registerPerson(child);
    addGreyEdge(family.hubId, child.id);
  }

  for (const mc of family.marriedChildren ?? []) {
    addMarriedChild(mc, 'hub-spouse-out');
  }
}

function buildEdges() {
  edges.length = 0;
  personById.clear();
  hubIds.clear();

  addGrandparentUnit(maternalGrandparents);
  addGrandparentUnit(paternalGrandparentsA);
  addGrandparentUnit(paternalGrandparentsB);
  addNuclearFamily(myFamily);
}

function buildFlowNodes(): FlowNode[] {
  const nodes: FlowNode[] = [];

  for (const person of personById.values()) {
    const profile = getProfile(person.id);
    const gender: PersonGender =
      profile?.sex === 'M' ? 'male' : profile?.sex === 'F' ? 'female' : person.gender;
    nodes.push({
      id: person.id,
      type: 'person',
      position: { x: 0, y: 0 },
      data: {
        label: profile ? formatNodeLabel(profile) : person.label,
        gender,
      },
    });
  }

  for (const hubId of hubIds) {
    const variant =
      hubId === 'hub-brother-2' ||
      hubId.startsWith('hub-auntie') ||
      hubId.startsWith('hub-uncle') ||
      hubId.startsWith('hub-cousin')
        ? 'branch'
        : 'primary';
    nodes.push({
      id: hubId,
      type: 'connector',
      position: { x: 0, y: 0 },
      data: { variant },
    });
  }

  return nodes;
}

function dedupeEdges(list: FlowEdge[]): FlowEdge[] {
  const seen = new Set<string>();
  return list.filter((e) => {
    const key = `${e.source}|${e.target}|${e.data?.kind ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildGraphData() {
  buildEdges();
  syncProfiles(personById.values(), edges);
  return {
    rawNodes: buildFlowNodes(),
    rawEdges: dedupeEdges(edges),
  };
}

export function buildFamilyGraph() {
  const { rawNodes, rawEdges } = buildGraphData();
  return {
    rawNodes,
    rawEdges,
    nodes: rawNodes,
    webEdges: wireFloatingEdges(rawEdges),
  };
}

export function toSpatialGraph(nodes: FlowNode[], flowEdges: FlowEdge[]) {
  const graphNodes: GraphNode[] = nodes.map((n) => {
    if (n.type === 'connector') {
      return {
        id: n.id,
        label: '',
        kind: 'connector' as const,
        connectorVariant: (n.data as ConnectorNodeData).variant ?? 'primary',
      };
    }
    const d = n.data as PersonNodeData;
    return {
      id: n.id,
      label: d.label,
      kind: 'person' as const,
      gender: d.gender as PersonGender,
    };
  });

  const graphEdges: GraphEdge[] = flowEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    branch: (e.data as { kind?: string })?.kind === 'branch',
    faint: (e.data as { kind?: string })?.kind === 'faint',
  }));

  return { graphNodes, graphEdges };
}

const built = buildFamilyGraph();
export const rawNodes = built.rawNodes;
export const rawEdges = built.rawEdges;
export const familyNodes = built.nodes;
export const familyEdges = built.webEdges;
const spatial = toSpatialGraph(rawNodes, familyEdges);
export const graphNodes = spatial.graphNodes;
export const graphEdges = spatial.graphEdges;

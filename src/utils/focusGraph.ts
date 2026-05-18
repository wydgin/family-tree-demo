import type { Edge, Node } from '@xyflow/react';

const PARENTS_HUB = 'hub-parents';
const BLOOD_MY_GENERATION = new Set(['me', 'brother-1', 'brother-2']);

type BranchDef = {
  id: string;
  rootHubId: string;
  gatewayParentId: string;
};

const LINEAGE_BRANCHES: BranchDef[] = [
  { id: 'maternal', rootHubId: 'hub-gp-maternal', gatewayParentId: 'mother' },
  { id: 'paternal-a', rootHubId: 'hub-gp-paternal-a', gatewayParentId: 'father' },
];

const PATERNAL_B_HUB = 'hub-gp-paternal-b';
const PATERNAL_A_HUB = 'hub-gp-paternal-a';
const PATERNAL_B_CHILD = 'tiyong-4';

function isOnPaternalSide(
  personId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
): boolean {
  if (personId === 'father' || personId === 'tiyong-4') return true;
  return (
    bloodOnFamilyHub(PATERNAL_A_HUB, edges, isConnector).has(personId) ||
    bloodOnFamilyHub(PATERNAL_B_HUB, edges, isConnector).has(personId)
  );
}

function buildIndex(nodes: Node[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const isConnector = (id: string) => byId.get(id)?.type === 'connector';
  return { isConnector };
}

function edgeKind(edge: Edge) {
  return (edge.data as { kind?: string })?.kind;
}

function isGpHub(hubId: string) {
  return hubId.startsWith('hub-gp-');
}

function isCoupleHub(hubId: string) {
  return hubId.startsWith('hub-') && !isGpHub(hubId) && hubId !== PARENTS_HUB;
}

/** Married-in relatives (spouse / ex) — never on the orange path. */
function isSpouse(personId: string, edges: Edge[], isConnector: (id: string) => boolean) {
  for (const e of edges) {
    if (e.target !== personId || edgeKind(e) !== 'branch') continue;
    if (isConnector(e.source) && isCoupleHub(e.source)) return true;
  }
  return false;
}

/** Blood members on a GP or parents hub (no spouses, no couple hubs). */
function bloodOnFamilyHub(
  hubId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
): Set<string> {
  const people = new Set<string>();

  for (const e of edges) {
    if (e.target === hubId && edgeKind(e) === 'branch' && !isConnector(e.source)) {
      if (!isSpouse(e.source, edges, isConnector)) people.add(e.source);
    }
    if (e.source === hubId && edgeKind(e) === 'grey' && !isConnector(e.target)) {
      if (!isSpouse(e.target, edges, isConnector)) people.add(e.target);
    }
  }

  return people;
}

/** Father / tiyos / tiyas on hub-A → only pull in Tiyong 4 (not Grandfather 3). */
function collectPaternalBTiyong4Only(
  edges: Edge[],
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  nodeIds.add(PATERNAL_B_HUB);
  nodeIds.add(PATERNAL_B_CHILD);
  for (const e of edges) {
    if (
      e.source === PATERNAL_B_HUB &&
      e.target === PATERNAL_B_CHILD &&
      edgeKind(e) === 'grey'
    ) {
      edgeIds.add(e.id);
    }
  }
}

function collectGpHubBlood(
  hubId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  nodeIds.add(hubId);

  for (const e of edges) {
    if (e.target === hubId && edgeKind(e) === 'branch' && !isConnector(e.source)) {
      if (isSpouse(e.source, edges, isConnector)) continue;
      nodeIds.add(e.source);
      edgeIds.add(e.id);
    }
  }

  for (const e of edges) {
    if (e.source !== hubId || edgeKind(e) !== 'grey') continue;
    if (isConnector(e.target) || isSpouse(e.target, edges, isConnector)) continue;
    nodeIds.add(e.target);
    edgeIds.add(e.id);
  }
}

/** Sibling ring on a GP hub — offspring only, no grandparents on the hub. */
function collectGpHubRingSiblingsOnly(
  hubId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  nodeIds.add(hubId);
  for (const e of edges) {
    if (e.source !== hubId || edgeKind(e) !== 'grey') continue;
    if (isConnector(e.target) || isSpouse(e.target, edges, isConnector)) continue;
    nodeIds.add(e.target);
    edgeIds.add(e.id);
  }
}

/**
 * One grandparent clicked — only that GP (not their spouse on the same hub),
 * their children, and optionally grandchildren through the branch gateway.
 */
function collectGpHubAsGrandparent(
  hubId: string,
  selectedGpId: string,
  gatewayParentId: string | null,
  expandGrandchildren: boolean,
  edges: Edge[],
  isConnector: (id: string) => boolean,
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  nodeIds.add(hubId);
  nodeIds.add(selectedGpId);

  for (const e of edges) {
    if (
      e.source === selectedGpId &&
      e.target === hubId &&
      edgeKind(e) === 'branch'
    ) {
      edgeIds.add(e.id);
    }
  }

  for (const e of edges) {
    if (e.source !== hubId || edgeKind(e) !== 'grey') continue;
    if (isConnector(e.target) || isSpouse(e.target, edges, isConnector)) continue;
    nodeIds.add(e.target);
    edgeIds.add(e.id);
  }

  if (expandGrandchildren && gatewayParentId && nodeIds.has(gatewayParentId)) {
    collectParentsHubBlood(
      gatewayParentId === 'mother',
      gatewayParentId === 'father',
      edges,
      nodeIds,
      edgeIds,
    );
  }
}

/** GP hub + grandparents + one parent line only (no aunts/uncles/tiyos on the ring). */
function collectGpHubDirectLine(
  hubId: string,
  gatewayParentId: string | null,
  edges: Edge[],
  isConnector: (id: string) => boolean,
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  nodeIds.add(hubId);

  for (const e of edges) {
    if (e.target === hubId && edgeKind(e) === 'branch' && !isConnector(e.source)) {
      if (isSpouse(e.source, edges, isConnector)) continue;
      nodeIds.add(e.source);
      edgeIds.add(e.id);
    }
  }

  if (!gatewayParentId) return;

  nodeIds.add(gatewayParentId);
  for (const e of edges) {
    if (
      e.source === hubId &&
      e.target === gatewayParentId &&
      edgeKind(e) === 'grey'
    ) {
      edgeIds.add(e.id);
    }
  }
}

function collectParentsHubBlood(
  includeMother: boolean,
  includeFather: boolean,
  edges: Edge[],
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  nodeIds.add(PARENTS_HUB);

  if (includeMother) {
    nodeIds.add('mother');
    for (const e of edges) {
      if (
        e.source === 'mother' &&
        e.target === PARENTS_HUB &&
        edgeKind(e) === 'branch'
      ) {
        edgeIds.add(e.id);
      }
    }
  }

  if (includeFather) {
    nodeIds.add('father');
    for (const e of edges) {
      if (
        e.source === 'father' &&
        e.target === PARENTS_HUB &&
        edgeKind(e) === 'branch'
      ) {
        edgeIds.add(e.id);
      }
    }
  }

  for (const e of edges) {
    if (e.source !== PARENTS_HUB || edgeKind(e) !== 'grey') continue;
    if (!BLOOD_MY_GENERATION.has(e.target)) continue;
    nodeIds.add(e.target);
    edgeIds.add(e.id);
  }
}

function exSpouseIdForSibling(siblingId: string, edges: Edge[]) {
  return edges.find((e) => e.target === siblingId && edgeKind(e) === 'faint')?.source;
}

function collectPersonGreyChildren(
  personId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  for (const e of edges) {
    if (e.source !== personId || edgeKind(e) !== 'grey') continue;
    if (isConnector(e.target) || isSpouse(e.target, edges, isConnector)) continue;
    nodeIds.add(e.target);
    edgeIds.add(e.id);
  }
}

/** Cousins (grey children) on a couple hub + the sibling parent — not spouses. */
function collectCoupleHubWithChildren(
  hubId: string,
  siblingId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  nodeIds.add(hubId);
  nodeIds.add(siblingId);

  for (const e of edges) {
    if (e.source === siblingId && e.target === hubId && edgeKind(e) === 'branch') {
      edgeIds.add(e.id);
    }
  }

  for (const e of edges) {
    if (e.source !== hubId || edgeKind(e) !== 'grey') continue;
    if (isConnector(e.target) || e.target === siblingId) continue;
    if (isSpouse(e.target, edges, isConnector)) continue;
    nodeIds.add(e.target);
    edgeIds.add(e.id);
  }
}

function collectExSpouseBranch(
  siblingId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  const exId = exSpouseIdForSibling(siblingId, edges);
  if (!exId) return;
  nodeIds.add(exId);
  for (const e of edges) {
    if (e.source === exId && e.target === siblingId && edgeKind(e) === 'faint') {
      edgeIds.add(e.id);
    }
  }
  collectPersonGreyChildren(exId, edges, isConnector, nodeIds, edgeIds);
}

function coupleHubForPerson(personId: string, edges: Edge[], isConnector: (id: string) => boolean) {
  for (const e of edges) {
    if (e.source !== personId || edgeKind(e) !== 'branch' || !isConnector(e.target)) continue;
    if (isCoupleHub(e.target)) return e.target;
  }
  for (const e of edges) {
    if (e.target !== personId || edgeKind(e) !== 'grey') continue;
    if (isConnector(e.source) && isCoupleHub(e.source)) return e.source;
  }
  return null;
}

function isCousinId(personId: string) {
  return personId.startsWith('cousin-');
}

function gpHubForRingMember(
  personId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
): string | null {
  for (const e of edges) {
    if (e.target !== personId || edgeKind(e) !== 'grey') continue;
    if (isConnector(e.source) && isGpHub(e.source)) return e.source;
  }
  return null;
}

/** 3rd gen cousin: GP ring → parent uncle/aunt → this cousin only → own marriage hub. */
function collectThirdGenCousin(
  cousinId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  const greyIn = edges.find((e) => e.target === cousinId && edgeKind(e) === 'grey');
  if (!greyIn) return;

  const anchor = greyIn.source;

  if (isConnector(anchor) && isCoupleHub(anchor)) {
    const uncleId = edges.find(
      (e) =>
        e.target === anchor &&
        edgeKind(e) === 'branch' &&
        !isConnector(e.source) &&
        !isSpouse(e.source, edges, isConnector),
    )?.source;
    const gpHub = uncleId ? gpHubForRingMember(uncleId, edges, isConnector) : null;
    if (gpHub) collectGpHubBlood(gpHub, edges, isConnector, nodeIds, edgeIds);

    if (uncleId) {
      nodeIds.add(uncleId);
      for (const e of edges) {
        if (e.source === uncleId && e.target === anchor && edgeKind(e) === 'branch') {
          edgeIds.add(e.id);
        }
      }
    }
    nodeIds.add(anchor);
    nodeIds.add(cousinId);
    edgeIds.add(greyIn.id);
  } else {
    const uncleId = edges.find((e) => e.source === anchor && edgeKind(e) === 'faint')?.target;
    const gpHub = uncleId ? gpHubForRingMember(uncleId, edges, isConnector) : null;
    if (gpHub) collectGpHubBlood(gpHub, edges, isConnector, nodeIds, edgeIds);

    if (uncleId) {
      nodeIds.add(uncleId);
      const uncleHub = coupleHubForPerson(uncleId, edges, isConnector);
      if (uncleHub) {
        nodeIds.add(uncleHub);
        for (const e of edges) {
          if (e.source === uncleId && e.target === uncleHub && edgeKind(e) === 'branch') {
            edgeIds.add(e.id);
          }
        }
      }
    }
    nodeIds.add(anchor);
    nodeIds.add(cousinId);
    edgeIds.add(greyIn.id);
    for (const e of edges) {
      if (e.source === anchor && e.target === uncleId && edgeKind(e) === 'faint') {
        edgeIds.add(e.id);
      }
    }
  }

  const ownHub = coupleHubForPerson(cousinId, edges, isConnector);
  if (ownHub && ownHub !== anchor) {
    collectCoupleHubWithChildren(ownHub, cousinId, edges, isConnector, nodeIds, edgeIds);
    collectExSpouseBranch(cousinId, edges, isConnector, nodeIds, edgeIds);
  }
}

/**
 * 2nd-gen on a GP ring: both grandparents (parents), all blood siblings on the hub,
 * optional own children — never their spouse or the other parent on hub-parents.
 */
function collectSecondGenerationOnHub(
  hubId: string,
  selectedId: string,
  gatewayParentId: string | null,
  edges: Edge[],
  isConnector: (id: string) => boolean,
  nodeIds: Set<string>,
  edgeIds: Set<string>,
) {
  collectGpHubBlood(hubId, edges, isConnector, nodeIds, edgeIds);

  const coupleHub = coupleHubForPerson(selectedId, edges, isConnector);
  if (coupleHub) {
    collectCoupleHubWithChildren(coupleHub, selectedId, edges, isConnector, nodeIds, edgeIds);
    collectExSpouseBranch(selectedId, edges, isConnector, nodeIds, edgeIds);
  }

  if (selectedId === gatewayParentId) {
    collectParentsHubBlood(
      gatewayParentId === 'mother',
      gatewayParentId === 'father',
      edges,
      nodeIds,
      edgeIds,
    );
  }
}

function gpHubsAsGrandparent(
  personId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
): string[] {
  const hubs: string[] = [];
  for (const e of edges) {
    if (e.source !== personId || edgeKind(e) !== 'branch' || !isConnector(e.target)) continue;
    if (isGpHub(e.target)) hubs.push(e.target);
  }
  return hubs;
}

function branchesForGpRingMember(
  personId: string,
  edges: Edge[],
  isConnector: (id: string) => boolean,
): BranchDef[] {
  return LINEAGE_BRANCHES.filter((b) =>
    bloodOnFamilyHub(b.rootHubId, edges, isConnector).has(personId),
  );
}

function finalizeEdges(nodeIds: Set<string>, edgeIds: Set<string>, edges: Edge[]) {
  for (const e of edges) {
    if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
      edgeIds.add(e.id);
    }
  }
}

/**
 * Orange path: blood immediate family + grandparents only (no in-law spouses).
 */
export function getImmediateFamily(
  selectedId: string,
  nodes: Node[],
  edges: Edge[],
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const nodeIds = new Set<string>([selectedId]);
  const edgeIds = new Set<string>();
  const { isConnector } = buildIndex(nodes);

  if (isSpouse(selectedId, edges, isConnector)) {
    finalizeEdges(nodeIds, edgeIds, edges);
    return { nodeIds, edgeIds };
  }

  const gpHubs = gpHubsAsGrandparent(selectedId, edges, isConnector);
  const isGrandparent = gpHubs.length > 0;
  const isSelf = BLOOD_MY_GENERATION.has(selectedId);
  const isParent = selectedId === 'mother' || selectedId === 'father';

  if (isSelf) {
    for (const branch of LINEAGE_BRANCHES) {
      collectGpHubDirectLine(
        branch.rootHubId,
        branch.gatewayParentId,
        edges,
        isConnector,
        nodeIds,
        edgeIds,
      );
    }
    collectGpHubDirectLine(PATERNAL_B_HUB, null, edges, isConnector, nodeIds, edgeIds);
    collectParentsHubBlood(true, true, edges, nodeIds, edgeIds);
  } else if (isParent) {
    if (selectedId === 'mother') {
      const branch = LINEAGE_BRANCHES.find((b) => b.id === 'maternal')!;
      collectSecondGenerationOnHub(
        branch.rootHubId,
        'mother',
        'mother',
        edges,
        isConnector,
        nodeIds,
        edgeIds,
      );
    } else {
      const branch = LINEAGE_BRANCHES.find((b) => b.id === 'paternal-a')!;
      collectSecondGenerationOnHub(
        branch.rootHubId,
        'father',
        'father',
        edges,
        isConnector,
        nodeIds,
        edgeIds,
      );
      collectPaternalBTiyong4Only(edges, nodeIds, edgeIds);
    }
  } else if (isGrandparent) {
    for (const hubId of gpHubs) {
      const branch = LINEAGE_BRANCHES.find((b) => b.rootHubId === hubId);
      const expand =
        Boolean(branch) && bloodOnFamilyHub(hubId, edges, isConnector).has(branch!.gatewayParentId);
      collectGpHubAsGrandparent(
        hubId,
        selectedId,
        branch?.gatewayParentId ?? null,
        expand,
        edges,
        isConnector,
        nodeIds,
        edgeIds,
      );
    }
  } else {
    if (isCousinId(selectedId)) {
      collectThirdGenCousin(selectedId, edges, isConnector, nodeIds, edgeIds);
    } else {
      const greyParent = edges.find(
        (e) => e.target === selectedId && edgeKind(e) === 'grey',
      )?.source;
      if (greyParent) {
        let siblingId: string | undefined;
        let coupleHub: string | null = null;

        if (isConnector(greyParent) && isCoupleHub(greyParent)) {
          coupleHub = greyParent;
          siblingId = edges.find(
            (e) =>
              e.target === coupleHub &&
              edgeKind(e) === 'branch' &&
              !isConnector(e.source) &&
              !isSpouse(e.source, edges, isConnector),
          )?.source;
        } else {
          siblingId = edges.find(
            (e) => e.source === greyParent && edgeKind(e) === 'faint',
          )?.target;
        }

        if (siblingId) {
          collectSecondGenerationOnHub(
            'hub-gp-maternal',
            siblingId,
            null,
            edges,
            isConnector,
            nodeIds,
            edgeIds,
          );
          if (coupleHub) {
            collectCoupleHubWithChildren(
              coupleHub,
              siblingId,
              edges,
              isConnector,
              nodeIds,
              edgeIds,
            );
          } else {
            nodeIds.add(siblingId);
            nodeIds.add(greyParent);
            for (const e of edges) {
              if (e.source === greyParent && e.target === siblingId && edgeKind(e) === 'faint') {
                edgeIds.add(e.id);
              }
            }
            collectPersonGreyChildren(
              greyParent,
              edges,
              isConnector,
              nodeIds,
              edgeIds,
            );
          }
        }
        nodeIds.add(selectedId);
      }
    }

    const ringBranches = branchesForGpRingMember(selectedId, edges, isConnector);
    for (const branch of ringBranches) {
      collectSecondGenerationOnHub(
        branch.rootHubId,
        selectedId,
        null,
        edges,
        isConnector,
        nodeIds,
        edgeIds,
      );
    }
    if (selectedId === PATERNAL_B_CHILD) {
      collectGpHubAsGrandparent(
        PATERNAL_B_HUB,
        'grandmother-2',
        null,
        false,
        edges,
        isConnector,
        nodeIds,
        edgeIds,
      );
      collectGpHubRingSiblingsOnly(
        PATERNAL_A_HUB,
        edges,
        isConnector,
        nodeIds,
        edgeIds,
      );
    } else if (isOnPaternalSide(selectedId, edges, isConnector)) {
      if (!ringBranches.some((b) => b.id === 'paternal-a')) {
        collectSecondGenerationOnHub(
          PATERNAL_A_HUB,
          selectedId,
          null,
          edges,
          isConnector,
          nodeIds,
          edgeIds,
        );
      }
      collectPaternalBTiyong4Only(edges, nodeIds, edgeIds);
    }
  }

  finalizeEdges(nodeIds, edgeIds, edges);
  return { nodeIds, edgeIds };
}

/** Direct ancestors through connector hubs (strict tree view). */
export function getAncestryPath(
  selectedId: string,
  nodes: Node[],
  edges: Edge[],
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const nodeIds = new Set<string>([selectedId]);
  const edgeIds = new Set<string>();
  const { isConnector } = buildIndex(nodes);

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
        if (edgeKind(parentEdge) !== 'branch') continue;

        const parentId = parentEdge.source;
        if (isConnector(parentId)) continue;

        edgeIds.add(parentEdge.id);
        nodeIds.add(parentId);
        queue.push(parentId);
      }
    }
  }

  finalizeEdges(nodeIds, edgeIds, edges);
  return { nodeIds, edgeIds };
}

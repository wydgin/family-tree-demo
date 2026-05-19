import type { Node } from '@xyflow/react';

/** Bump when auto-layout changes so stale drag positions are not reapplied. */
export const WEB_LAYOUT_VERSION = 15;
export const WEB_POSITIONS_KEY = 'family-tree-web-positions';
export const WEB_LOCK_KEY = 'family-tree-web-locked';

type PositionRecord = Record<string, { x: number; y: number }>;

type StoredPayload = {
  version: number;
  positions: PositionRecord;
};

export function loadLockState(storageKey = WEB_LOCK_KEY): boolean {
  try {
    return localStorage.getItem(storageKey) === '1';
  } catch {
    return false;
  }
}

export function saveLockState(locked: boolean, storageKey = WEB_LOCK_KEY) {
  try {
    localStorage.setItem(storageKey, locked ? '1' : '0');
  } catch {
    /* private mode */
  }
}

export function loadSavedPositions(storageKey: string): PositionRecord | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      typeof (parsed as StoredPayload).version === 'number'
    ) {
      const stored = parsed as StoredPayload;
      if (stored.version !== WEB_LAYOUT_VERSION) return null;
      return stored.positions ?? null;
    }

    // Legacy flat record — ignore so new layout spacing applies
    return null;
  } catch {
    return null;
  }
}

export function saveNodePositions(nodes: Node[], storageKey: string) {
  const positions: PositionRecord = {};
  for (const node of nodes) {
    positions[node.id] = { x: node.position.x, y: node.position.y };
  }
  const payload: StoredPayload = { version: WEB_LAYOUT_VERSION, positions };
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function mergeSavedPositions<T extends Node>(
  nodes: T[],
  saved: PositionRecord | null,
): T[] {
  if (!saved) return nodes;
  return nodes.map((node) => {
    const pos = saved[node.id];
    return pos ? { ...node, position: { x: pos.x, y: pos.y } } : node;
  });
}

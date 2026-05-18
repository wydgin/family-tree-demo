export type LayoutMode = 'web' | 'spatial';

export type NodePositions = Record<string, { x: number; y: number }>;

/** Compact hub layout — original web view */
export const webPositions: NodePositions = {
  'auntie-4': { x: 40, y: 20 },
  mother: { x: 320, y: 40 },
  father: { x: 520, y: 40 },
  'hub-parents': { x: 418, y: 200 },
  me: { x: 180, y: 320 },
  'brother-1': { x: 340, y: 380 },
  'brother-2': { x: 500, y: 380 },
  'hub-brother-2': { x: 528, y: 520 },
  'sister-in-law': { x: 680, y: 560 },
};

/** Spatial layout — each branch gets more room on the canvas */
export const spatialPositions: NodePositions = {
  'auntie-4': { x: -60, y: 60 },
  mother: { x: 220, y: 0 },
  father: { x: 680, y: 0 },
  'hub-parents': { x: 420, y: 280 },
  me: { x: 20, y: 480 },
  'brother-1': { x: 320, y: 560 },
  'brother-2': { x: 580, y: 560 },
  'hub-brother-2': { x: 620, y: 740 },
  'sister-in-law': { x: 920, y: 780 },
};

export const layoutPositions: Record<LayoutMode, NodePositions> = {
  web: webPositions,
  spatial: spatialPositions,
};

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { Edge, Node, ReactFlowInstance } from '@xyflow/react';

import { loadSavedPositions, mergeSavedPositions } from '../flow/nodePositionStorage';
import { wireFloatingEdges } from './edgeHandles';
import { applyTiyong1RightBranch, layoutFlowerTree } from './flowerLayout';

export function useFlowerLayout(
  initialNodes: Node[],
  initialEdges: Edge[],
  enabled: boolean,
  setNodes: Dispatch<SetStateAction<Node[]>>,
  setEdges: Dispatch<SetStateAction<Edge[]>>,
  fitView: ReactFlowInstance['fitView'],
  fitPadding = 0.22,
  positionsStorageKey?: string,
) {
  const [ready, setReady] = useState(!enabled);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    if (!enabled || ran.current) return;
    ran.current = true;
    setReady(false);

    layoutFlowerTree(initialNodes, initialEdges)
      .then((laid) => {
        const saved = positionsStorageKey
          ? loadSavedPositions(positionsStorageKey)
          : null;
        const merged = mergeSavedPositions(laid, saved);
        setNodes(applyTiyong1RightBranch(merged, initialEdges, saved));
        setEdges(wireFloatingEdges(initialEdges));
        setReady(true);
        setRevision((r) => r + 1);
        const hasSaved = saved && Object.keys(saved).length > 0;
        if (!hasSaved) {
          window.setTimeout(() => {
            void fitView({ padding: fitPadding, duration: 280 });
          }, 60);
        }
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Layout failed');
        setReady(true);
      });
  }, [
    enabled,
    initialNodes,
    initialEdges,
    setNodes,
    setEdges,
    fitView,
    fitPadding,
    positionsStorageKey,
  ]);

  return { ready, error, revision };
}

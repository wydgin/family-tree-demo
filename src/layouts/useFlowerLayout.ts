import { useEffect, useRef, useState } from 'react';
import { useReactFlow, type Edge, type Node } from '@xyflow/react';

import { wireFloatingEdges } from './edgeHandles';
import { layoutFlowerTree } from './flowerLayout';

export function useFlowerLayout(
  initialNodes: Node[],
  initialEdges: Edge[],
  enabled: boolean,
  fitPadding = 0.22,
) {
  const { setNodes, setEdges, fitView } = useReactFlow();
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
        setNodes(laid);
        setEdges(wireFloatingEdges(initialEdges));
        setReady(true);
        setRevision((r) => r + 1);
        window.setTimeout(() => {
          void fitView({ padding: fitPadding, duration: 280 });
        }, 60);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Layout failed');
        setReady(true);
      });
  }, [enabled, initialNodes, initialEdges, setNodes, setEdges, fitView, fitPadding]);

  return { ready, error, revision };
}

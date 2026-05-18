import { useEffect } from 'react';
import { useNodes, useUpdateNodeInternals } from '@xyflow/react';

/** After layout or content changes, sync handle/bounds geometry with React Flow. */
export function RefreshNodeInternals({ revision }: { revision: number }) {
  const updateNodeInternals = useUpdateNodeInternals();
  const nodes = useNodes();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      for (const node of nodes) {
        updateNodeInternals(node.id);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [revision, nodes, updateNodeInternals]);

  return null;
}

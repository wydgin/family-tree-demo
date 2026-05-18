import {
  BaseEdge,
  getBezierPath,
  useStore,
  type EdgeProps,
  type InternalNode,
} from '@xyflow/react';

import { CONNECTOR_SIZE, PERSON_H, PERSON_W } from '../layouts/elkLayout';
import { getFloatingEdgeParams } from '../utils/floatingEdgeParams';

function withFallbackMeasured(node: InternalNode): InternalNode {
  const width =
    node.measured.width || (node.type === 'connector' ? CONNECTOR_SIZE : PERSON_W);
  const height =
    node.measured.height || (node.type === 'connector' ? CONNECTOR_SIZE : PERSON_H);
  return { ...node, measured: { width, height } };
}

/** Edge attaches on the node border toward the other endpoint — any side, not fixed handles. */
export function FloatingFamilyEdge({
  id,
  source,
  target,
  style,
  markerEnd,
  interactionWidth,
}: EdgeProps) {
  const { sourceNode, targetNode } = useStore((s) => ({
    sourceNode: s.nodeLookup.get(source),
    targetNode: s.nodeLookup.get(target),
  }));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getFloatingEdgeParams(
    withFallbackMeasured(sourceNode),
    withFallbackMeasured(targetNode),
  );

  const [path] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
  });

  return (
    <BaseEdge
      id={id}
      path={path}
      style={style}
      markerEnd={markerEnd}
      interactionWidth={interactionWidth}
    />
  );
}

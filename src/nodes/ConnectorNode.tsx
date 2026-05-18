import { useLayoutEffect } from 'react';
import {
  Handle,
  Position,
  useNodeId,
  useUpdateNodeInternals,
  type NodeProps,
} from '@xyflow/react';

export type ConnectorNodeData = {
  variant?: 'primary' | 'branch';
  focused?: boolean;
  dimmed?: boolean;
};

const SIDES = [
  { position: Position.Top, id: 'top' },
  { position: Position.Bottom, id: 'bottom' },
  { position: Position.Left, id: 'left' },
  { position: Position.Right, id: 'right' },
] as const;

export function ConnectorNode({ data }: NodeProps & { data: ConnectorNodeData }) {
  const id = useNodeId();
  const updateNodeInternals = useUpdateNodeInternals();
  const variant = data.variant ?? 'primary';

  useLayoutEffect(() => {
    if (id) updateNodeInternals(id);
  }, [id, variant, updateNodeInternals]);

  const classes = [
    'connector-node',
    `connector-node--${variant}`,
    data.focused && 'connector-node--focused',
    data.dimmed && 'connector-node--dimmed',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {SIDES.map(({ position, id: side }) => (
        <Handle
          key={`in-${side}`}
          type="target"
          position={position}
          id={`${side}-in`}
          className="node-handle"
        />
      ))}
      {SIDES.map(({ position, id: side }) => (
        <Handle
          key={`out-${side}`}
          type="source"
          position={position}
          id={`${side}-out`}
          className="node-handle"
        />
      ))}
      <div className="connector-node__ring" aria-hidden />
    </div>
  );
}

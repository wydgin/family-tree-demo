import { useLayoutEffect } from 'react';
import {
  Handle,
  Position,
  useNodeId,
  useUpdateNodeInternals,
  type NodeProps,
} from '@xyflow/react';

export type PersonGender = 'male' | 'female';

export type PersonNodeData = {
  label: string;
  gender: PersonGender;
  selected?: boolean;
  focused?: boolean;
  dimmed?: boolean;
};

const SIDES = [
  { position: Position.Top, id: 'top' },
  { position: Position.Bottom, id: 'bottom' },
  { position: Position.Left, id: 'left' },
  { position: Position.Right, id: 'right' },
] as const;

export function PersonNode({ data }: NodeProps & { data: PersonNodeData }) {
  const id = useNodeId();
  const updateNodeInternals = useUpdateNodeInternals();

  useLayoutEffect(() => {
    if (id) updateNodeInternals(id);
  }, [id, data.label, updateNodeInternals]);

  const classes = [
    'person-node',
    data.gender === 'male' ? 'person-node--male' : 'person-node--female',
    data.selected && 'person-node--selected',
    data.focused && 'person-node--focused',
    data.dimmed && 'person-node--dimmed',
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
      <span className="person-node__label">{data.label}</span>
    </div>
  );
}

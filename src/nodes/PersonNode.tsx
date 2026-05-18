import { Handle, Position, type NodeProps } from '@xyflow/react';

export type PersonNodeData = {
  label: string;
  highlighted?: boolean;
};

export function PersonNode({ data }: NodeProps & { data: PersonNodeData }) {
  const highlighted = data.highlighted ?? false;

  return (
    <div className={`person-node${highlighted ? ' person-node--highlighted' : ''}`}>
      <Handle type="target" position={Position.Top} className="person-handle" />
      <Handle type="source" position={Position.Bottom} className="person-handle" />
      <Handle type="target" position={Position.Left} id="left" className="person-handle" />
      <Handle type="source" position={Position.Right} id="right" className="person-handle" />
      <span className="person-node__label">{data.label}</span>
    </div>
  );
}

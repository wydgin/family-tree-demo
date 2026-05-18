import { Handle, Position, type NodeProps } from '@xyflow/react';

export type ConnectorNodeData = {
  variant?: 'primary' | 'branch';
};

export function ConnectorNode({ data }: NodeProps & { data: ConnectorNodeData }) {
  const variant = data.variant ?? 'primary';

  return (
    <div className={`connector-node connector-node--${variant}`}>
      <Handle type="target" position={Position.Top} className="connector-handle" />
      <Handle type="source" position={Position.Bottom} className="connector-handle" />
      <Handle type="target" position={Position.Left} id="left" className="connector-handle" />
      <Handle type="source" position={Position.Right} id="right" className="connector-handle" />
      <div className="connector-node__ring" aria-hidden />
    </div>
  );
}

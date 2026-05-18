export type PersonGender = 'male' | 'female';

export type GraphNode = {
  id: string;
  label: string;
  kind: 'person' | 'connector';
  gender?: PersonGender;
  highlighted?: boolean;
  connectorVariant?: 'primary' | 'branch';
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  branch?: boolean;
  faint?: boolean;
};

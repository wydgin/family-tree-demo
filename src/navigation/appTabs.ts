export type AppTab = 'tree' | 'map' | 'insights';

export const APP_TABS = [
  { value: 'tree' as const, label: 'Family tree' },
  { value: 'map' as const, label: 'Map' },
  { value: 'insights' as const, label: 'Insights' },
];

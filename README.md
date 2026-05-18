# Family Tree Demo

Interactive family tree with [React Flow](https://reactflow.dev) and UI styled with [SaasAble Free](https://mui.com/store/items/saasable-free-multipurpose-ui-kit-dashboard/) (MUI theme palette from [phoenixcoded/saasable-ui](https://github.com/phoenixcoded/saasable-ui)).

## Features

- **Connector hubs** — circular joints so each branch keeps its own area
- **Default bezier edges** — animated pink branch lines, thicker strokes
- **Layout modes** — **Web** (compact) and **Spatial** (spread-out zones)
- **SaasAble MUI shell** — AppBar, typography (Figtree), indigo accent

## Run

```bash
npm install
npm run dev
```

## Customize

- `src/data/familyTree.ts` — people, edges, highlights
- `src/layouts/positions.ts` — coordinates for Web vs Spatial layouts
- `src/theme/saasableTheme.ts` — SaasAble color tokens

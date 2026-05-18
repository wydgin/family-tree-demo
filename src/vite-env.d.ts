/// <reference types="vite/client" />

declare module 'elkjs/lib/elk.bundled.js' {
  import type { ElkNode } from 'elkjs';
  export default class ELK {
    layout(graph: ElkNode): Promise<ElkNode>;
  }
}

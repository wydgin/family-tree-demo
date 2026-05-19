/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Local dev: set to "true" in .env.local for save/lock/drag without a passphrase. */
  readonly VITE_TREE_EDIT_ENABLED?: string;
  /** Production: your private unlock phrase (also works as ?edit=phrase in the URL). */
  readonly VITE_TREE_EDIT_PASSPHRASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'elkjs/lib/elk.bundled.js' {
  import type { ElkNode } from 'elkjs';
  export default class ELK {
    layout(graph: ElkNode): Promise<ElkNode>;
  }
}

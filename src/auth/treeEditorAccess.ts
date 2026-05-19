/**
 * Client-side edit gate for tree layout (save / lock / drag).
 * Not strong security — deters casual visitors. Passphrase is embedded in the
 * production bundle if set via VITE_TREE_EDIT_PASSPHRASE; keep the site URL private
 * or use Vercel deployment protection for stricter access.
 */

const SESSION_KEY = 'family-tree-editor-unlocked';
const ENV_EDIT_ENABLED = import.meta.env.VITE_TREE_EDIT_ENABLED === 'true';
const ENV_PASSPHRASE = (import.meta.env.VITE_TREE_EDIT_PASSPHRASE as string | undefined)?.trim() ?? '';

function sessionToken(passphrase: string): string {
  let h = 5381;
  for (let i = 0; i < passphrase.length; i++) {
    h = (h * 33) ^ passphrase.charCodeAt(i);
  }
  return `ft-edit-${(h >>> 0).toString(36)}`;
}

export function isTreeEditorSessionActive(): boolean {
  if (ENV_EDIT_ENABLED) return true;
  if (!ENV_PASSPHRASE) return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) === sessionToken(ENV_PASSPHRASE);
  } catch {
    return false;
  }
}

/** True when unlock UI can be shown (passphrase configured, not always-on dev mode). */
export function canShowEditorUnlock(): boolean {
  return Boolean(ENV_PASSPHRASE) && !ENV_EDIT_ENABLED;
}

export function unlockTreeEditor(passphrase: string): boolean {
  if (ENV_EDIT_ENABLED) return true;
  if (!ENV_PASSPHRASE || passphrase !== ENV_PASSPHRASE) return false;
  try {
    sessionStorage.setItem(SESSION_KEY, sessionToken(ENV_PASSPHRASE));
  } catch {
    /* private mode */
  }
  return true;
}

export function lockTreeEditorSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode */
  }
}

/** Unlock from `?edit=your-passphrase` then strip the query param. */
export function tryUnlockFromUrl(): boolean {
  if (typeof window === 'undefined' || !ENV_PASSPHRASE) return false;
  const params = new URLSearchParams(window.location.search);
  const key = params.get('edit');
  if (!key) return false;
  const ok = unlockTreeEditor(key);
  if (ok) {
    params.delete('edit');
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', next);
  }
  return ok;
}

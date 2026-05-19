import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  canShowEditorUnlock,
  isTreeEditorSessionActive,
  lockTreeEditorSession,
  tryUnlockFromUrl,
  unlockTreeEditor,
} from './treeEditorAccess';

type TreeEditorContextValue = {
  isEditor: boolean;
  canUnlock: boolean;
  unlock: (passphrase: string) => boolean;
  endSession: () => void;
};

const TreeEditorContext = createContext<TreeEditorContextValue | null>(null);

export function TreeEditorProvider({ children }: { children: ReactNode }) {
  const [isEditor, setIsEditor] = useState(() => isTreeEditorSessionActive());

  useEffect(() => {
    if (tryUnlockFromUrl()) setIsEditor(true);
  }, []);

  const unlock = useCallback((passphrase: string) => {
    const ok = unlockTreeEditor(passphrase);
    if (ok) setIsEditor(true);
    return ok;
  }, []);

  const endSession = useCallback(() => {
    lockTreeEditorSession();
    setIsEditor(false);
  }, []);

  const value = useMemo(
    () => ({
      isEditor,
      canUnlock: canShowEditorUnlock(),
      unlock,
      endSession,
    }),
    [isEditor, unlock, endSession],
  );

  return <TreeEditorContext.Provider value={value}>{children}</TreeEditorContext.Provider>;
}

export function useTreeEditor(): TreeEditorContextValue {
  const ctx = useContext(TreeEditorContext);
  if (!ctx) {
    throw new Error('useTreeEditor must be used within TreeEditorProvider');
  }
  return ctx;
}

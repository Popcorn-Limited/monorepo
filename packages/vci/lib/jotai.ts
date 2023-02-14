import { useMemo } from "react";
import { useAtom, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/**
 * Jotai aware - persistent hook
 * @param scopeOrId LocalStorage scope to store content.
 * When undefined data is in memory stored using useState.
 */
export const usePersistentAtom = <T>(scopeOrId: string | undefined, initialValue?: T) => {
  const persistentAtom = useMemo(() => {
    if (scopeOrId) return atomWithStorage(`popcorn.netowrk.${scopeOrId}`, initialValue as T);
    return atom(initialValue as T);
  }, [scopeOrId]);

  return useAtom(persistentAtom);
};

// ============================================================
// lib/cache.ts — cache curto das buscas de tarefa
//
// Por que existe: a board mais pesada precisa de várias chamadas ao
// ClickUp para montar a lista. Sem cache, trocar de board e voltar
// refazia tudo. Com ele, a volta é instantânea.
//
// Por que é curto (45s): o ClickUp continua sendo a fonte da verdade.
// Um cache longo faria o hub mostrar estado velho — exatamente o que
// o CLAUDE.md proíbe. Além do tempo, toda escrita invalida a lista
// afetada na hora, então o que o próprio time faz aparece na hora.
// ============================================================

import type { ClickUpTask } from "./types";

interface CacheEntry {
  tasks: ClickUpTask[];
  truncated: boolean;
  requests: number;
  storedAt: number;
}

const TTL_MS = 45_000;
const store = new Map<string, CacheEntry>();

export function readCache(key: string): CacheEntry | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.storedAt > TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry;
}

export function writeCache(
  key: string,
  value: Omit<CacheEntry, "storedAt">
): void {
  store.set(key, { ...value, storedAt: Date.now() });
}

/** Chamado por toda escrita: a lista afetada volta a ser buscada do zero. */
export function invalidateList(listId: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(`${listId}:`)) store.delete(key);
  }
}

export function cacheAgeMs(key: string): number | null {
  const entry = store.get(key);
  return entry ? Date.now() - entry.storedAt : null;
}

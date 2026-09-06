/**
 * Framework-agnostic localStorage store, shared by the React hook and the Vue
 * composable. One store per key, so every subscriber reading that key sees
 * the same value regardless of which framework mounted first.
 */
export const MISSING = Symbol('missing')
export type Stored<T> = T | typeof MISSING

export interface LocalStore<T> {
  getSnapshot: () => Stored<T>
  subscribe: (listener: () => void) => () => void
  write: (raw: string | null) => void
}

const stores = new Map<string, LocalStore<unknown>>()

function createStore<T>(key: string): LocalStore<T> {
  const listeners = new Set<() => void>()
  let cachedRaw: string | null = null
  let cachedValue: Stored<T> = MISSING

  const read = () => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  }

  const parse = (raw: string | null): Stored<T> => {
    if (raw === null) return MISSING
    try {
      return JSON.parse(raw) as T
    } catch {
      return MISSING
    }
  }

  return {
    // Cached by raw string, so an unchanged store returns an identical
    // snapshot and callers relying on referential equality don't loop.
    getSnapshot() {
      const raw = read()
      if (raw !== cachedRaw) {
        cachedRaw = raw
        cachedValue = parse(raw)
      }
      return cachedValue
    },
    subscribe(listener) {
      listeners.add(listener)
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) listener()
      }
      window.addEventListener('storage', onStorage)
      return () => {
        listeners.delete(listener)
        window.removeEventListener('storage', onStorage)
      }
    },
    write(raw) {
      try {
        if (raw === null) window.localStorage.removeItem(key)
        else window.localStorage.setItem(key, raw)
      } catch {
        /* storage full or blocked — the snapshot below keeps the UI working */
      }
      cachedRaw = raw
      cachedValue = parse(raw)
      listeners.forEach((listener) => listener())
    },
  }
}

export function storeFor<T>(key: string): LocalStore<T> {
  const existing = stores.get(key) as LocalStore<T> | undefined
  if (existing) return existing
  const created = createStore<T>(key)
  stores.set(key, created as LocalStore<unknown>)
  return created
}

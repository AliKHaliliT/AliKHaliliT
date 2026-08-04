// Minimal in-memory localStorage for node-environment tests.
// Install with `installLocalStorageMock()` in a beforeEach; state resets per call.

/**
 * Replaces `globalThis.localStorage` with an in-memory stand-in.
 *
 * @returns The backing map, so a suite can seed or inspect storage directly.
 *
 * @example
 * ```ts
 * let store: Map<string, string>
 * beforeEach(() => { store = installLocalStorageMock() })
 * ```
 */
export function installLocalStorageMock(): Map<string, string> {
  const store = new Map<string, string>();
  const mock = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: mock,
    configurable: true,
    writable: true,
  });
  return store;
}

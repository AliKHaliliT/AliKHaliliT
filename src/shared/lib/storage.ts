// Guarded localStorage writes. A full or unavailable store (QuotaExceededError,
// private-mode restrictions) surfaces as a console error plus a one-time alert
// instead of an unhandled throw that silently aborts the save flow.

let warned = false;

/**
 * Writes one localStorage key without letting a failure escape.
 *
 * @param key - The storage key to write.
 * @param value - The already-serialized value.
 *
 * @returns True when the write landed, false when storage refused it.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    warned = false;
    return true;
  } catch (e) {
    console.error(`Failed to write localStorage key "${key}"`, e);
    if (!warned) {
      warned = true;
      alert(
        "Saving failed: browser storage is full or unavailable. Your latest change was not persisted."
      );
    }
    return false;
  }
}

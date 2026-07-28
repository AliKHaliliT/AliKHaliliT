/**
 * Platform sniffing for display labels only. Behavior is always
 * cross-platform (the search shortcut accepts both Ctrl and ⌘: see
 * SearchModal's key handler); this only decides which glyph to show.
 */
export function isMacLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } })
    .userAgentData;
  const platform = uaData?.platform || navigator.platform || "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** "⌘K" on Apple platforms, "Ctrl K" everywhere else. */
export const searchShortcutLabel = () => (isMacLike() ? "⌘K" : "Ctrl K");

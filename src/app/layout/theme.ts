import { useState, useEffect } from "react";

const applyTheme = (dark: boolean) =>
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");

/**
 * The theme, read from storage or the system preference and written to the root.
 *
 * The stored choice wins over the system preference, since an explicit pick
 * should survive a change of operating-system setting. The flip runs inside a
 * view transition where the browser supports one, which is why the attribute is
 * set synchronously rather than in an effect.
 *
 * @returns Whether the dark theme is active, and the toggle that flips it.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    applyTheme(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    // Full-page crossfade via the View Transition API (timing lives in
    // index.css under ::view-transition). The class flip must run
    // synchronously inside the snapshot callback; browsers without the API
    // and reduced-motion visitors get the instant switch.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !reduced) {
      doc.startViewTransition(() => {
        applyTheme(next);
        setIsDark(next);
      });
    } else {
      setIsDark(next);
    }
  };

  return { isDark, toggleTheme };
}

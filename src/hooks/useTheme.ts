import { useState, useEffect } from "react";

const applyClass = (dark: boolean) =>
  document.documentElement.classList.toggle("dark", dark);

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
    applyClass(isDark);
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
        applyClass(next);
        setIsDark(next);
      });
    } else {
      setIsDark(next);
    }
  };

  return { isDark, toggleTheme };
}

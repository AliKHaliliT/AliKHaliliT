import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import { ChevronDown, Menu, Moon, Search, Sun, X } from "lucide-react";
import { NavGroup } from "@/shared/config";
import { useVisibleNav } from "./useVisibleNav";
import { useTheme } from "./theme";
import { useScrollLock, searchShortcutLabel, cn } from "@/shared/lib";
import { useSiteIdentity } from "@/entities/site";

const openSearch = () => document.dispatchEvent(new Event("open-search"));

/** Brand pixel-mark: a 3×2 mosaic in ink + field + pulse. */
const PixelMark = () => (
  <span className="grid grid-cols-3 gap-[1.5px]" aria-hidden="true">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <i
        key={i}
        className={cn(
          "h-1 w-1",
          i === 1 ? "bg-field" : i === 5 ? "bg-pulse" : "bg-ink"
        )}
      />
    ))}
  </span>
);

const labeledGroups = (all: NavGroup[]) =>
  all.filter(
    (g): g is NavGroup & { label: string } => Boolean(g.label) && !g.separator
  );

/** Mobile-index entrance: each block rises in behind a small stagger. */
const INDEX_ITEM = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.2, 0.7, 0.2, 1] as const } },
};

/**
 * The dossier top bar: brand, grouped nav dropdowns, the command palette
 * trigger, and the theme toggle. On small screens the groups collapse into
 * a full-screen mono index.
 */
export const TopBar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  // One dropdown open at a time: a single owner state means a sibling can
  // never stay latched open (the old CSS hover/focus-within approach could).
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const { pathname } = useLocation();
  const site = useSiteIdentity();
  const groups = labeledGroups(useVisibleNav());

  // Close the mobile index and any dropdown on navigation (render-time adjustment).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setOpenGroup(null);
  }

  useScrollLock(menuOpen);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openNow = (label: string) => {
    cancelClose();
    setOpenGroup(label);
  };
  // Grace delay so the pointer can cross from trigger to panel.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpenGroup(null), 130);
  };
  useEffect(() => cancelClose, []);

  // Escape or a press outside the nav dismisses the open dropdown.
  useEffect(() => {
    if (!openGroup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroup(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openGroup]);

  return (
    <>
    {/* The index panel must stay OUTSIDE this header: backdrop-filter turns
        the header into the containing block for fixed descendants, which
        would trap a fixed inset-0 panel inside the 56px bar. */}
    <header className="sticky top-0 z-40 border-b border-dashed border-line bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-5 px-5">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-ink"
        >
          <PixelMark />
          <span className="whitespace-nowrap">{site.name}</span>
        </Link>

        <nav
          ref={navRef}
          className="ml-auto hidden items-center gap-1 lg:flex"
          aria-label="Primary"
          onBlur={(e) => {
            // Tabbing out of the nav closes whatever is open.
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenGroup(null);
          }}
        >
          {groups.map((group) => {
            const isOpen = openGroup === group.label;
            return (
              <div
                key={group.label}
                className="relative"
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") openNow(group.label);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") scheduleClose();
                }}
              >
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                    isOpen ? "text-signal" : "text-muted hover:text-signal"
                  )}
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                >
                  {group.label}
                  <ChevronDown
                    size={12}
                    aria-hidden="true"
                    className={cn("transition-transform duration-150", isOpen && "rotate-180")}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <m.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 3, scale: 0.99 }}
                      transition={{ duration: 0.16, ease: [0.2, 0.7, 0.2, 1] }}
                      style={{ transformOrigin: "top right" }}
                      className="absolute right-0 top-full min-w-52 rounded-card border border-line-strong bg-card p-1.5 shadow-overlay"
                    >
                      {group.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpenGroup(null)}
                          className={cn(
                            "flex items-center gap-2.5 rounded-ctl px-3 py-2 text-sm transition-[color,background-color,transform] duration-150 hover:translate-x-0.5",
                            pathname === item.path
                              ? "bg-surface text-signal"
                              : "text-ink hover:bg-surface hover:text-signal"
                          )}
                        >
                          <item.icon size={14} className="text-muted" />
                          {item.label}
                        </Link>
                      ))}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <button
          onClick={openSearch}
          className="ml-auto flex items-center gap-2 rounded-ctl border border-line-strong px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted transition-[color,border-color,transform] duration-150 hover:border-signal hover:text-signal active:scale-95 lg:ml-1"
          aria-label="Open search"
        >
          <Search size={12} />
          <span className="hidden sm:inline">{searchShortcutLabel()}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-line-strong text-muted transition-[color,border-color,transform] duration-150 hover:border-signal hover:text-signal active:scale-90"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={isDark ? "sun" : "moon"}
              initial={{ rotate: -50, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 50, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
              className="flex"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </m.span>
          </AnimatePresence>
        </button>

        <button
          onClick={() => setMenuOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-ctl border border-line-strong text-ink transition-transform duration-150 active:scale-90 lg:hidden"
          aria-label="Open site index"
        >
          <Menu size={15} />
        </button>
      </div>
    </header>

    {/* Mobile index: the full dossier table of contents. */}
    <AnimatePresence>
        {menuOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-surface lg:hidden"
          >
            <div className="mx-auto max-w-[1180px] px-5">
              <div className="flex h-14 items-center justify-between border-b border-dashed border-line">
                <span className="flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.12em]">
                  <PixelMark /> Index
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-ctl border border-line-strong"
                  aria-label="Close site index"
                >
                  <X size={15} />
                </button>
              </div>
              <m.nav
                className="grid gap-8 py-8 sm:grid-cols-2"
                aria-label="Site index"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } }}
              >
                <m.div variants={INDEX_ITEM}>
                  <Link
                    to="/"
                    className="font-serif text-2xl font-semibold tracking-[-0.02em] text-ink"
                  >
                    Home
                  </Link>
                </m.div>
                {groups.map((group) => (
                  <m.div key={group.label} variants={INDEX_ITEM}>
                    <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-signal">
                      {group.label}
                    </p>
                    <div className="grid gap-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="py-1 font-serif text-xl tracking-[-0.01em] text-ink transition-colors hover:text-signal"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </m.div>
                ))}
              </m.nav>
            </div>
          </m.div>
        )}
    </AnimatePresence>
    </>
  );
};

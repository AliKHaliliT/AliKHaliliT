import { useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useScrollLock } from "@/lib/useScrollLock";
import { cn } from "@/lib/utils";

/**
 * The one modal. Dialog semantics, Escape to close, focus moves in on
 * open and returns to the trigger on close.
 */
export const Modal = ({
  isOpen,
  onClose,
  label,
  children,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Accessible name for the dialog */
  label: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      lastFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "custom-scrollbar relative max-h-[90vh] w-full max-w-2xl overflow-y-auto",
              "rounded-card border border-[var(--color-border)] bg-[var(--color-card)] shadow-overlay",
              // The panel takes programmatic focus on open; the global
              // :focus-visible ring is for tabbable controls, not the shell.
              "outline-none focus:outline-none focus-visible:outline-none",
              className
            )}
          >
            {children}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};

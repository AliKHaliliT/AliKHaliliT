/** The site chrome: everything that surrounds a route's content. */

import type { ReactNode } from "react";
import { AmbientField } from "@/shared/ui";
import { SearchModal } from "@/features/search";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";

/**
 * Draws the dossier shell around whatever the router renders.
 *
 * @param props - Standard children; the routed content for the rail.
 *
 * @returns The full page frame with the given content inside the rail.
 */
export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-surface font-sans text-ink">
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-ctl focus:border focus:border-signal focus:bg-card focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.1em] focus:text-signal"
    >
      Skip to content
    </a>
    {/* Ambient stratum: a fixed constellation drifting in the wide-screen
        gutters either side of the rail. Content paints above it. */}
    <AmbientField
      variant="rails"
      className="fixed inset-0 z-0 hidden min-[1400px]:block"
    />
    <TopBar />
    {/* The dossier rail: content sits between dashed hairlines. */}
    <main
      id="main"
      tabIndex={-1}
      className="relative mx-auto min-h-[70vh] max-w-[1180px] border-line px-5 pb-6 pt-8 md:border-x md:border-dashed"
    >
      {children}
    </main>
    <Footer />
    <SearchModal />
  </div>
);

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "framer-motion";
import { ContentProvider } from "@/context/ContentContext";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { AmbientField } from "@/components/ui/AmbientField";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { TitleSync } from "@/components/layout/TitleSync";
import { NotFound } from "@/pages/NotFound";
import { SearchModal } from "@/components/SearchModal";
import { Dashboard } from "@/pages/Dashboard";
import { Projects } from "@/pages/Projects";
import { Library } from "@/pages/Library";
import { Travel } from "@/pages/Travel";
import { TravelCountry, TravelCity } from "@/pages/TravelDetail";
import { Garden } from "@/pages/Garden";
import { GardenPost } from "@/pages/GardenPost";
import { Blog } from "@/pages/Blog";
import { BlogPost } from "@/pages/BlogPost";
import { Updates } from "@/pages/Updates";
import { Experience } from "@/pages/Experience";
import { EducationPage } from "@/pages/EducationPage";
import { Awards } from "@/pages/Awards";
import { Publications } from "@/pages/Publications";
import { Speaking } from "@/pages/Speaking";
import { Volunteering } from "@/pages/Volunteering";
import { SkillsPage } from "@/pages/SkillsPage";
import { Certificates } from "@/pages/Certificates";
import { References } from "@/pages/References";
import { Interests } from "@/pages/Interests";
import { Organizations } from "@/pages/Organizations";

/**
 * Route swap choreography: the leaving page settles out, the arriving one
 * rises in. Only the wrapper itself skips animating on first paint; the
 * pages' own entrance animations run. An `initial={false}` on AnimatePresence
 * would suppress mount animations for every motion descendant of the first
 * render instead, which froze looping ornaments at their final keyframe in
 * production (dev hid it because StrictMode's double mount re-triggered
 * them). Honors MotionConfig reducedMotion="user".
 */
const RouteTransitions = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // First-paint detection without refs or effects: the landing pathname is
  // captured once, and the first navigation away locks hasNavigated via the
  // adjust-state-during-render pattern. Only the very first wrapper renders
  // with initial=false.
  const [initialPath] = useState(() => location.pathname);
  const [hasNavigated, setHasNavigated] = useState(false);
  if (!hasNavigated && location.pathname !== initialPath) setHasNavigated(true);
  const firstPaint = !hasNavigated && location.pathname === initialPath;
  return (
    <AnimatePresence mode="wait">
      <m.div
        key={location.pathname}
        initial={firstPaint ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  return (
    <RouteTransitions>
      <Routes location={location}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/library" element={<Library />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="/travel/country/:slug" element={<TravelCountry />} />
        <Route path="/travel/city/:slug" element={<TravelCity />} />
        <Route path="/garden" element={<Garden />} />
        <Route path="/garden/:slug" element={<GardenPost />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/speaking" element={<Speaking />} />
        <Route path="/volunteering" element={<Volunteering />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/uses" element={<Navigate to="/skills" replace />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/references" element={<References />} />
        <Route path="/interests" element={<Interests />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RouteTransitions>
  );
};

export default function App() {
  return (
    // LazyMotion + `m` components keep framer-motion's full runtime out of
    // the main bundle (domAnimation feature set; no layout/drag animations
    // are used). `strict` throws if a plain `motion.` slips back in.
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
      <ContentProvider>
        {/* Vite's base only rewrites asset URLs; the router must be told the
            same base or a project-pages deploy (/VITA/) renders NotFound for
            every route, including home. BASE_URL is "/" in dev. */}
        <Router basename={import.meta.env.BASE_URL}>
          <ScrollToTop />
          <TitleSync />
          <div className="min-h-screen bg-[var(--color-background)] font-sans text-[var(--color-text-primary)]">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-ctl focus:border focus:border-signal focus:bg-[var(--color-card)] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.1em] focus:text-signal"
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
              className="relative mx-auto min-h-[70vh] max-w-[1180px] border-[var(--color-border)] px-5 pb-6 pt-8 md:border-x md:border-dashed"
            >
              <AppRoutes />
            </main>
            <Footer />
            <SearchModal />
          </div>
        </Router>
      </ContentProvider>
    </MotionConfig>
    </LazyMotion>
  );
}

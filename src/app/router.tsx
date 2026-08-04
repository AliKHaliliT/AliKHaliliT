/**
 * The route table and the choreography between routes.
 *
 * Paths are declared here once. Their labels, grouping, and order in the site
 * map live in `shared/config/nav`, which the chrome reads.
 */

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import { env } from "@/shared/config";
import { NotFoundPage } from "@/pages/not-found";
import { DashboardPage } from "@/pages/dashboard";
import { ProjectsPage } from "@/pages/projects";
import { LibraryPage } from "@/pages/library";
import { TravelPage } from "@/pages/travel";
import { TravelCountryPage, TravelCityPage } from "@/pages/travel-detail";
import { GardenPage } from "@/pages/garden";
import { GardenPostPage } from "@/pages/garden-post";
import { BlogPage } from "@/pages/blog";
import { BlogPostPage } from "@/pages/blog-post";
import { UpdatesPage } from "@/pages/updates";
import { ExperiencePage } from "@/pages/experience";
import { EducationPage } from "@/pages/education";
import { AwardsPage } from "@/pages/awards";
import { PublicationsPage } from "@/pages/publications";
import { SpeakingPage } from "@/pages/speaking";
import { VolunteeringPage } from "@/pages/volunteering";
import { SkillsPage } from "@/pages/skills";
import { CertificatesPage } from "@/pages/certificates";
import { ReferencesPage } from "@/pages/references";
import { InterestsPage } from "@/pages/interests";
import { OrganizationsPage } from "@/pages/organizations";
import { AppLayout } from "./layout/AppLayout";
import { ScrollToTop } from "./layout/ScrollToTop";
import { TitleSync } from "./layout/TitleSync";

/**
 * Route swap choreography: the leaving page settles out, the arriving one
 * rises in. Only the wrapper itself skips animating on first paint; the
 * pages' own entrance animations run. An `initial={false}` on AnimatePresence
 * would suppress mount animations for every motion descendant of the first
 * render instead, which froze looping ornaments at their final keyframe in
 * production (dev hid it because StrictMode's double mount re-triggered
 * them). Honors MotionConfig reducedMotion="user".
 *
 * @param props - Standard children; the routed content to animate.
 *
 * @returns The children inside the transition wrapper.
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

/**
 * Maps every path to its page.
 *
 * @returns The routed content for the current location.
 */
const AppRoutes = () => {
  const location = useLocation();
  return (
    <RouteTransitions>
      <Routes location={location}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/travel" element={<TravelPage />} />
        <Route path="/travel/country/:slug" element={<TravelCountryPage />} />
        <Route path="/travel/city/:slug" element={<TravelCityPage />} />
        <Route path="/garden" element={<GardenPage />} />
        <Route path="/garden/:slug" element={<GardenPostPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/awards" element={<AwardsPage />} />
        <Route path="/publications" element={<PublicationsPage />} />
        <Route path="/speaking" element={<SpeakingPage />} />
        <Route path="/volunteering" element={<VolunteeringPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/uses" element={<Navigate to="/skills" replace />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/references" element={<ReferencesPage />} />
        <Route path="/interests" element={<InterestsPage />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </RouteTransitions>
  );
};

/**
 * The router, its per-navigation side effects, and the chrome it renders into.
 *
 * @returns The routed site below the configured base path.
 */
export const AppRouter = () => (
  <Router basename={env.baseUrl}>
    <ScrollToTop />
    <TitleSync />
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  </Router>
);

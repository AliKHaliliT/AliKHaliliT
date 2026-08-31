// Page-header descriptions are owner voice, so they must be editable: the
// values here are only the template's fallbacks. Overrides live in the site
// identity's `pageCopy` record (Admin, Settings, Site identity, Page copy),
// keyed by the page names below.

import { useSiteIdentity } from "./identity";

/** The default one-line description under each page's title, keyed per page. */
export const PAGE_COPY: Record<string, { label: string; fallback: string }> = {
  experience: { label: "Experience", fallback: "Where I've worked and what I shipped." },
  education: { label: "Education", fallback: "Degrees, certifications, and continued learning." },
  skills: { label: "Skills", fallback: "The working toolkit: what I build with, day to day." },
  awards: { label: "Awards", fallback: "Awards, scholarships, grants, and honors." },
  certificates: { label: "Certificates", fallback: "Professional and technical credentials." },
  publications: { label: "Publications", fallback: "Research papers, conference talks, and academic writing." },
  speaking: { label: "Speaking", fallback: "Talks, podcasts, workshops, and panels." },
  volunteering: { label: "Volunteering", fallback: "Open source contributions, community service, and mentorship." },
  organizations: { label: "Organizations", fallback: "Professional and academic memberships." },
  references: { label: "References", fallback: "People who can speak to my work." },
  projects: { label: "Projects", fallback: "A collection of work I'm proud of." },
  blog: { label: "Blog", fallback: "Long-form writing on things I find interesting." },
  garden: { label: "Garden", fallback: "Thoughts, ideas, and essays that grow over time." },
  updates: { label: "Updates", fallback: "Notes, links, and milestones: a running log of what I'm thinking about." },
  library: { label: "Library", fallback: "Everything taken in and queued up: books, films, series, and games." },
  interests: { label: "Interests", fallback: "Hobbies and pursuits outside of work." },
  travel: { label: "Travel", fallback: "Countries and cities I've explored." },
};

/** The page description in effect: the owner's override, else the fallback. */
export function usePageDescription(key: keyof typeof PAGE_COPY): string {
  const site = useSiteIdentity();
  return site.pageCopy?.[key]?.trim() || PAGE_COPY[key]?.fallback || "";
}

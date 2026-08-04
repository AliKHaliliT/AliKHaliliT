import { useMemo } from "react";
import { NAV_GROUPS, NavGroup } from "@/shared/config";
import { useContent } from "@/entities/record";

/**
 * The site map, minus what has nothing in it: a section with no content
 * disappears from the navigation and the footer instead of leading a
 * visitor to an empty page. Direct URLs still resolve (the pages keep
 * their empty states); this only governs what is advertised.
 */
export function useVisibleNav(): NavGroup[] {
  const {
    settings, experience, education, courses, awards, certificates,
    publications, speaking, volunteering, organizations, references,
    projects, blog, posts, updates, books, interests, trips, countries,
  } = useContent();

  return useMemo(() => {
    const counts: Record<string, number> = {
      "/experience": experience.length,
      "/education": education.length + courses.length,
      "/skills":
        (settings.skills?.trim() || settings.languages?.trim() || settings.uses?.trim())
          ? 1
          : 0,
      "/awards": awards.length,
      "/certificates": certificates.length,
      "/publications": publications.length,
      "/speaking": speaking.length,
      "/volunteering": volunteering.length,
      "/organizations": organizations.length,
      "/references": references.length,
      "/projects": projects.length,
      "/blog": blog.length,
      "/garden": posts.length,
      "/updates": updates.length,
      "/library": books.length,
      "/interests": interests.length,
      "/travel": trips.length + countries.length,
    };
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => (counts[item.path] ?? 1) > 0),
    })).filter((group) => group.items.length > 0);
  }, [
    settings, experience, education, courses, awards, certificates,
    publications, speaking, volunteering, organizations, references,
    projects, blog, posts, updates, books, interests, trips, countries,
  ]);
}

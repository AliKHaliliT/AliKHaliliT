import React from "react";
import {
  LayoutDashboard,
  FolderOpen,
  BookOpen,
  Plane,
  Sprout,
  FileText,
  Zap,
  Briefcase,
  GraduationCap,
  Trophy,
  BookMarked,
  Mic2,
  Heart,
  Wrench,
  BadgeCheck,
  Users,
  Building2,
  Smile,
} from "lucide-react";

export type NavItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
};
export type NavGroup = { label?: string; separator?: boolean; items: NavItem[] };

/**
 * The site map. Shared by the Sidebar (navigation) and the GroundTrack
 * (the header track encodes each page's position along this list).
 * Grouping and labels only: routes are defined in App.tsx.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ icon: LayoutDashboard, label: "Home", path: "/" }],
  },
  {
    label: "Career",
    items: [
      { icon: Briefcase, label: "Experience", path: "/experience" },
      { icon: GraduationCap, label: "Education", path: "/education" },
      { icon: Wrench, label: "Skills", path: "/skills" },
      { icon: Trophy, label: "Awards", path: "/awards" },
      { icon: BadgeCheck, label: "Certificates", path: "/certificates" },
      { icon: BookMarked, label: "Publications", path: "/publications" },
      { icon: Mic2, label: "Speaking", path: "/speaking" },
      { icon: Heart, label: "Volunteering", path: "/volunteering" },
      { icon: Building2, label: "Organizations", path: "/organizations" },
      { icon: Users, label: "References", path: "/references" },
      { icon: FolderOpen, label: "Projects", path: "/projects" },
    ],
  },
  {
    label: "Writing",
    items: [
      { icon: FileText, label: "Blog", path: "/blog" },
      { icon: Sprout, label: "Garden", path: "/garden" },
      { icon: Zap, label: "Updates", path: "/updates" },
    ],
  },
  {
    label: "Life",
    items: [
      { icon: BookOpen, label: "Library", path: "/library" },
      { icon: Smile, label: "Interests", path: "/interests" },
      { icon: Plane, label: "Travel", path: "/travel" },
    ],
  },
];

/** Public pages in site order (separator groups have no track position). */
const PUBLIC_NAV_ITEMS: NavItem[] = NAV_GROUPS.filter(
  (g) => !g.separator
).flatMap((g) => g.items);

/**
 * Fractional tick positions of group boundaries along the track
 * (excluding the ends).
 */
export const TRACK_TICKS: number[] = (() => {
  const ticks: number[] = [];
  let count = 0;
  for (const group of NAV_GROUPS.filter((g) => !g.separator)) {
    count += group.items.length;
    if (count < PUBLIC_NAV_ITEMS.length) ticks.push(count / PUBLIC_NAV_ITEMS.length);
  }
  return ticks;
})();

/**
 * Label of the page owning a pathname (sub-routes resolve to their parent).
 * Home returns null so the document title stays the bare site title.
 */
export function pageLabel(pathname: string): string | null {
  const all = NAV_GROUPS.flatMap((g) => g.items);
  const exact = all.find((item) => item.path === pathname);
  if (exact) return exact.path === "/" ? null : exact.label;
  const parent = all.find(
    (item) => item.path !== "/" && pathname.startsWith(item.path + "/")
  );
  return parent ? parent.label : null;
}

/**
 * Position of a pathname along the site map, 0..1.
 * Sub-routes (/blog/:slug) resolve to their parent's position.
 */
export function trackPosition(pathname: string): number {
  const n = PUBLIC_NAV_ITEMS.length;
  let idx = PUBLIC_NAV_ITEMS.findIndex((item) =>
    item.path === "/" ? pathname === "/" : pathname === item.path
  );
  if (idx === -1) {
    idx = PUBLIC_NAV_ITEMS.findIndex(
      (item) => item.path !== "/" && pathname.startsWith(item.path + "/")
    );
  }
  return idx === -1 ? 0.5 / n : (idx + 0.5) / n;
}

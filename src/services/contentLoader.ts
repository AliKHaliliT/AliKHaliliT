import frontMatter from "front-matter";
import { AnyContentItem, ContentType, UserSettings } from "@/types/content";

type GlobResult = Record<string, unknown>;

const files: Record<ContentType, GlobResult> = {
  projects: import.meta.glob("@/content/projects/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  posts: import.meta.glob("@/content/garden/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  books: import.meta.glob("@/content/books/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  // Trips now live under travel/cities/
  trips: import.meta.glob("@/content/travel/cities/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  countries: import.meta.glob("@/content/travel/countries/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  courses: import.meta.glob("@/content/courses/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  blog: import.meta.glob("@/content/blog/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  updates: import.meta.glob("@/content/updates/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  experience: import.meta.glob("@/content/experience/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  education: import.meta.glob("@/content/education/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  awards: import.meta.glob("@/content/awards/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  publications: import.meta.glob("@/content/publications/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  speaking: import.meta.glob("@/content/speaking/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  volunteering: import.meta.glob("@/content/volunteering/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  certificates: import.meta.glob("@/content/certificates/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  references: import.meta.glob("@/content/references/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  interests: import.meta.glob("@/content/interests/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  organizations: import.meta.glob("@/content/organizations/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  settings: import.meta.glob("@/content/settings/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
};

type Frontmatter = Record<string, unknown>;

// Newest-first sort per type: which frontmatter field orders the list, and
// whether it holds a date string or a bare year.
const SORT_SPECS: Partial<
  Record<ContentType, { field: string; kind: "date" | "year" }>
> = {
  updates: { field: "date", kind: "date" },
  blog: { field: "date", kind: "date" },
  awards: { field: "date", kind: "date" },
  speaking: { field: "date", kind: "date" },
  certificates: { field: "date", kind: "date" },
  experience: { field: "startDate", kind: "date" },
  education: { field: "startDate", kind: "date" },
  volunteering: { field: "startDate", kind: "date" },
  organizations: { field: "startDate", kind: "date" },
  publications: { field: "year", kind: "year" },
  // Capped previews (home runner-ups, "last logged" cells) must surface the
  // newest entries, so these lists are recency-ordered too; undated items
  // sort as 0 and close the list.
  projects: { field: "year", kind: "year" },
  trips: { field: "date", kind: "date" },
  posts: { field: "date", kind: "date" },
  courses: { field: "date", kind: "date" },
};

export function loadInitialData(type: ContentType): AnyContentItem[] {
  const typeFiles = files[type];
  if (!typeFiles) return [];

  const parsedItems: Frontmatter[] = Object.entries(typeFiles).map(
    ([path, content]) => {
      const raw = String(content);
      const { attributes, body } = frontMatter<Frontmatter>(raw);
      const slug = path.split("/").pop()?.replace(".md", "") || "";

      return {
        id: attributes.id || slug,
        slug,
        title:
          attributes.title || attributes.city || attributes.name || "Untitled",
        // A frontmatter `slug:` (or `title:`) intentionally overrides the
        // filename-derived value: published URLs depend on it.
        ...attributes,
        // The internal discriminator always wins over a frontmatter `type:`;
        // posts carry their Seedling/Evergreen value in postType instead.
        type,
        tags: Array.isArray(attributes.tags) ? attributes.tags : [],
        body: body || "",
        // Map legacy 'type' field in posts to 'postType' to avoid conflict with content type
        postType: type === "posts" ? attributes.type : undefined,
        // Updates default to the 'note' subtype; other types don't carry one.
        updateType:
          type === "updates" ? attributes.updateType || "note" : undefined,
      };
    }
  );

  // The universal ordering rule: dated types read newest-first with an
  // alphabetical tie-break; everything else reads alphabetically. Nothing
  // is ever left in arbitrary glob order.
  const alphaValue = (item: Frontmatter): string =>
    String(item.title ?? item.name ?? item.city ?? item.slug ?? "");
  const spec = SORT_SPECS[type];
  if (spec) {
    // Malformed dates/years sort as 0 (oldest) instead of poisoning the
    // comparator with NaN, which would leave the list in undefined order.
    const sortValue = (item: Frontmatter): number => {
      const n =
        spec.kind === "year"
          ? parseInt(String(item[spec.field] || "0"), 10)
          : new Date((item[spec.field] as string) || 0).getTime();
      return Number.isNaN(n) ? 0 : n;
    };
    parsedItems.sort(
      (a, b) => sortValue(b) - sortValue(a) || alphaValue(a).localeCompare(alphaValue(b)),
    );
  } else {
    parsedItems.sort((a, b) => alphaValue(a).localeCompare(alphaValue(b)));
  }

  return parsedItems as unknown as AnyContentItem[];
}

/** Cheap fingerprint of the bundled markdown for a type (paths + sizes).
 *  Stored alongside admin edits so a later redeploy with changed markdown
 *  can be detected (the localStorage copy still wins: see ContentService). */
export function seedFingerprint(type: ContentType): string {
  const typeFiles = files[type];
  if (!typeFiles) return "";
  return Object.entries(typeFiles)
    .map(([path, content]) => `${path}:${String(content).length}`)
    .join("|");
}

export function loadSettings(): UserSettings {
  const items = loadInitialData("settings");
  return (
    (items[0] as UserSettings) || {
      id: "profile",
      type: "settings",
      name: "User",
      role: "Developer",
      location: "Earth",
      avatar: "",
      bio: "",
      body: "",
    }
  );
}

/**
 * The record's file door: the markdown committed under src/content.
 *
 * Frontmatter is untyped by nature, so every assembled item is checked before
 * it counts as a record item. A committed file that cannot produce one is an
 * authoring bug, and the throw names the file.
 */

import frontMatter from "front-matter";
import { AnyContentItem, ContentType, UserSettings } from "./model";
import { validateSeedItem } from "./schema";

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
  media: import.meta.glob("@/content/media/*.md", {
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
  media: { field: "date", kind: "date" },
};

/**
 * Reads one collection out of the bundled markdown.
 *
 * Items are ordered before they are returned, so no caller ever sees them in
 * the arbitrary order the glob produced: dated collections read newest first
 * with an alphabetical tie-break, and the rest read alphabetically.
 *
 * @param type - The collection to load.
 *
 * @returns Every item of that collection, checked and ordered. An unknown
 *   collection yields an empty list rather than an error.
 *
 * @throws RecordContractError When a committed file's frontmatter cannot produce
 *   a valid item, naming the file so the authoring bug is obvious.
 */
export function loadInitialData(type: ContentType): AnyContentItem[] {
  const typeFiles = files[type];
  if (!typeFiles) return [];

  const parsedItems: AnyContentItem[] = Object.entries(typeFiles).map(
    ([path, content]) => {
      const raw = String(content);
      const { attributes, body } = frontMatter<Frontmatter>(raw);
      const slug = path.split("/").pop()?.replace(".md", "") || "";

      const item = {
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

      // Checked here, where the offending file can still be named.
      return validateSeedItem(item, type, path);
    }
  );

  // Sorting reads fields that only some collections carry, so the dynamic
  // lookup is confined to this one helper instead of loosening the item type.
  const fieldOf = (item: AnyContentItem, field: string): unknown =>
    (item as unknown as Frontmatter)[field];

  // The universal ordering rule: dated types read newest-first with an
  // alphabetical tie-break; everything else reads alphabetically. Nothing
  // is ever left in arbitrary glob order.
  const alphaValue = (item: AnyContentItem): string =>
    String(
      fieldOf(item, "title") ??
        fieldOf(item, "name") ??
        fieldOf(item, "city") ??
        item.slug ??
        ""
    );
  const spec = SORT_SPECS[type];
  if (spec) {
    // Malformed dates/years sort as 0 (oldest) instead of poisoning the
    // comparator with NaN, which would leave the list in undefined order.
    const sortValue = (item: AnyContentItem): number => {
      const raw = fieldOf(item, spec.field);
      const n =
        spec.kind === "year"
          ? parseInt(String(raw || "0"), 10)
          : new Date((raw as string) || 0).getTime();
      return Number.isNaN(n) ? 0 : n;
    };
    parsedItems.sort(
      (a, b) => sortValue(b) - sortValue(a) || alphaValue(a).localeCompare(alphaValue(b)),
    );
  } else {
    parsedItems.sort((a, b) => alphaValue(a).localeCompare(alphaValue(b)));
  }

  return parsedItems;
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

/**
 * Reads the owner profile out of the bundled markdown.
 *
 * @returns The profile, or a neutral placeholder when no settings file exists,
 *   so a fresh copy of the template still renders.
 */
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

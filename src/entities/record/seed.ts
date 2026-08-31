/**
 * The record's file door: the markdown committed under src/content.
 *
 * Frontmatter is untyped by nature, so every assembled item is checked before
 * it counts as a record item. A committed file that cannot produce one is an
 * authoring bug, and the throw names the file.
 */

import frontMatter from "front-matter";
import { AnyContentItem, ContentType, UserSettings } from "./model";
import { DATE_FIELDS, OrderingPolicy, isOrderingPolicy, orderItems } from "./order";
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

// The ordering seed: the owner's chosen policy per section, an optional JSON
// beside the other settings seeds. An absent file, a broken one, or an
// unknown value all mean the defaults, so the record never fails to order.
const ORDERING_FILES = import.meta.glob("@/content/settings/ordering.json", {
  query: "?raw",
  import: "default",
  eager: true,
});

const orderingSeed: Record<string, unknown> = (() => {
  const raw = Object.values(ORDERING_FILES)[0];
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(String(raw));
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
})();

/**
 * The owner's chosen ordering for one section, when a valid one is seeded.
 *
 * @param key - A content type ("projects"), or a library shelf ("media/game").
 *
 * @returns The seeded policy, or undefined for the section's default.
 */
export function orderingFor(key: string): OrderingPolicy | undefined {
  const value = orderingSeed[key];
  return isOrderingPolicy(value) ? value : undefined;
}

/** The order a collection reads in when the owner has not chosen one: dated
    types newest first, everything else alphabetically. */
const defaultPolicy = (type: ContentType): OrderingPolicy =>
  DATE_FIELDS[type] ? "chronological" : "alphabetical";

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

  // Nothing is ever left in arbitrary glob order: the owner's seeded policy
  // wins, the type's default stands otherwise, and pins lead either way.
  return orderItems(parsedItems, type, orderingFor(type) ?? defaultPolicy(type));
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

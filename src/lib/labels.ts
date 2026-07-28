// Display labels for content-type enums: single source shared by the list
// pages and their dashboard grid widgets. The maps list the common values;
// the fields are open strings (any domain is valid), so unknown values get
// a capitalized fallback via typeLabel instead of being rejected.

/** Label for a possibly owner-invented type value: mapped when known,
 *  Title Case of the raw value when not. */
export const typeLabel = (
  map: Record<string, string>,
  raw?: string,
  fallback = "other",
): string => {
  const key = raw || fallback;
  return (
    map[key] ??
    key
      .split(/[-_\s]+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")
  );
};

export const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  contract: "Contract",
  freelance: "Freelance",
};

export const AWARD_TYPE_LABEL: Record<string, string> = {
  award: "Award",
  scholarship: "Scholarship",
  grant: "Grant",
  honor: "Honor",
  competition: "Competition",
};

export const PUB_TYPE_LABEL: Record<string, string> = {
  journal: "Journal",
  conference: "Conference",
  preprint: "Preprint",
  "book-chapter": "Book Chapter",
  thesis: "Thesis",
  patent: "Patent",
  poster: "Poster",
  other: "Other",
};

export const SPEAKING_TYPE_LABEL: Record<string, string> = {
  talk: "Talk",
  podcast: "Podcast",
  workshop: "Workshop",
  panel: "Panel",
  keynote: "Keynote",
  other: "Other",
};

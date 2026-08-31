/**
 * Every collection the record holds.
 *
 * The value doubles as the content folder name and the localStorage key suffix,
 * which is what lets one generic loader and one generic store serve them all.
 * `settings` is the odd one out: a single object rather than a list.
 */
export type ContentType =
  | "projects"
  | "posts"
  | "books"
  | "media"
  | "trips"
  | "countries"
  | "courses"
  | "blog"
  | "updates"
  | "experience"
  | "education"
  | "awards"
  | "publications"
  | "speaking"
  | "volunteering"
  | "certificates"
  | "references"
  | "interests"
  | "organizations"
  | "settings";

/** What every item carries, whatever collection it belongs to. */
export interface BaseContent {
  id: string | number;
  /** Filename-derived URL key; the loader sets it on every item. */
  slug: string;
  type: ContentType;
  title?: string;
  body?: string;
  tags?: string[];
  date?: string;
  story?: string; // route of the long-form piece about this item (/blog/... or /garden/...)
  /** Pinned entries lead their section, ascending, in previews and full pages alike. */
  pin?: number;
}

/** A piece of work, with the year and role that place it. */
export interface Project extends BaseContent {
  type: "projects";
  title: string;
  role: string;
  year: string;
  image?: string;
  link?: string;
  stats?: string;
  desc?: string;
  /** Legacy long-form description; body is preferred when both exist. */
  fullDesc?: string;
  /** Headlines the dashboard's Selected work chapter (first featured wins). */
  featured?: boolean;
}

/** A book, with where the reading of it currently stands. */
export interface Book extends BaseContent {
  type: "books";
  title: string;
  author: string;
  cover?: string;
  status: "Reading" | "Read" | "To Read";
  rating?: number;
  notes?: string;
}

/** Anything else the library shelves: a film, a series, an anime, a game. */
export interface MediaItem extends BaseContent {
  type: "media";
  title: string;
  /** Which shelf this sits on. Common: film | series | anime | game; any label is valid and earns its own shelf. */
  medium: string;
  /** The author-analog: a director, a studio, a developer. */
  creator?: string;
  /** Open like the medium. Common: Watched | Watching | To Watch, Played | Playing | To Play; see the stage heuristic in shelf.ts. */
  status?: string;
  rating?: number;
  image?: string;
  link?: string;
  desc?: string;
}

/** A city visited, joined to its country by an exact name match. */
export interface Trip extends BaseContent {
  type: "trips";
  city: string;
  country: string;
  flag?: string;
  image?: string;
  coordinates?: string;
  highlights?: string;
  description?: string;
}

/** A country, which renders whether or not any city entry points at it. */
export interface Country extends BaseContent {
  type: "countries";
  name: string;
  code?: string;
  flag?: string;
  image?: string;
  years?: string;
  visited?: boolean;
}

/** A garden note: an atomic, still-growing piece of knowledge. */
export interface Post extends BaseContent {
  type: "posts";
  title: string;
  desc?: string;
  postType?: string; // common: Seedling | Evergreen | List; any label is valid
}

/** A finished article, which may live canonically on another site. */
export interface BlogPost extends BaseContent {
  type: "blog";
  title: string;
  date: string;
  excerpt?: string;
  cover?: string;
  series?: string;
  readingTime?: number;
  externalUrl?: string; // canonical home elsewhere (Medium, dev.to, ...): the site links out
}

/** A short log entry: a thought, a link worth keeping, or a milestone. */
export interface Update extends BaseContent {
  type: "updates";
  date: string;
  updateType: "note" | "link" | "milestone";
  link?: string;
  linkTitle?: string;
}

/** A course taken, distinguished from education by having a provider. */
export interface Course extends BaseContent {
  type: "courses";
  title: string;
  provider: string;
  link?: string;
}

/** A role held somewhere, the backbone of a work history. */
export interface Experience extends BaseContent {
  type: "experience";
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  employmentType?: "full-time" | "part-time" | "internship" | "contract" | "freelance";
  link?: string;
}

/** A degree or programme, with the institution that granted it. */
export interface Education extends BaseContent {
  type: "education";
  title: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  degree?: string; // common: Bachelor | Master | PhD | Certificate | Diploma | Associate; any label is valid
  field?: string;
  gpa?: string;
  link?: string;
}

/** An award, scholarship, grant, or competition placing. */
export interface Award extends BaseContent {
  type: "awards";
  title: string;
  issuer: string;
  awardType?: string; // common: award | scholarship | grant | honor | competition; any domain is valid (sport, art, ...)
  amount?: string;
  link?: string;
}

/** A published work, carrying the venue and identifiers a citation needs. */
export interface Publication extends BaseContent {
  type: "publications";
  title: string;
  venue?: string;
  year?: string;
  doi?: string;
  link?: string;
  authors?: string;
  pubType?: string; // common: journal | conference | preprint | book-chapter | thesis | patent | poster | other
}

/** A talk, panel, or appearance, with links to its artifacts. */
export interface SpeakingEvent extends BaseContent {
  type: "speaking";
  title: string;
  event?: string;
  location?: string;
  date: string;
  speakingType?: string; // common: talk | podcast | workshop | panel | keynote | attendance | other
  link?: string;
  slides?: string;
  video?: string;
}

/** Unpaid work done for an organization. */
export interface Volunteering extends BaseContent {
  type: "volunteering";
  title: string;
  organization: string;
  role?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  link?: string;
}

/** A certification, with the credential id that makes it checkable. */
export interface Certificate extends BaseContent {
  type: "certificates";
  title: string;
  issuer: string;
  date?: string;
  credentialId?: string;
  link?: string;
  certType?: string; // common: technical | professional | academic | language | other
}

/** A person willing to vouch, and how to reach them. */
export interface Reference extends BaseContent {
  type: "references";
  name: string;
  title?: string;
  /** Fallback shown when `title` is empty (used by the resume builder). */
  role?: string;
  organization?: string;
  relationship?: string;
  email?: string;
  phone?: string;
  link?: string;
}

/** Something the owner does outside work. */
export interface Interest extends BaseContent {
  type: "interests";
  title: string;
  category?: string; // common: hobby | sport | creative | technical | social | other; any label is valid
}

/** A membership, professional body, or affiliation. */
export interface Organization extends BaseContent {
  type: "organizations";
  title: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  website?: string;
  memberType?: string; // common: professional | academic | community | other
}

/**
 * The owner's profile: the one item that is a single object, not a list.
 *
 * Every field is owner data, which is why none of it is ever written into source
 * and all of it arrives from a content file.
 */
export interface UserSettings extends BaseContent {
  type: "settings";
  name: string;
  role: string;
  location: string;
  avatar: string;
  bio?: string;
  focus?: string;
  email?: string;
  phone?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  scholar?: string;
  medium?: string;
  orcid?: string;
  links?: string; // free-form: one "Label: URL" per line, any platform
  skills?: string;
  languages?: string;
  nationality?: string;
  dateOfBirth?: string;
  availability?: string;
  workMode?: string;
  declaration?: string;
  now?: string;
  uses?: string;
}

/** Any item at all, which is what the generic loader and store traffic in. */
export type AnyContentItem =
  | Project
  | Book
  | MediaItem
  | Trip
  | Country
  | Post
  | BlogPost
  | Update
  | Course
  | Experience
  | Education
  | Award
  | Publication
  | SpeakingEvent
  | Volunteering
  | Certificate
  | Reference
  | Interest
  | Organization
  | UserSettings;

export type ContentType =
  | "projects"
  | "posts"
  | "books"
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
}

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

export interface Book extends BaseContent {
  type: "books";
  title: string;
  author: string;
  cover?: string;
  status: "Reading" | "Read" | "To Read";
  rating?: number;
  notes?: string;
}

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

export interface Country extends BaseContent {
  type: "countries";
  name: string;
  code?: string;
  flag?: string;
  image?: string;
  years?: string;
  visited?: boolean;
}

export interface Post extends BaseContent {
  type: "posts";
  title: string;
  desc?: string;
  postType?: string; // common: Seedling | Evergreen | List; any label is valid
}

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

export interface Update extends BaseContent {
  type: "updates";
  date: string;
  updateType: "note" | "link" | "milestone";
  link?: string;
  linkTitle?: string;
}

export interface Course extends BaseContent {
  type: "courses";
  title: string;
  provider: string;
  link?: string;
}

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

export interface Award extends BaseContent {
  type: "awards";
  title: string;
  issuer: string;
  awardType?: string; // common: award | scholarship | grant | honor | competition; any domain is valid (sport, art, ...)
  amount?: string;
  link?: string;
}

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

export interface Certificate extends BaseContent {
  type: "certificates";
  title: string;
  issuer: string;
  date?: string;
  credentialId?: string;
  link?: string;
  certType?: string; // common: technical | professional | academic | language | other
}

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

export interface Interest extends BaseContent {
  type: "interests";
  title: string;
  category?: string; // common: hobby | sport | creative | technical | social | other; any label is valid
}

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

export type AnyContentItem =
  | Project
  | Book
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

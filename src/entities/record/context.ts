/**
 * The React context carrying the loaded record.
 *
 * The context object lives apart from its provider and its hook so each file
 * exports one kind of thing: fast refresh stays intact, and no module mixes a
 * component with the values around it.
 */

import { createContext } from "react";
import {
  UserSettings,
  Project,
  Book,
  MediaItem,
  Trip,
  Country,
  Post,
  BlogPost,
  Update,
  Course,
  Experience,
  Education,
  Award,
  Publication,
  SpeakingEvent,
  Volunteering,
  Certificate,
  Reference,
  Interest,
  Organization,
} from "./model";
import type { RefusedCopy } from "./store";

/** Every collection of the record, the saved copies it set aside, and a reread. */
export interface ContentContextValue {
  projects: Project[];
  posts: Post[];
  books: Book[];
  media: MediaItem[];
  trips: Trip[];
  countries: Country[];
  blog: BlogPost[];
  updates: Update[];
  courses: Course[];
  experience: Experience[];
  education: Education[];
  awards: Award[];
  publications: Publication[];
  speaking: SpeakingEvent[];
  volunteering: Volunteering[];
  certificates: Certificate[];
  references: Reference[];
  interests: Interest[];
  organizations: Organization[];
  settings: UserSettings;
  /** Saved copies in this browser that failed their check, empty for every visitor. */
  refused: RefusedCopy[];
  refresh: () => void;
}

/** Undefined until a provider mounts, which is what lets the hook complain. */
export const ContentContext = createContext<ContentContextValue | undefined>(
  undefined
);

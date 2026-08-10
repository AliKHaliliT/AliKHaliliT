/** The provider that loads the record and holds it for the tree below. */

import { useState, type ReactNode } from "react";
import { ContentService } from "./store";
import { ContentContext } from "./context";
import {
  UserSettings,
  Project,
  Book,
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

/**
 * Loads every collection once and republishes it after an edit.
 *
 * @param props - Standard children; the subtree that may call `useContent`.
 *
 * @returns The provider element wrapping the given children.
 */
export const ContentProvider = ({ children }: { children: ReactNode }) => {
  // Lazy initializers load synchronously from localStorage / bundled markdown,
  // so consumers see real data on the very first render (no mount effect).
  const [projects, setProjects] = useState<Project[]>(
    () => ContentService.getAll("projects") as Project[]
  );
  const [posts, setPosts] = useState<Post[]>(
    () => ContentService.getAll("posts") as Post[]
  );
  const [books, setBooks] = useState<Book[]>(
    () => ContentService.getAll("books") as Book[]
  );
  const [trips, setTrips] = useState<Trip[]>(
    () => ContentService.getAll("trips") as Trip[]
  );
  const [countries, setCountries] = useState<Country[]>(
    () => ContentService.getAll("countries") as Country[]
  );
  const [blog, setBlog] = useState<BlogPost[]>(
    () => ContentService.getAll("blog") as BlogPost[]
  );
  const [updates, setUpdates] = useState<Update[]>(
    () => ContentService.getAll("updates") as Update[]
  );
  const [courses, setCourses] = useState<Course[]>(
    () => ContentService.getAll("courses") as Course[]
  );
  const [experience, setExperience] = useState<Experience[]>(
    () => ContentService.getAll("experience") as Experience[]
  );
  const [education, setEducation] = useState<Education[]>(
    () => ContentService.getAll("education") as Education[]
  );
  const [awards, setAwards] = useState<Award[]>(
    () => ContentService.getAll("awards") as Award[]
  );
  const [publications, setPublications] = useState<Publication[]>(
    () => ContentService.getAll("publications") as Publication[]
  );
  const [speaking, setSpeaking] = useState<SpeakingEvent[]>(
    () => ContentService.getAll("speaking") as SpeakingEvent[]
  );
  const [volunteering, setVolunteering] = useState<Volunteering[]>(
    () => ContentService.getAll("volunteering") as Volunteering[]
  );
  const [certificates, setCertificates] = useState<Certificate[]>(
    () => ContentService.getAll("certificates") as Certificate[]
  );
  const [references, setReferences] = useState<Reference[]>(
    () => ContentService.getAll("references") as Reference[]
  );
  const [interests, setInterests] = useState<Interest[]>(
    () => ContentService.getAll("interests") as Interest[]
  );
  const [organizations, setOrganizations] = useState<Organization[]>(
    () => ContentService.getAll("organizations") as Organization[]
  );
  const [settings, setSettings] = useState<UserSettings>(() =>
    ContentService.getSettings()
  );

  const loadAll = () => {
    setProjects(ContentService.getAll("projects") as Project[]);
    setPosts(ContentService.getAll("posts") as Post[]);
    setBooks(ContentService.getAll("books") as Book[]);
    setTrips(ContentService.getAll("trips") as Trip[]);
    setCountries(ContentService.getAll("countries") as Country[]);
    setBlog(ContentService.getAll("blog") as BlogPost[]);
    setUpdates(ContentService.getAll("updates") as Update[]);
    setCourses(ContentService.getAll("courses") as Course[]);
    setExperience(ContentService.getAll("experience") as Experience[]);
    setEducation(ContentService.getAll("education") as Education[]);
    setAwards(ContentService.getAll("awards") as Award[]);
    setPublications(ContentService.getAll("publications") as Publication[]);
    setSpeaking(ContentService.getAll("speaking") as SpeakingEvent[]);
    setVolunteering(ContentService.getAll("volunteering") as Volunteering[]);
    setCertificates(ContentService.getAll("certificates") as Certificate[]);
    setReferences(ContentService.getAll("references") as Reference[]);
    setInterests(ContentService.getAll("interests") as Interest[]);
    setOrganizations(ContentService.getAll("organizations") as Organization[]);
    setSettings(ContentService.getSettings());
  };

  return (
    <ContentContext.Provider
      value={{
        projects,
        posts,
        books,
        trips,
        countries,
        blog,
        updates,
        courses,
        experience,
        education,
        awards,
        publications,
        speaking,
        volunteering,
        certificates,
        references,
        interests,
        organizations,
        settings,
        refresh: loadAll,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

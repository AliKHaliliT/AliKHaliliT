/** Read access to the loaded record. */

import { useContext } from "react";
import { ContentContext, type ContentContextValue } from "./context";

/**
 * Reads the record from the nearest provider.
 *
 * @returns Every collection of the record and the writers that edit it.
 *
 * @throws Error When called outside a `ContentProvider`, since a silent empty
 * record would look like missing content rather than a wiring mistake.
 */
export const useContent = (): ContentContextValue => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};

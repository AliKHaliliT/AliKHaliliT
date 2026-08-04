import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pageLabel } from "@/shared/config";
import { useSiteIdentity } from "@/entities/site";

/**
 * Keeps the document title in sync with the route and the site identity:
 * "Page · {site.title}" on section pages, the bare site title on Home.
 * The build-time siteSeed plugin covers the pre-React paint.
 */
export const TitleSync = () => {
  const { pathname } = useLocation();
  const site = useSiteIdentity();

  useEffect(() => {
    const label = pageLabel(pathname);
    document.title = label ? `${label} · ${site.title}` : site.title;
  }, [pathname, site]);

  return null;
};

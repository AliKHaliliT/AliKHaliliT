import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Reset scroll on route PUSH/REPLACE. POP (back/forward) keeps the browser's
 * own position restoration so history feels native.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== "POP") window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return null;
};

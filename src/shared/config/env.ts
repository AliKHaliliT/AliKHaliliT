/**
 * Typed access to the runtime environment.
 *
 * Every read of `import.meta.env` happens in this module. The rest of the
 * site imports the frozen `env` object and stays ignorant of where
 * configuration comes from, so changing the source later touches one file.
 */

/** The runtime configuration this site reads. */
export interface Env {
  /** The path the site is served under; Vite's base, "/" in development. */
  readonly baseUrl: string;
}

/**
 * Vite's base only rewrites asset URLs, so the router has to be told the same
 * value or a project-pages deploy renders the 404 page for every route.
 */
export const env: Env = Object.freeze({
  baseUrl: import.meta.env.BASE_URL,
});

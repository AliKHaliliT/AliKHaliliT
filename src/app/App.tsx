import { AppProviders } from "./providers";
import { AppRouter } from "./router";

/** Composes the providers around the router; every page renders below this. */
export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

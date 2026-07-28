# Setup Guide

Fresh Windows setup instructions for this project.

## Prerequisites

### Node.js (v20 LTS or newer)

Download from <https://nodejs.org/> and pick the **LTS** version.

```powershell
node --version   # should be v20+
npm --version
```

### Git

Download from <https://git-scm.com/download/win>

```powershell
git --version
```

---

## Project setup

```powershell
git clone <your-repo-url>
cd vita
npm install
npm run dev
```

Open <http://localhost:5173> in your browser.

---

## Available scripts

| Script            | What it does                                             |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Start dev server with hot reload                         |
| `npm run build`   | TypeScript check + production build (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally                     |
| `npm run lint`    | Run ESLint                                               |

---

## Deploying to GitHub Pages

The site is a static build: everything in `dist/` after `npm run build`.

### GitHub Actions (committed)

The repo ships `.github/workflows/deploy.yml`: on every push to `main` it builds with
`VITE_BASE_PATH=/<repo-name>/` and publishes `dist/` via the official Pages actions.
One-time setup: repo **Settings → Pages → Source → GitHub Actions**.

- **Project page** (`username.github.io/<repo>`): works out of the box; the base
  path is derived from the repo name.
- **User/organization page or custom domain**: edit the workflow's
  `VITE_BASE_PATH` to `/`.

Deep links survive hard refreshes on Pages: the build emits a `404.html` that
redirects unknown paths back to `index.html` with the route encoded in the query
(the `spaFallback` plugin in `vite.config.ts` + the decode snippet in `index.html`).

---

## VS Code extensions (recommended)

- **Tailwind CSS IntelliSense**: autocomplete for Tailwind classes
- **ES7+ React/Redux/React-Native snippets**: React snippets
- **Prettier**: code formatting
- **ESLint**: linting in editor

---

## Updating content

Content lives as Markdown in `src/content/`. Edit files directly, then restart `npm run dev`; Vite bundles content eagerly at build time so hot reload alone is not enough.

The companion admin panel (its own repo in the VITA ecosystem) generates these seed files for you: export the edited item as `.md` (or `site.json` / `palette.json`), drop it under `src/content/`, and rebuild.

---

## Troubleshooting

**Port already in use:**
The dev server insists on port 3000 (`strictPort`) and exits if it is taken, instead of
silently moving to 3001. That is deliberate. The browser scopes localStorage per origin,
so a different port is a "new site" where your saved theme and runtime edits do not exist.
Find and stop the old server (usually a forgotten terminal), or run on an explicit
different port if you accept the fresh storage:

```powershell
npm run dev -- --port 3001
```

**Theme or edits seem to reset randomly:**
Check the address bar. If the port changed, you are on a different origin with separate
localStorage; go back to the usual port and your state is still there.

**TypeScript errors after pulling:**

```powershell
npm install   # dependencies may have changed
```

**Content not updating after editing .md files:**
Stop and restart `npm run dev`.

**npm vulnerabilities:**
Two known advisories against `react-router` concern its server-side RSC/SSR modes, which a static client-rendered site never runs; their fix is a major-version bump, so they are consciously left. Run `npm audit fix` to resolve anything else.
